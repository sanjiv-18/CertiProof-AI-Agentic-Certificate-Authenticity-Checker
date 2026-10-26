"""
Issuer adapters (Re-export shim)
Canonical location: app.services.issuer_adapters
"""

from app.services.issuer_adapters import (
    BaseIssuerAdapter,
    MockIssuerAdapter,
    CourseraPublicAdapter,
    ExtractionResult,
    get_adapter,
    ADAPTER_REGISTRY,
    MOCK_RECORDS,
)

__all__ = [
    "BaseIssuerAdapter",
    "MockIssuerAdapter",
    "CourseraPublicAdapter",
    "ExtractionResult",
    "get_adapter",
    "ADAPTER_REGISTRY",
    "MOCK_RECORDS",
]
