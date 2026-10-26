"""
Verification Decision Engine (Re-export shim)
Canonical location: app.services.decision_engine
"""

from app.services.decision_engine import (
    classify,
    _names_match,
    _normalize,
    OUTCOME_VERIFIED,
    OUTCOME_MISMATCH,
    OUTCOME_NOT_FOUND,
    OUTCOME_UNRESOLVED,
    OUTCOME_NOT_CHECKED,
)

__all__ = [
    "classify",
    "_names_match",
    "_normalize",
    "OUTCOME_VERIFIED",
    "OUTCOME_MISMATCH",
    "OUTCOME_NOT_FOUND",
    "OUTCOME_UNRESOLVED",
    "OUTCOME_NOT_CHECKED",
]
