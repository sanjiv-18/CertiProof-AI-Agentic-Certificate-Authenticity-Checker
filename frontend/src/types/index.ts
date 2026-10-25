export type VerificationOutcome =
  | 'VERIFIED'
  | 'MISMATCH'
  | 'NOT_FOUND'
  | 'UNRESOLVED'
  | 'NOT_CHECKED';

export type VerificationStatus =
  | 'PENDING'
  | 'AWAITING_APPROVAL'
  | 'RUNNING'
  | 'DONE'
  | 'CANCELLED';

export interface VerificationSummary {
  id: string;
  candidate_name: string;
  credential_id: string;
  issuer_slug: string;
  course_name: string;
  claimed_issue_date: string | null;
  candidate_consent: boolean;
  status: VerificationStatus;
  outcome: VerificationOutcome | null;
  outcome_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentStep {
  name: string;
  status: 'RUNNING' | 'DONE' | 'ERROR' | 'SKIPPED';
  detail: string;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  state: 'IDLE' | 'PLANNING' | 'AWAITING_APPROVAL' | 'RUNNING' | 'DONE' | 'ERROR';
  current_step: string | null;
  steps: string | null; // JSON encoded AgentStep[]
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface ApprovalDecision {
  id: string;
  target_url: string | null;
  proposed_action: string | null;
  credential_id_to_enter: string | null;
  purpose: string | null;
  decision: 'APPROVED' | 'CANCELLED' | 'PENDING' | null;
  decided_at: string | null;
  execution_status: 'EXECUTED' | 'SKIPPED' | 'FAILED' | null;
}

export interface EvidenceRecord {
  id: string;
  issuer_name: string | null;
  source_url: string | null;
  retrieved_at: string | null;
  credential_id_used: string | null;
  extracted_candidate_name: string | null;
  extracted_course_name: string | null;
  extracted_issue_date: string | null;
  extracted_status: string | null;
  raw_response: string | null;
  retrieval_outcome: 'SUCCESS' | 'NOT_FOUND' | 'ERROR' | 'BLOCKED' | 'MOCK' | null;
  screenshot_path: string | null;
  error_details: string | null;
  is_mock: boolean;
}

export interface OutcomeRecord {
  id: string;
  outcome: VerificationOutcome;
  reasons: string | null; // JSON string of reasons[]
  mismatched_fields: string | null; // JSON string
  decided_at: string;
}

export interface VerificationDetail extends VerificationSummary {
  agent_run?: AgentRun | null;
  approval_decision?: ApprovalDecision | null;
  evidence?: EvidenceRecord | null;
  outcome_record?: OutcomeRecord | null;
}

export interface DashboardStats {
  total: number;
  verified: number;
  mismatch: number;
  not_found: number;
  unresolved: number;
  not_checked: number;
  pending_approvals: number;
}

export interface IssuerSource {
  id: string;
  name: string;
  slug: string;
  base_url: string;
  verification_url_template: string | null;
  adapter_class: string;
  is_active: boolean;
  notes: string | null;
}

export interface TestCaseRun {
  id: string;
  test_id: string;
  test_name: string;
  verification_id: string | null;
  expected_outcome: string;
  actual_outcome: string | null;
  passed: boolean | null;
  evidence_summary: string | null;
  run_at: string;
  error_message: string | null;
}

export interface TestCaseDefinition {
  id: string;
  name: string;
  candidate_name: string;
  credential_id: string;
  issuer_slug: string;
  course_name: string;
  claimed_issue_date: string | null;
  candidate_consent: boolean;
  expected_outcome: string;
  description: string;
}
