"""
Verification services and business logic package.
Re-exports issuer adapters and decision engine classification.
"""

from app.services.issuer_adapters import (
    BaseIssuerAdapter,
    MockIssuerAdapter,
    CourseraPublicAdapter,
    ExtractionResult,
    get_adapter,
    ADAPTER_REGISTRY,
)
from app.services.decision_engine import (
    classify,
    OUTCOME_VERIFIED,
    OUTCOME_MISMATCH,
    OUTCOME_NOT_FOUND,
    OUTCOME_UNRESOLVED,
    OUTCOME_NOT_CHECKED,
)

__all__ = [
    "BaseIssuerAdapter",
    "MockIssuerAdapter",
    "CourseraPublicAdapter",
    "ExtractionResult",
    "get_adapter",
    "ADAPTER_REGISTRY",
    "classify",
    "OUTCOME_VERIFIED",
    "OUTCOME_MISMATCH",
    "OUTCOME_NOT_FOUND",
    "OUTCOME_UNRESOLVED",
    "OUTCOME_NOT_CHECKED",
]
