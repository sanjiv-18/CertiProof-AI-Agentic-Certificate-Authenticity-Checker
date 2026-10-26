"""
CertiProof AI — System Integration Test Suite
Validates end-to-end agent workflow, consent enforcement,
deterministic decision classification, and API integrity.
"""

import sys
import os
import pytest

# Ensure backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.issuer_adapters import MockIssuerAdapter, ExtractionResult
from app.services.decision_engine import (
    classify,
    OUTCOME_VERIFIED,
    OUTCOME_MISMATCH,
    OUTCOME_NOT_FOUND,
    OUTCOME_NOT_CHECKED,
    OUTCOME_UNRESOLVED,
)


@pytest.mark.asyncio
async def test_integration_tc1_verified_flow():
    """Validates complete verification lifecycle resulting in VERIFIED."""
    adapter = MockIssuerAdapter()
    evidence: ExtractionResult = await adapter.verify("CERT-TC1-MATCH")
    assert evidence.retrieval_outcome == "MOCK"
    assert evidence.extracted_candidate_name == "Arjun Sharma"

    outcome, reasons, mismatches = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=evidence,
        claimed_candidate_name="Arjun Sharma",
        claimed_course_name="Machine Learning Specialization",
        claimed_issue_date="2024-03-15",
    )
    assert outcome == OUTCOME_VERIFIED
    assert len(mismatches) == 0
    assert any("confirmed candidate 'Arjun Sharma'" in r for r in reasons)


@pytest.mark.asyncio
async def test_integration_tc2_mismatch_flow():
    """Validates certificate where returned name differs from claimed name."""
    adapter = MockIssuerAdapter()
    evidence: ExtractionResult = await adapter.verify("CERT-TC2-MISMATCH")
    assert evidence.extracted_candidate_name == "Priya Nair"

    outcome, reasons, mismatches = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=evidence,
        claimed_candidate_name="Rahul Mehta",
        claimed_course_name="Deep Learning Specialization",
        claimed_issue_date="2024-06-20",
    )
    assert outcome == OUTCOME_MISMATCH
    assert "candidate_name" in mismatches


@pytest.mark.asyncio
async def test_integration_tc3_not_found_flow():
    """Validates credential ID nonexistent on issuer registry."""
    adapter = MockIssuerAdapter()
    evidence: ExtractionResult = await adapter.verify("CERT-NONEXISTENT")
    assert evidence.retrieval_outcome == "NOT_FOUND"

    outcome, reasons, mismatches = classify(
        candidate_consent=True,
        approval_decision="APPROVED",
        result=evidence,
        claimed_candidate_name="Vikram Singh",
        claimed_course_name="Data Science",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_NOT_FOUND
    assert any("returned no record" in r for r in reasons)


def test_integration_tc4_consent_blocked_flow():
    """Validates that missing candidate consent strictly halts verification."""
    outcome, reasons, mismatches = classify(
        candidate_consent=False,
        approval_decision="APPROVED",
        result=None,
        claimed_candidate_name="Sneha Kapoor",
        claimed_course_name="AI for Everyone",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_NOT_CHECKED
    assert any("consent was not provided" in r for r in reasons)


def test_integration_approval_denied_flow():
    """Validates human disapproval halts the automated action safely."""
    outcome, reasons, mismatches = classify(
        candidate_consent=True,
        approval_decision="CANCELLED",
        result=None,
        claimed_candidate_name="Candidate",
        claimed_course_name="Course",
        claimed_issue_date=None,
    )
    assert outcome == OUTCOME_NOT_CHECKED
    assert any("Human approval was not granted" in r for r in reasons)
