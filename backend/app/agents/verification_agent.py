"""
CertiProof AI — Agent Workflow Engine

Visible, traceable, step-by-step agent that:
1. Validates consent
2. Plans verification steps
3. Awaits human approval
4. Executes retrieval
5. Classifies result
6. Persists all evidence
"""

from __future__ import annotations
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app import models
from app.adapters.issuer_adapters import get_adapter, ExtractionResult
from app.core.decision_engine import classify


STEP_VALIDATE = "VALIDATE_CONSENT"
STEP_PLAN = "PLAN_STEPS"
STEP_AWAIT_APPROVAL = "AWAIT_HUMAN_APPROVAL"
STEP_RETRIEVE = "RETRIEVE_EVIDENCE"
STEP_CLASSIFY = "CLASSIFY_RESULT"
STEP_PERSIST = "PERSIST_OUTCOME"
STEP_DONE = "DONE"


def _now():
    return datetime.now(timezone.utc)


def _update_run(db: Session, run: models.AgentRun, *, state: str, step: str, steps_list: list):
    run.state = state
    run.current_step = step
    run.steps = json.dumps(steps_list)
    db.commit()


def _add_step(steps: list, name: str, status: str, detail: str = ""):
    steps.append({
        "name": name,
        "status": status,  # RUNNING | DONE | ERROR | SKIPPED
        "detail": detail,
        "timestamp": _now().isoformat(),
    })


async def run_agent(verification_id: str, db: Session) -> None:
    """
    Main agent coroutine. Runs all steps for a verification request.
    This is called after human approval is recorded.
    """
    verification = db.query(models.VerificationRequest).filter_by(id=verification_id).first()
    if not verification:
        return

    run = db.query(models.AgentRun).filter_by(verification_id=verification_id).first()
    if not run:
        return

    steps: list = json.loads(run.steps or "[]")

    # -----------------------------------------------------------------------
    # STEP 1: Validate consent
    # -----------------------------------------------------------------------
    _add_step(steps, STEP_VALIDATE, "RUNNING", "Checking candidate consent...")
    _update_run(db, run, state="RUNNING", step=STEP_VALIDATE, steps_list=steps)

    if not verification.candidate_consent:
        _add_step(steps, STEP_VALIDATE, "DONE", "Consent absent — blocking lookup.")
        verification.status = "DONE"
        verification.outcome = "NOT_CHECKED"
        verification.outcome_reason = "Candidate consent was not provided. No issuer lookup was performed."
        run.state = "DONE"
        run.current_step = STEP_DONE
        run.steps = json.dumps(steps)
        run.completed_at = _now()
        db.commit()
        _save_outcome(db, verification_id, "NOT_CHECKED", ["No consent provided."], [])
        return

    _add_step(steps, STEP_VALIDATE, "DONE", "Consent confirmed.")
    _update_run(db, run, state="RUNNING", step=STEP_VALIDATE, steps_list=steps)

    # -----------------------------------------------------------------------
    # STEP 2: Plan
    # -----------------------------------------------------------------------
    _add_step(steps, STEP_PLAN, "RUNNING", "Identifying issuer adapter and preparing verification plan...")
    _update_run(db, run, state="RUNNING", step=STEP_PLAN, steps_list=steps)

    adapter = get_adapter(verification.issuer_slug)
    if not adapter:
        _add_step(steps, STEP_PLAN, "ERROR", f"No adapter found for issuer: {verification.issuer_slug}")
        verification.status = "DONE"
        verification.outcome = "UNRESOLVED"
        verification.outcome_reason = f"No adapter configured for issuer slug '{verification.issuer_slug}'."
        run.state = "ERROR"
        run.error_message = verification.outcome_reason
        run.completed_at = _now()
        run.steps = json.dumps(steps)
        db.commit()
        return

    target_url = adapter.verification_url(verification.credential_id)
    _add_step(steps, STEP_PLAN, "DONE",
              f"Adapter: {adapter.name} | Target: {target_url}")
    _update_run(db, run, state="RUNNING", step=STEP_PLAN, steps_list=steps)

    # -----------------------------------------------------------------------
    # STEP 3: Await approval (create approval record if missing)
    # -----------------------------------------------------------------------
    approval = db.query(models.ApprovalDecision).filter_by(verification_id=verification_id).first()
    if not approval:
        approval = models.ApprovalDecision(
            verification_id=verification_id,
            target_url=target_url,
            proposed_action=f"Navigate to {target_url} and look up credential ID '{verification.credential_id}'",
            credential_id_to_enter=verification.credential_id,
            purpose="Verify certificate authenticity by querying issuer's public verification page.",
            decision="PENDING",
        )
        db.add(approval)
        db.commit()
        db.refresh(approval)

    if approval.decision == "PENDING":
        _add_step(steps, STEP_AWAIT_APPROVAL, "RUNNING", "Waiting for human approval before browser action...")
        verification.status = "AWAITING_APPROVAL"
        _update_run(db, run, state="AWAITING_APPROVAL", step=STEP_AWAIT_APPROVAL, steps_list=steps)
        return  # Resume after approval via resume_after_approval()

    if approval.decision == "CANCELLED":
        _add_step(steps, STEP_AWAIT_APPROVAL, "SKIPPED", "Human cancelled the verification action.")
        verification.status = "DONE"
        verification.outcome = "NOT_CHECKED"
        verification.outcome_reason = "Verification action was cancelled by the reviewer."
        run.state = "DONE"
        run.current_step = STEP_DONE
        run.steps = json.dumps(steps)
        run.completed_at = _now()
        db.commit()
        _save_outcome(db, verification_id, "NOT_CHECKED", ["Cancelled by reviewer."], [])
        return

    _add_step(steps, STEP_AWAIT_APPROVAL, "DONE", "Human approved the verification action.")
    _update_run(db, run, state="RUNNING", step=STEP_AWAIT_APPROVAL, steps_list=steps)

    # -----------------------------------------------------------------------
    # STEP 4: Retrieve evidence
    # -----------------------------------------------------------------------
    _add_step(steps, STEP_RETRIEVE, "RUNNING", f"Querying {adapter.name}...")
    _update_run(db, run, state="RUNNING", step=STEP_RETRIEVE, steps_list=steps)

    try:
        extraction: ExtractionResult = await adapter.verify(verification.credential_id)
        approval.execution_status = "EXECUTED"
        db.commit()
        _add_step(steps, STEP_RETRIEVE, "DONE",
                  f"Retrieval outcome: {extraction.retrieval_outcome}")
    except Exception as exc:
        extraction = ExtractionResult(
            issuer_name=adapter.name,
            source_url=target_url,
            credential_id_used=verification.credential_id,
            retrieval_outcome="ERROR",
            error_details=str(exc),
            is_mock=False,
        )
        approval.execution_status = "FAILED"
        db.commit()
        _add_step(steps, STEP_RETRIEVE, "ERROR", f"Retrieval failed: {exc}")

    # Save evidence
    existing_ev = db.query(models.EvidenceRecord).filter_by(verification_id=verification_id).first()
    if not existing_ev:
        ev = models.EvidenceRecord(
            verification_id=verification_id,
            issuer_name=extraction.issuer_name,
            source_url=extraction.source_url,
            retrieved_at=extraction.retrieved_at,
            credential_id_used=extraction.credential_id_used,
            extracted_candidate_name=extraction.extracted_candidate_name,
            extracted_course_name=extraction.extracted_course_name,
            extracted_issue_date=extraction.extracted_issue_date,
            extracted_status=extraction.extracted_status,
            raw_response=extraction.raw_response,
            retrieval_outcome=extraction.retrieval_outcome,
            screenshot_path=extraction.screenshot_path,
            error_details=extraction.error_details,
            is_mock=extraction.is_mock,
        )
        db.add(ev)
        db.commit()

    _update_run(db, run, state="RUNNING", step=STEP_RETRIEVE, steps_list=steps)

    # -----------------------------------------------------------------------
    # STEP 5: Classify
    # -----------------------------------------------------------------------
    _add_step(steps, STEP_CLASSIFY, "RUNNING", "Applying deterministic classification rules...")
    _update_run(db, run, state="RUNNING", step=STEP_CLASSIFY, steps_list=steps)

    outcome, reasons, mismatched = classify(
        candidate_consent=verification.candidate_consent,
        approval_decision=approval.decision,
        result=extraction,
        claimed_candidate_name=verification.candidate_name,
        claimed_course_name=verification.course_name,
        claimed_issue_date=verification.claimed_issue_date,
    )

    _add_step(steps, STEP_CLASSIFY, "DONE", f"Outcome: {outcome}")
    _update_run(db, run, state="RUNNING", step=STEP_CLASSIFY, steps_list=steps)

    # -----------------------------------------------------------------------
    # STEP 6: Persist outcome
    # -----------------------------------------------------------------------
    _add_step(steps, STEP_PERSIST, "RUNNING", "Saving outcome to database...")
    _update_run(db, run, state="RUNNING", step=STEP_PERSIST, steps_list=steps)

    _save_outcome(db, verification_id, outcome, reasons, mismatched)

    verification.status = "DONE"
    verification.outcome = outcome
    verification.outcome_reason = " | ".join(reasons)
    run.state = "DONE"
    run.current_step = STEP_DONE
    run.completed_at = _now()
    _add_step(steps, STEP_PERSIST, "DONE", "Outcome saved.")
    _add_step(steps, STEP_DONE, "DONE", "Agent workflow complete.")
    run.steps = json.dumps(steps)
    db.commit()


def _save_outcome(db: Session, verification_id: str, outcome: str, reasons: list, mismatched: list):
    existing = db.query(models.OutcomeRecord).filter_by(verification_id=verification_id).first()
    if not existing:
        rec = models.OutcomeRecord(
            verification_id=verification_id,
            outcome=outcome,
            reasons=json.dumps(reasons),
            mismatched_fields=json.dumps(mismatched),
        )
        db.add(rec)
        db.commit()


async def start_agent(verification_id: str, db: Session) -> None:
    """
    Initialize agent run record and start the agent workflow.
    """
    existing_run = db.query(models.AgentRun).filter_by(verification_id=verification_id).first()
    if existing_run and existing_run.state not in ("IDLE", "ERROR"):
        # Prevent duplicate execution
        return

    if not existing_run:
        run = models.AgentRun(
            verification_id=verification_id,
            state="PLANNING",
            started_at=_now(),
            steps=json.dumps([]),
        )
        db.add(run)
        db.commit()
        db.refresh(run)
    else:
        existing_run.state = "PLANNING"
        existing_run.started_at = _now()
        db.commit()

    # Run agent (in a background task in the router)
    await run_agent(verification_id, db)


async def resume_after_approval(verification_id: str, db: Session) -> None:
    """
    Called after a human approves the verification action.
    Continues from STEP_RETRIEVE onward.
    """
    await run_agent(verification_id, db)
