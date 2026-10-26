"""
Verifications router — CRUD + approval flow
Canonical location: app.routes.verifications
"""

from __future__ import annotations
import asyncio
import json
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.models import database_models as models
from app.models import schemas
from app.utils.database import get_db
from app.agents.verification_agent import start_agent, resume_after_approval

router = APIRouter(prefix="/api/verifications", tags=["verifications"])


def _now():
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# POST /api/verifications
# ---------------------------------------------------------------------------
@router.post("", response_model=schemas.VerificationSummary, status_code=201)
async def create_verification(
    payload: schemas.VerificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Validate issuer exists
    issuer = db.query(models.IssuerSource).filter_by(slug=payload.issuer_slug, is_active=True).first()
    if not issuer:
        raise HTTPException(status_code=422, detail=f"Unknown or inactive issuer slug: {payload.issuer_slug}")

    # Create verification record
    ver = models.VerificationRequest(
        candidate_name=payload.candidate_name,
        credential_id=payload.credential_id,
        issuer_slug=payload.issuer_slug,
        course_name=payload.course_name,
        claimed_issue_date=payload.claimed_issue_date,
        candidate_consent=payload.candidate_consent,
        consent_recorded_at=_now() if payload.candidate_consent else None,
        status="PENDING",
    )
    db.add(ver)
    db.commit()
    db.refresh(ver)

    # Consent record
    consent_rec = models.ConsentRecord(
        verification_id=ver.id,
        consent_given=payload.candidate_consent,
        notes="Submitted via verification form.",
    )
    db.add(consent_rec)
    db.commit()

    # If no consent, mark immediately as NOT_CHECKED
    if not payload.candidate_consent:
        ver.status = "DONE"
        ver.outcome = "NOT_CHECKED"
        ver.outcome_reason = "Candidate consent was not provided. No issuer lookup was performed."
        # Save outcome record
        outcome_rec = models.OutcomeRecord(
            verification_id=ver.id,
            outcome="NOT_CHECKED",
            reasons=json.dumps(["Candidate consent was not provided."]),
            mismatched_fields=json.dumps([]),
        )
        db.add(outcome_rec)
        db.commit()
    else:
        # Start agent in background
        background_tasks.add_task(_run_agent_bg, ver.id)

    db.refresh(ver)
    return ver


async def _run_agent_bg(verification_id: str):
    """Background task wrapper for agent."""
    from app.utils.database import SessionLocal
    db = SessionLocal()
    try:
        await start_agent(verification_id, db)
    finally:
        db.close()


# ---------------------------------------------------------------------------
# GET /api/verifications
# ---------------------------------------------------------------------------
@router.get("", response_model=List[schemas.VerificationSummary])
def list_verifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return (
        db.query(models.VerificationRequest)
        .order_by(models.VerificationRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------------------------
# GET /api/verifications/{id}
# ---------------------------------------------------------------------------
@router.get("/{verification_id}", response_model=schemas.VerificationDetail)
def get_verification(verification_id: str, db: Session = Depends(get_db)):
    ver = db.query(models.VerificationRequest).filter_by(id=verification_id).first()
    if not ver:
        raise HTTPException(status_code=404, detail="Verification not found")
    return ver


# ---------------------------------------------------------------------------
# POST /api/verifications/{id}/approve
# ---------------------------------------------------------------------------
@router.post("/{verification_id}/approve", response_model=schemas.VerificationDetail)
async def approve_verification(
    verification_id: str,
    payload: schemas.ApprovalAction,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ver = db.query(models.VerificationRequest).filter_by(id=verification_id).first()
    if not ver:
        raise HTTPException(status_code=404, detail="Verification not found")

    if ver.status not in ("AWAITING_APPROVAL", "PENDING"):
        raise HTTPException(
            status_code=409,
            detail=f"Verification is not awaiting approval (current status: {ver.status})"
        )

    action = payload.action.upper()
    if action not in ("APPROVE", "CANCEL"):
        raise HTTPException(status_code=422, detail="action must be 'APPROVE' or 'CANCEL'")

    approval = db.query(models.ApprovalDecision).filter_by(verification_id=verification_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="No approval record found for this verification")

    approval.decision = "APPROVED" if action == "APPROVE" else "CANCELLED"
    approval.decided_at = _now()
    db.commit()

    if action == "APPROVE":
        background_tasks.add_task(_resume_agent_bg, verification_id)
    else:
        # Cancel immediately
        ver.status = "DONE"
        ver.outcome = "NOT_CHECKED"
        ver.outcome_reason = "Verification action was cancelled by the reviewer."
        run = db.query(models.AgentRun).filter_by(verification_id=verification_id).first()
        if run:
            import json as _json
            steps = _json.loads(run.steps or "[]")
            steps.append({
                "name": "CANCELLED",
                "status": "SKIPPED",
                "detail": "Cancelled by reviewer.",
                "timestamp": _now().isoformat(),
            })
            run.steps = _json.dumps(steps)
            run.state = "DONE"
            run.completed_at = _now()
        outcome_rec = db.query(models.OutcomeRecord).filter_by(verification_id=verification_id).first()
        if not outcome_rec:
            outcome_rec = models.OutcomeRecord(
                verification_id=verification_id,
                outcome="NOT_CHECKED",
                reasons=json.dumps(["Cancelled by reviewer."]),
                mismatched_fields=json.dumps([]),
            )
            db.add(outcome_rec)
        db.commit()

    db.refresh(ver)
    return ver


async def _resume_agent_bg(verification_id: str):
    from app.utils.database import SessionLocal
    db = SessionLocal()
    try:
        await resume_after_approval(verification_id, db)
    finally:
        db.close()


# ---------------------------------------------------------------------------
# POST /api/verifications/{id}/cancel
# ---------------------------------------------------------------------------
@router.post("/{verification_id}/cancel", response_model=schemas.VerificationDetail)
def cancel_verification(verification_id: str, db: Session = Depends(get_db)):
    ver = db.query(models.VerificationRequest).filter_by(id=verification_id).first()
    if not ver:
        raise HTTPException(status_code=404, detail="Verification not found")
    if ver.status == "DONE":
        raise HTTPException(status_code=409, detail="Verification is already done")
    ver.status = "DONE"
    ver.outcome = "NOT_CHECKED"
    ver.outcome_reason = "Cancelled manually."
    db.commit()
    db.refresh(ver)
    return ver


# ---------------------------------------------------------------------------
# GET /api/verifications/{id}/evidence
# ---------------------------------------------------------------------------
@router.get("/{verification_id}/evidence", response_model=schemas.EvidenceOut)
def get_evidence(verification_id: str, db: Session = Depends(get_db)):
    ev = db.query(models.EvidenceRecord).filter_by(verification_id=verification_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="No evidence record found")
    return ev
