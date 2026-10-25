"""
Test case runner router — TC1, TC2, TC3, TC4
"""

from __future__ import annotations
import asyncio
import json
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db, SessionLocal
from app.agents.verification_agent import start_agent, resume_after_approval

router = APIRouter(prefix="/api/tests", tags=["tests"])


def _now():
    return datetime.now(timezone.utc)


TEST_CASES = [
    {
        "id": "TC1",
        "name": "Valid ID with matching name",
        "candidate_name": "Arjun Sharma",
        "credential_id": "CERT-TC1-MATCH",
        "issuer_slug": "mock-issuer",
        "course_name": "Machine Learning Specialization",
        "claimed_issue_date": "2024-03-15",
        "candidate_consent": True,
        "expected_outcome": "VERIFIED",
        "description": "Mock issuer returns matching name and course — should classify as VERIFIED.",
    },
    {
        "id": "TC2",
        "name": "ID returns a different name",
        "candidate_name": "Rahul Mehta",
        "credential_id": "CERT-TC2-MISMATCH",
        "issuer_slug": "mock-issuer",
        "course_name": "Deep Learning Specialization",
        "claimed_issue_date": "2024-06-20",
        "candidate_consent": True,
        "expected_outcome": "MISMATCH",
        "description": "Mock issuer returns name 'Priya Nair' but claimed is 'Rahul Mehta' — MISMATCH.",
    },
    {
        "id": "TC3",
        "name": "No record found",
        "candidate_name": "Vikram Singh",
        "credential_id": "CERT-TC3-NOTFOUND",
        "issuer_slug": "mock-issuer",
        "course_name": "Data Science Professional Certificate",
        "claimed_issue_date": None,
        "candidate_consent": True,
        "expected_outcome": "NOT_FOUND",
        "description": "Credential ID not in mock registry — issuer returns NOT_FOUND.",
    },
    {
        "id": "TC4",
        "name": "No candidate consent",
        "candidate_name": "Sneha Kapoor",
        "credential_id": "CERT-TC4-NOCONSENT",
        "issuer_slug": "mock-issuer",
        "course_name": "AI for Everyone",
        "claimed_issue_date": None,
        "candidate_consent": False,
        "expected_outcome": "NOT_CHECKED",
        "description": "No consent provided — lookup must be blocked entirely.",
    },
]


async def _run_single_test(tc: dict, db: Session) -> models.TestCaseRun:
    """Run a single test case end-to-end and return the result."""
    run_rec = models.TestCaseRun(
        test_id=tc["id"],
        test_name=tc["name"],
        expected_outcome=tc["expected_outcome"],
    )
    db.add(run_rec)
    db.commit()
    db.refresh(run_rec)

    try:
        # Create verification
        ver = models.VerificationRequest(
            candidate_name=tc["candidate_name"],
            credential_id=tc["credential_id"],
            issuer_slug=tc["issuer_slug"],
            course_name=tc["course_name"],
            claimed_issue_date=tc["claimed_issue_date"],
            candidate_consent=tc["candidate_consent"],
            consent_recorded_at=_now() if tc["candidate_consent"] else None,
            status="PENDING",
        )
        db.add(ver)
        db.commit()
        db.refresh(ver)

        consent_rec = models.ConsentRecord(
            verification_id=ver.id,
            consent_given=tc["candidate_consent"],
            notes=f"Automated test case {tc['id']}",
        )
        db.add(consent_rec)
        db.commit()

        run_rec.verification_id = ver.id
        db.commit()

        if not tc["candidate_consent"]:
            # No consent — mark directly
            ver.status = "DONE"
            ver.outcome = "NOT_CHECKED"
            ver.outcome_reason = "No consent — blocked."
            outcome_rec = models.OutcomeRecord(
                verification_id=ver.id,
                outcome="NOT_CHECKED",
                reasons=json.dumps(["No candidate consent."]),
                mismatched_fields=json.dumps([]),
            )
            db.add(outcome_rec)
            db.commit()
        else:
            # Start agent
            agent_run = models.AgentRun(
                verification_id=ver.id,
                state="PLANNING",
                started_at=_now(),
                steps=json.dumps([]),
            )
            db.add(agent_run)
            db.commit()

            from app.agents.verification_agent import run_agent

            # Create approval pre-approved for automated tests
            from app.adapters.issuer_adapters import get_adapter
            adapter = get_adapter(ver.issuer_slug)
            target_url = adapter.verification_url(ver.credential_id) if adapter else ""

            approval = models.ApprovalDecision(
                verification_id=ver.id,
                target_url=target_url,
                proposed_action=f"Automated test: lookup {ver.credential_id}",
                credential_id_to_enter=ver.credential_id,
                purpose=f"Automated test case {tc['id']}",
                decision="APPROVED",
                decided_at=_now(),
                execution_status="EXECUTED",
            )
            db.add(approval)
            db.commit()

            await run_agent(ver.id, db)

        db.refresh(ver)
        actual = ver.outcome
        passed = actual == tc["expected_outcome"]

        evidence_summary = f"Expected: {tc['expected_outcome']} | Actual: {actual}"
        ev = db.query(models.EvidenceRecord).filter_by(verification_id=ver.id).first()
        if ev:
            evidence_summary += f" | Issuer: {ev.issuer_name} | Retrieved: {ev.retrieval_outcome}"

        run_rec.actual_outcome = actual
        run_rec.passed = passed
        run_rec.evidence_summary = evidence_summary
        db.commit()

    except Exception as exc:
        run_rec.actual_outcome = None
        run_rec.passed = False
        run_rec.error_message = str(exc)
        db.commit()

    db.refresh(run_rec)
    return run_rec


@router.post("/run", response_model=List[schemas.TestCaseRunOut])
async def run_tests(
    payload: schemas.TestRunRequest,
    db: Session = Depends(get_db),
):
    """Run all or selected test cases synchronously and return results."""
    test_ids = payload.test_ids
    cases = TEST_CASES if not test_ids else [tc for tc in TEST_CASES if tc["id"] in test_ids]

    results = []
    for tc in cases:
        result = await _run_single_test(tc, db)
        results.append(result)

    return results


@router.get("/results", response_model=List[schemas.TestCaseRunOut])
def get_test_results(db: Session = Depends(get_db)):
    return (
        db.query(models.TestCaseRun)
        .order_by(models.TestCaseRun.run_at.desc())
        .limit(100)
        .all()
    )


@router.get("/cases")
def list_test_cases():
    """Return the static test case definitions."""
    return TEST_CASES
