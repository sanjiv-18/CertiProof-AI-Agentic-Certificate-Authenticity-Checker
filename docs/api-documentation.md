# CertiProof AI — REST API Documentation

CertiProof AI exposes a complete, self-documenting RESTful API built with **FastAPI**.

When running locally or in staging, interactive documentation is available at:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## 1. System Health & Metadata

### `GET /api/health`
Validates that the backend service and serverless container are operational.

#### Response `200 OK`
```json
{
  "status": "ok",
  "service": "CertiProof AI",
  "version": "1.0.0"
}
```

---

## 2. Dashboard & Metrics

### `GET /api/dashboard/stats`
Aggregates real-time verification metrics and pending approval counts.

#### Response `200 OK`
```json
{
  "total": 42,
  "verified": 28,
  "mismatch": 6,
  "not_found": 5,
  "unresolved": 1,
  "not_checked": 2,
  "pending_approvals": 3
}
```

---

## 3. Issuer Sources

### `GET /api/issuers`
Returns all active verification adapters registered in the database.

#### Response `200 OK`
```json
[
  {
    "id": "eacd0cb1-3e6e-455a-8473-0819f86b7995",
    "name": "Mock Issuer (Demo)",
    "slug": "mock-issuer",
    "base_url": "https://mock.certiproof.local/verify",
    "verification_url_template": "https://mock.certiproof.local/verify?id={credential_id}",
    "adapter_class": "MockIssuerAdapter",
    "is_active": true,
    "notes": "Deterministic mock adapter for automated testing. Results are clearly labelled as MOCK."
  },
  {
    "id": "ac29c40d-2e64-4e7b-9817-f9c310aaeeb8",
    "name": "Coursera",
    "slug": "coursera",
    "base_url": "https://www.coursera.org",
    "verification_url_template": "https://www.coursera.org/account/accomplishments/certificate/{credential_id}",
    "adapter_class": "CourseraPublicAdapter",
    "is_active": true,
    "notes": "Uses Coursera public API. Requires valid public credential ID."
  }
]
```

---

## 4. Verification Lifecycle

### `POST /api/verifications`
Submit candidate certificate details for verification.

#### Request Body
```json
{
  "candidate_name": "Arjun Sharma",
  "credential_id": "CERT-TC1-MATCH",
  "issuer_slug": "mock-issuer",
  "course_name": "Machine Learning Specialization",
  "claimed_issue_date": "2024-03-15",
  "candidate_consent": true
}
```

> [!IMPORTANT]
> If `candidate_consent` is `false`, the request is immediately recorded with status `DONE` and outcome `NOT_CHECKED`. No external lookup or planning step is executed.

#### Response `201 Created`
```json
{
  "id": "7ef2b374-6737-4cd0-a64c-80d57cc01bbf",
  "candidate_name": "Arjun Sharma",
  "credential_id": "CERT-TC1-MATCH",
  "issuer_slug": "mock-issuer",
  "course_name": "Machine Learning Specialization",
  "claimed_issue_date": "2024-03-15",
  "candidate_consent": true,
  "status": "AWAITING_APPROVAL",
  "outcome": null,
  "outcome_reason": null,
  "created_at": "2026-10-25T17:34:37.646056Z",
  "updated_at": "2026-10-25T17:34:37.646056Z"
}
```

---

### `GET /api/verifications`
List recent verifications with pagination.

- **Query Parameters:**
  - `skip` (integer, default: 0)
  - `limit` (integer, default: 50)

---

### `GET /api/verifications/{verification_id}`
Retrieve complete verification audit history, including agent execution steps, approval decision, evidence record, and final outcome classification.

#### Response `200 OK`
```json
{
  "id": "7ef2b374-6737-4cd0-a64c-80d57cc01bbf",
  "candidate_name": "Arjun Sharma",
  "credential_id": "CERT-TC1-MATCH",
  "issuer_slug": "mock-issuer",
  "course_name": "Machine Learning Specialization",
  "status": "DONE",
  "outcome": "VERIFIED",
  "outcome_reason": "Issuer (Mock Issuer (Demo)) confirmed candidate 'Arjun Sharma' for course 'Machine Learning Specialization'. No material mismatches detected.",
  "approval_decision": {
    "decision": "APPROVED",
    "target_url": "https://mock.certiproof.local/verify?id=CERT-TC1-MATCH",
    "execution_status": "EXECUTED"
  },
  "evidence": {
    "issuer_name": "Mock Issuer (Demo)",
    "extracted_candidate_name": "Arjun Sharma",
    "extracted_course_name": "Machine Learning Specialization",
    "retrieval_outcome": "MOCK",
    "is_mock": true
  }
}
```

---

### `POST /api/verifications/{verification_id}/approve`
Human approval gate checkpoint. Authorize or reject automated navigation.

#### Request Body
```json
{
  "action": "APPROVE"
}
```
*(Accepts `"APPROVE"` or `"CANCEL"`).*

---

### `GET /api/verifications/{verification_id}/evidence`
Retrieve standalone evidence payload, raw API responses, and screenshot path.

---

## 5. Automated Test Runner

### `POST /api/tests/run`
Synchronously execute official hackathon test cases (`TC1`–`TC4`).

#### Request Body
```json
{
  "test_ids": ["TC1", "TC2", "TC3", "TC4"]
}
```
*(Pass empty `{}` or omit `test_ids` to run all test cases).*

#### Response `200 OK`
```json
[
  {
    "test_id": "TC1",
    "test_name": "Valid ID with matching name",
    "expected_outcome": "VERIFIED",
    "actual_outcome": "VERIFIED",
    "passed": true,
    "evidence_summary": "Expected: VERIFIED | Actual: VERIFIED | Issuer: Mock Issuer (Demo) | Retrieved: MOCK"
  },
  {
    "test_id": "TC2",
    "test_name": "ID returns a different name",
    "expected_outcome": "MISMATCH",
    "actual_outcome": "MISMATCH",
    "passed": true,
    "evidence_summary": "Expected: MISMATCH | Actual: MISMATCH | Issuer: Mock Issuer (Demo) | Retrieved: MOCK"
  },
  {
    "test_id": "TC3",
    "test_name": "No record found",
    "expected_outcome": "NOT_FOUND",
    "actual_outcome": "NOT_FOUND",
    "passed": true,
    "evidence_summary": "Expected: NOT_FOUND | Actual: NOT_FOUND | Issuer: Mock Issuer (Demo) | Retrieved: NOT_FOUND"
  },
  {
    "test_id": "TC4",
    "test_name": "No candidate consent",
    "expected_outcome": "NOT_CHECKED",
    "actual_outcome": "NOT_CHECKED",
    "passed": true,
    "evidence_summary": "Expected: NOT_CHECKED | Actual: NOT_CHECKED"
  }
]
```
