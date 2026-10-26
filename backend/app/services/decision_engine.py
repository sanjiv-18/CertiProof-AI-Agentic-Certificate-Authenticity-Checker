"""
CertiProof AI — Verification Decision Engine
Deterministic classification rules.
Canonical location: app.services.decision_engine
"""

from __future__ import annotations
from typing import Optional
from app.services.issuer_adapters import ExtractionResult


OUTCOME_VERIFIED = "VERIFIED"
OUTCOME_MISMATCH = "MISMATCH"
OUTCOME_NOT_FOUND = "NOT_FOUND"
OUTCOME_UNRESOLVED = "UNRESOLVED"
OUTCOME_NOT_CHECKED = "NOT_CHECKED"


def _normalize(s: Optional[str]) -> str:
    if s is None:
        return ""
    return s.strip().lower()


def _names_match(claimed: str, extracted: str) -> bool:
    """Case-insensitive name comparison with basic normalization."""
    c = _normalize(claimed)
    e = _normalize(extracted)
    if not c or not e:
        return False
    return c == e


def classify(
    *,
    candidate_consent: bool,
    approval_decision: Optional[str],
    result: Optional[ExtractionResult],
    claimed_candidate_name: str,
    claimed_course_name: str,
    claimed_issue_date: Optional[str],
) -> tuple[str, list[str], list[str]]:
    """
    Returns (outcome, reasons, mismatched_fields).

    Rules (applied in order):
    1. No consent -> NOT_CHECKED
    2. Approval not granted -> NOT_CHECKED
    3. No result object -> UNRESOLVED
    4. Retrieval outcome is ERROR or BLOCKED -> UNRESOLVED
    5. Retrieval outcome is NOT_FOUND -> NOT_FOUND
    6. Name mismatch -> MISMATCH
    7. Course mismatch -> MISMATCH (if extracted and contradicts)
    8. Everything aligns -> VERIFIED
    """
    reasons: list[str] = []
    mismatched: list[str] = []

    # Rule 1: consent
    if not candidate_consent:
        reasons.append("Candidate consent was not provided. No issuer lookup was performed.")
        return OUTCOME_NOT_CHECKED, reasons, mismatched

    # Rule 2: approval
    if approval_decision != "APPROVED":
        reasons.append(f"Human approval was not granted (decision: {approval_decision}). No retrieval was executed.")
        return OUTCOME_NOT_CHECKED, reasons, mismatched

    # Rule 3: no result
    if result is None:
        reasons.append("No retrieval result was produced. Cannot make a decision.")
        return OUTCOME_UNRESOLVED, reasons, mismatched

    # Rule 4: retrieval errors
    if result.retrieval_outcome in ("ERROR", "BLOCKED"):
        reasons.append(f"Retrieval failed: {result.error_details or result.retrieval_outcome}. Evidence is insufficient.")
        return OUTCOME_UNRESOLVED, reasons, mismatched

    # Rule 5: not found
    if result.retrieval_outcome == "NOT_FOUND":
        reasons.append(
            f"The issuer source ({result.issuer_name}) returned no record for credential ID "
            f"'{result.credential_id_used}'. This does not necessarily indicate fraud."
        )
        return OUTCOME_NOT_FOUND, reasons, mismatched

    # Rules 6–8: compare extracted vs claimed
    # Name check (required)
    if result.extracted_candidate_name is None:
        reasons.append("Issuer returned no candidate name. Cannot confirm identity.")
        return OUTCOME_UNRESOLVED, reasons, mismatched

    if not _names_match(claimed_candidate_name, result.extracted_candidate_name):
        reasons.append(
            f"Candidate name mismatch: claimed '{claimed_candidate_name}', "
            f"issuer returned '{result.extracted_candidate_name}'."
        )
        mismatched.append("candidate_name")

    # Course check (informational — only flag mismatch if extracted contradicts)
    if result.extracted_course_name and not _normalize(claimed_course_name) in _normalize(result.extracted_course_name):
        reasons.append(
            f"Course name mismatch: claimed '{claimed_course_name}', "
            f"issuer returned '{result.extracted_course_name}'."
        )
        mismatched.append("course_name")

    if mismatched:
        return OUTCOME_MISMATCH, reasons, mismatched

    # All checks passed
    reasons.append(
        f"Issuer ({result.issuer_name}) confirmed candidate '{result.extracted_candidate_name}' "
        f"for course '{result.extracted_course_name or claimed_course_name}'. "
        f"No material mismatches detected."
    )
    return OUTCOME_VERIFIED, reasons, mismatched
