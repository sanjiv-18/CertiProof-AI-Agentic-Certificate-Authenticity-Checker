"""
Pydantic schemas for request/response validation.
Modern Pydantic V2 compliant.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


# ---------------------------------------------------------------------------
# Verification Schemas
# ---------------------------------------------------------------------------
class VerificationCreate(BaseModel):
    candidate_name: str = Field(..., min_length=2, max_length=200)
    credential_id: str = Field(..., min_length=1, max_length=200)
    issuer_slug: str = Field(..., min_length=1)
    course_name: str = Field(..., min_length=2, max_length=300)
    claimed_issue_date: Optional[str] = None
    candidate_consent: bool = Field(...)

    @field_validator("candidate_consent")
    @classmethod
    def validate_consent(cls, v: bool) -> bool:
        return v


class VerificationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    candidate_name: str
    credential_id: str
    issuer_slug: str
    course_name: str
    claimed_issue_date: Optional[str] = None
    candidate_consent: bool
    status: str
    outcome: Optional[str] = None
    outcome_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AgentRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    state: str
    current_step: Optional[str] = None
    steps: Optional[str] = None  # JSON string
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ApprovalDecisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    target_url: Optional[str] = None
    proposed_action: Optional[str] = None
    credential_id_to_enter: Optional[str] = None
    purpose: Optional[str] = None
    decision: Optional[str] = None
    decided_at: Optional[datetime] = None
    execution_status: Optional[str] = None


class ApprovalAction(BaseModel):
    action: str  # "APPROVE" or "CANCEL"


class EvidenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    issuer_name: Optional[str] = None
    source_url: Optional[str] = None
    retrieved_at: Optional[datetime] = None
    credential_id_used: Optional[str] = None
    extracted_candidate_name: Optional[str] = None
    extracted_course_name: Optional[str] = None
    extracted_issue_date: Optional[str] = None
    extracted_status: Optional[str] = None
    retrieval_outcome: Optional[str] = None
    screenshot_path: Optional[str] = None
    error_details: Optional[str] = None
    is_mock: bool = False


class OutcomeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    outcome: str
    reasons: Optional[str] = None
    mismatched_fields: Optional[str] = None
    decided_at: datetime


class VerificationDetail(VerificationSummary):
    model_config = ConfigDict(from_attributes=True)

    agent_run: Optional[AgentRunOut] = None
    approval_decision: Optional[ApprovalDecisionOut] = None
    evidence: Optional[EvidenceOut] = None
    outcome_record: Optional[OutcomeOut] = None


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class DashboardStats(BaseModel):
    total: int
    verified: int
    mismatch: int
    not_found: int
    unresolved: int
    not_checked: int
    pending_approvals: int


# ---------------------------------------------------------------------------
# Issuer Source Schemas
# ---------------------------------------------------------------------------
class IssuerSourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    base_url: str
    verification_url_template: Optional[str] = None
    adapter_class: str
    is_active: bool
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Test Case Schemas
# ---------------------------------------------------------------------------
class TestRunRequest(BaseModel):
    test_ids: Optional[List[str]] = None  # None means run all


class TestCaseRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    test_id: str
    test_name: str
    verification_id: Optional[str] = None
    expected_outcome: str
    actual_outcome: Optional[str] = None
    passed: Optional[bool] = None
    evidence_summary: Optional[str] = None
    run_at: datetime
    error_message: Optional[str] = None
