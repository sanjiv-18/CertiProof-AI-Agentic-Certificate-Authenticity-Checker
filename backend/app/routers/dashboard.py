"""
Dashboard stats router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.VerificationRequest.id)).scalar() or 0

    def count_outcome(outcome: str) -> int:
        return (
            db.query(func.count(models.VerificationRequest.id))
            .filter(models.VerificationRequest.outcome == outcome)
            .scalar()
            or 0
        )

    pending_approvals = (
        db.query(func.count(models.ApprovalDecision.id))
        .filter(models.ApprovalDecision.decision == "PENDING")
        .scalar()
        or 0
    )

    return schemas.DashboardStats(
        total=total,
        verified=count_outcome("VERIFIED"),
        mismatch=count_outcome("MISMATCH"),
        not_found=count_outcome("NOT_FOUND"),
        unresolved=count_outcome("UNRESOLVED"),
        not_checked=count_outcome("NOT_CHECKED"),
        pending_approvals=pending_approvals,
    )
