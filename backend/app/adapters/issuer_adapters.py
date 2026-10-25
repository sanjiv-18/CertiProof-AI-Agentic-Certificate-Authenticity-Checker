"""
CertiProof AI — Issuer Adapter Base + Mock Adapter
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class ExtractionResult:
    """Represents what was extracted from an issuer source."""
    issuer_name: str
    source_url: str
    credential_id_used: str
    retrieved_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    # Extracted fields (None = not found / not available)
    extracted_candidate_name: Optional[str] = None
    extracted_course_name: Optional[str] = None
    extracted_issue_date: Optional[str] = None
    extracted_status: Optional[str] = None
    raw_response: Optional[str] = None
    # Retrieval meta
    retrieval_outcome: str = "SUCCESS"  # SUCCESS | NOT_FOUND | ERROR | BLOCKED | MOCK
    screenshot_path: Optional[str] = None
    error_details: Optional[str] = None
    is_mock: bool = False


class BaseIssuerAdapter(ABC):
    """Abstract base class for issuer verification adapters."""

    name: str = "Base"
    slug: str = "base"
    base_url: str = ""
    adapter_class: str = "BaseIssuerAdapter"

    @abstractmethod
    async def verify(self, credential_id: str, **kwargs) -> ExtractionResult:
        """
        Attempt to verify a credential on the issuer platform.
        Must never invent results — return NOT_FOUND or ERROR when appropriate.
        """
        ...

    def verification_url(self, credential_id: str) -> str:
        return self.base_url


# ---------------------------------------------------------------------------
# MOCK ADAPTER — deterministic, clearly labelled
# ---------------------------------------------------------------------------

# Deterministic test fixtures — keyed by credential_id
MOCK_RECORDS = {
    "CERT-TC1-MATCH": {
        "candidate_name": "Arjun Sharma",
        "course_name": "Machine Learning Specialization",
        "issue_date": "2024-03-15",
        "status": "VALID",
    },
    "CERT-TC2-MISMATCH": {
        "candidate_name": "Priya Nair",          # Different from claimed "Rahul Mehta"
        "course_name": "Deep Learning Specialization",
        "issue_date": "2024-06-20",
        "status": "VALID",
    },
    # TC3: credential not in mock DB → NOT_FOUND
    # TC4: no consent → adapter never called
}


class MockIssuerAdapter(BaseIssuerAdapter):
    """
    Deterministic mock issuer adapter for testing.
    Clearly labelled — never presents results as real issuer data.
    """

    name = "Mock Issuer (Demo)"
    slug = "mock-issuer"
    base_url = "https://mock.certiproof.local/verify"
    adapter_class = "MockIssuerAdapter"

    async def verify(self, credential_id: str, **kwargs) -> ExtractionResult:
        base = ExtractionResult(
            issuer_name=self.name,
            source_url=f"{self.base_url}?id={credential_id}",
            credential_id_used=credential_id,
            is_mock=True,
            retrieval_outcome="MOCK",
        )

        record = MOCK_RECORDS.get(credential_id)
        if record is None:
            base.retrieval_outcome = "NOT_FOUND"
            base.raw_response = f"[MOCK] No record found for credential ID: {credential_id}"
            return base

        base.extracted_candidate_name = record["candidate_name"]
        base.extracted_course_name = record["course_name"]
        base.extracted_issue_date = record["issue_date"]
        base.extracted_status = record["status"]
        base.raw_response = f"[MOCK] Record retrieved: {record}"
        return base

    def verification_url(self, credential_id: str) -> str:
        return f"{self.base_url}?id={credential_id}"


# ---------------------------------------------------------------------------
# Coursera Public Adapter (httpx-based, no auth)
# ---------------------------------------------------------------------------
class CourseraPublicAdapter(BaseIssuerAdapter):
    """
    Attempts to retrieve public Coursera certificate data via their
    public /api/accomplishments endpoint. Falls back gracefully.
    """

    name = "Coursera"
    slug = "coursera"
    base_url = "https://www.coursera.org"
    adapter_class = "CourseraPublicAdapter"

    async def verify(self, credential_id: str, **kwargs) -> ExtractionResult:
        import httpx
        url = f"https://www.coursera.org/api/accomplishments.v1/{credential_id}"
        result = ExtractionResult(
            issuer_name=self.name,
            source_url=url,
            credential_id_used=credential_id,
            is_mock=False,
        )
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, headers={"Accept": "application/json"})
            if resp.status_code == 404:
                result.retrieval_outcome = "NOT_FOUND"
                result.raw_response = "[Coursera] 404 – no record found"
                return result
            if resp.status_code != 200:
                result.retrieval_outcome = "ERROR"
                result.error_details = f"HTTP {resp.status_code}"
                result.raw_response = resp.text[:500]
                return result
            data = resp.json()
            elements = data.get("elements", [])
            if not elements:
                result.retrieval_outcome = "NOT_FOUND"
                return result
            el = elements[0]
            result.extracted_candidate_name = el.get("fullName")
            result.extracted_course_name = el.get("courseName") or el.get("specializationName")
            result.extracted_issue_date = el.get("completionTime")
            result.extracted_status = "VALID" if el.get("isActive") else "UNKNOWN"
            result.raw_response = str(el)[:1000]
            result.retrieval_outcome = "SUCCESS"
        except httpx.TimeoutException:
            result.retrieval_outcome = "ERROR"
            result.error_details = "Request timed out"
        except Exception as exc:
            result.retrieval_outcome = "ERROR"
            result.error_details = str(exc)
        return result

    def verification_url(self, credential_id: str) -> str:
        return f"https://www.coursera.org/account/accomplishments/certificate/{credential_id}"


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------
ADAPTER_REGISTRY: dict[str, BaseIssuerAdapter] = {
    "mock-issuer": MockIssuerAdapter(),
    "coursera": CourseraPublicAdapter(),
}


def get_adapter(slug: str) -> Optional[BaseIssuerAdapter]:
    return ADAPTER_REGISTRY.get(slug)
