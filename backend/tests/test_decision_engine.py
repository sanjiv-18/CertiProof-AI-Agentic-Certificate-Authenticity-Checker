import pytest
from app.core.decision_engine import (
    classify,
    OUTCOME_VERIFIED,
    OUTCOME_MISMATCH,
    OUTCOME_NOT_FOUND,
    OUTCOME_UNRESOLVED,
    OUTCOME_NOT_CHECKED,
)
from app.adapters.issuer_adapters import ExtractionResult


def test_tc1_match():
    ev = ExtractionResult(
        issuer_name="Mock Issuer (Demo)",
        source_url="https://mock.certiproof.local/verify?id=CERT-TC1-MATCH",
        credential_id_used="CERT-TC1-MATCH",
        extracted_candidate_name="Arjun Sharma",
        extracted_course_name="Machine Learning Specialization",
        extracted_issue_date="2024-03-15",
        extracted_status="VALID",
        retrieval_outcome="MOCK",
        is_mock=True,
    )
    outcome, reasons, mismatched = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=ev,
        claimed_candidate_name="Arjun Sharma",
        claimed_course_name="Machine Learning Specialization",
        claimed_issue_date="2024-03-15",
    )
    assert outcome == OUTCOME_VERIFIED
    assert len(mismatched) == 0
    assert any("confirmed candidate 'Arjun Sharma'" in r for r in reasons)


def test_tc2_mismatch_name():
    ev = ExtractionResult(
        issuer_name="Mock Issuer (Demo)",
        source_url="https://mock.certiproof.local/verify?id=CERT-TC2-MISMATCH",
        credential_id_used="CERT-TC2-MISMATCH",
        extracted_candidate_name="Priya Nair",
        extracted_course_name="Deep Learning Specialization",
        extracted_issue_date="2024-06-20",
        extracted_status="VALID",
        retrieval_outcome="MOCK",
        is_mock=True,
    )
    outcome, reasons, mismatched = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=ev,
        claimed_candidate_name="Rahul Mehta",
        claimed_course_name="Deep Learning Specialization",
        claimed_issue_date="2024-06-20",
    )
    assert outcome == OUTCOME_MISMATCH
    assert "candidate_name" in mismatched
    assert any("Candidate name mismatch" in r for r in reasons)


def test_tc3_not_found():
    ev = ExtractionResult(
        issuer_name="Mock Issuer (Demo)",
        source_url="https://mock.certiproof.local/verify?id=CERT-TC3-NOTFOUND",
        credential_id_used="CERT-TC3-NOTFOUND",
        retrieval_outcome="NOT_FOUND",
        raw_response="No record found",
        is_mock=True,
    )
    outcome, reasons, mismatched = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=ev,
        claimed_candidate_name="Vikram Singh",
        claimed_course_name="Data Science",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_NOT_FOUND
    assert any("returned no record" in r for r in reasons)
    assert any("does not necessarily indicate fraud" in r for r in reasons)


def test_tc4_no_consent():
    outcome, reasons, mismatched = classify(
        candidate_consent=False,
        approval_decision="APPROVED",
        result=None,
        claimed_candidate_name="Sneha Kapoor",
        claimed_course_name="AI for Everyone",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_NOT_CHECKED
    assert any("consent was not provided" in r for r in reasons)


def test_no_approval():
    outcome, reasons, mismatched = classify(
        candidate_consent=True,
        approval_decision="CANCELLED",
        result=None,
        claimed_candidate_name="Arjun Sharma",
        claimed_course_name="Machine Learning Specialization",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_NOT_CHECKED
    assert any("Human approval was not granted" in r for r in reasons)


def test_retrieval_error():
    ev = ExtractionResult(
        issuer_name="Coursera",
        source_url="https://example.com",
        credential_id_used="123",
        retrieval_outcome="ERROR",
        error_details="503 Service Unavailable",
    )
    outcome, reasons, mismatched = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=ev,
        claimed_candidate_name="Arjun Sharma",
        claimed_course_name="ML",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_UNRESOLVED
    assert any("Retrieval failed" in r for r in reasons)
