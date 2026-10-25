"""
CertiProof AI — SQLAlchemy ORM Models
All timestamps are UTC. UUIDs are stored as strings.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Float, ForeignKey, Integer
)
from sqlalchemy.orm import relationship
from app.database import Base


def _now():
    return datetime.now(timezone.utc)


def _uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Issuer Sources
# ---------------------------------------------------------------------------
class IssuerSource(Base):
    __tablename__ = "issuer_sources"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True)
    base_url = Column(String, nullable=False)
    verification_url_template = Column(String, nullable=True)
    adapter_class = Column(String, nullable=False)  # e.g. "MockAdapter"
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)

    verifications = relationship("VerificationRequest", back_populates="issuer_source")


# ---------------------------------------------------------------------------
# Verification Request
# ---------------------------------------------------------------------------
class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String, primary_key=True, default=_uuid)
    # Claimed certificate fields
    candidate_name = Column(String, nullable=False)
    credential_id = Column(String, nullable=False)
    issuer_slug = Column(String, ForeignKey("issuer_sources.slug"), nullable=False)
    course_name = Column(String, nullable=False)
    claimed_issue_date = Column(String, nullable=True)
    # Consent
    candidate_consent = Column(Boolean, nullable=False, default=False)
    consent_recorded_at = Column(DateTime(timezone=True), nullable=True)
    # Status lifecycle
    status = Column(String, default="PENDING")  # PENDING | AWAITING_APPROVAL | RUNNING | DONE | CANCELLED
    outcome = Column(String, nullable=True)  # VERIFIED | MISMATCH | NOT_FOUND | UNRESOLVED | NOT_CHECKED
    outcome_reason = Column(Text, nullable=True)
    # Audit
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    issuer_source = relationship("IssuerSource", back_populates="verifications")
    consent_record = relationship("ConsentRecord", back_populates="verification", uselist=False)
    agent_run = relationship("AgentRun", back_populates="verification", uselist=False)
    approval_decision = relationship("ApprovalDecision", back_populates="verification", uselist=False)
    evidence = relationship("EvidenceRecord", back_populates="verification", uselist=False)
    outcome_record = relationship("OutcomeRecord", back_populates="verification", uselist=False)


# ---------------------------------------------------------------------------
# Consent Record
# ---------------------------------------------------------------------------
class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String, primary_key=True, default=_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False, unique=True)
    consent_given = Column(Boolean, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=_now)
    notes = Column(Text, nullable=True)

    verification = relationship("VerificationRequest", back_populates="consent_record")


# ---------------------------------------------------------------------------
# Agent Run
# ---------------------------------------------------------------------------
class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False, unique=True)
    steps = Column(Text, nullable=True)  # JSON array of step objects
    current_step = Column(String, nullable=True)
    state = Column(String, default="IDLE")  # IDLE | PLANNING | AWAITING_APPROVAL | RUNNING | DONE | ERROR
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    verification = relationship("VerificationRequest", back_populates="agent_run")


# ---------------------------------------------------------------------------
# Human Approval Decision
# ---------------------------------------------------------------------------
class ApprovalDecision(Base):
    __tablename__ = "approval_decisions"

    id = Column(String, primary_key=True, default=_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False, unique=True)
    target_url = Column(String, nullable=True)
    proposed_action = Column(Text, nullable=True)
    credential_id_to_enter = Column(String, nullable=True)
    purpose = Column(Text, nullable=True)
    decision = Column(String, nullable=True)  # APPROVED | CANCELLED | PENDING
    decided_at = Column(DateTime(timezone=True), nullable=True)
    execution_status = Column(String, nullable=True)  # EXECUTED | SKIPPED | FAILED

    verification = relationship("VerificationRequest", back_populates="approval_decision")


# ---------------------------------------------------------------------------
# Evidence Record
# ---------------------------------------------------------------------------
class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id = Column(String, primary_key=True, default=_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False, unique=True)
    issuer_name = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    retrieved_at = Column(DateTime(timezone=True), nullable=True)
    credential_id_used = Column(String, nullable=True)
    extracted_candidate_name = Column(String, nullable=True)
    extracted_course_name = Column(String, nullable=True)
    extracted_issue_date = Column(String, nullable=True)
    extracted_status = Column(String, nullable=True)
    raw_response = Column(Text, nullable=True)
    retrieval_outcome = Column(String, nullable=True)  # SUCCESS | NOT_FOUND | ERROR | BLOCKED | MOCK
    screenshot_path = Column(String, nullable=True)
    error_details = Column(Text, nullable=True)
    is_mock = Column(Boolean, default=False)

    verification = relationship("VerificationRequest", back_populates="evidence")


# ---------------------------------------------------------------------------
# Verification Outcome
# ---------------------------------------------------------------------------
class OutcomeRecord(Base):
    __tablename__ = "outcome_records"

    id = Column(String, primary_key=True, default=_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False, unique=True)
    outcome = Column(String, nullable=False)  # VERIFIED | MISMATCH | NOT_FOUND | UNRESOLVED | NOT_CHECKED
    reasons = Column(Text, nullable=True)  # JSON list
    mismatched_fields = Column(Text, nullable=True)  # JSON list
    decided_at = Column(DateTime(timezone=True), default=_now)

    verification = relationship("VerificationRequest", back_populates="outcome_record")


# ---------------------------------------------------------------------------
# Test Case Run
# ---------------------------------------------------------------------------
class TestCaseRun(Base):
    __tablename__ = "test_case_runs"

    id = Column(String, primary_key=True, default=_uuid)
    test_id = Column(String, nullable=False)  # TC1 | TC2 | TC3 | TC4
    test_name = Column(String, nullable=False)
    verification_id = Column(String, nullable=True)
    expected_outcome = Column(String, nullable=False)
    actual_outcome = Column(String, nullable=True)
    passed = Column(Boolean, nullable=True)
    evidence_summary = Column(Text, nullable=True)
    run_at = Column(DateTime(timezone=True), default=_now)
    error_message = Column(Text, nullable=True)
