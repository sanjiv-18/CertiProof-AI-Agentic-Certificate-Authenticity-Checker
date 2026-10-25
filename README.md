# CertiProof AI — Certificate Authenticity Checker

**Team:** Infinity Castle  
**Hackathon:** Ziro.Digital Agentic AI Hackathon 2026  
**Problem Statement:** Certificate Authenticity Checker  
**Industry:** Education & Career AI  

---

## 1. Executive Summary & Architecture

**CertiProof AI** is an auditable Agentic AI system designed to help enterprise recruiters verify candidate certificates against permitted public issuer verification portals. 

Unlike passive dashboards or mock prototypes, CertiProof AI executes an explicit **6-stage agentic workflow**:
1. **Consent Validation:** Verifies that candidate consent is confirmed on file before executing any lookup. If consent is absent, the lookup is strictly blocked and recorded as `NOT_CHECKED`.
2. **Step Planning:** Identifies the appropriate issuer adapter, prepares the target verification URL, and formulates browser automation steps.
3. **Human-in-the-Loop Approval:** Pauses execution and requests explicit human authorization before entering credentials or querying external issuer platforms.
4. **Permitted Evidence Retrieval:** Queries public verification endpoints using extensible issuer adapters without bypassing security restrictions.
5. **Deterministic Decision Engine:** Applies rule-based classification against candidate claims. An LLM may assist step interpretation, but never invents source evidence or overrides missing records.
6. **Immutable Audit Persistence:** Records timestamps, raw response payloads, comparison alignment, and execution state into an auditable database.

```
[ Recruiter Form ]
        │
        ▼
[ Step 1: Consent Verification ] ──(No Consent)──► [ BLOCKED: NOT_CHECKED ]
        │ (Consent Confirmed)
        ▼
[ Step 2: Agent Step Planning ]
        │
        ▼
[ Step 3: Human Approval Gate ] ──(Cancelled)──► [ SKIPPED: NOT_CHECKED ]
        │ (Recruiter Authorizes)
        ▼
[ Step 4: Permitted Retrieval ] ◄──► [ Issuer Source / Public Adapter ]
        │
        ▼
[ Step 5: Deterministic Classification ]
        │
        ├─► VERIFIED      (Evidence confirms name & required course details)
        ├─► MISMATCH      (Evidence explicitly contradicts claimed values)
        ├─► NOT_FOUND     (Source confirmed no record found; no fraud accusation)
        └─► UNRESOLVED    (Incomplete / blocked / server error)
        │
        ▼
[ Step 6: Evidence & Audit Persistence ]
```

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React
- **Design System:** `Leonxlnx/taste-skill` (High-End Awwwards-grade Ethereal Hardware Glass design, Double-Bezel nested architecture, Button-in-Button interactive physics, Plus Jakarta Sans & JetBrains Mono typography)
- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (ORM), Pydantic v2
- **Extraction & Automation:** Playwright, HTTPX, BeautifulSoup4
- **Database:** SQLite with SQLAlchemy ORM (relational audit models)
- **Testing:** Pytest, pytest-asyncio, FastAPI TestClient

---

## 3. Five Deterministic Decision Outcomes

| Outcome | Trigger Condition |
| :--- | :--- |
| **`VERIFIED`** | Issuer evidence supports claimed candidate name and course details with no unresolved material mismatches. |
| **`MISMATCH`** | Issuer evidence explicitly contradicts a required claimed field (e.g., candidate name returns a different person). |
| **`NOT_FOUND`** | The permitted source was successfully queried but returned a confirmed no-record response. *Does not accuse the candidate of fraud.* |
| **`UNRESOLVED`** | Evidence is incomplete, conflicting, inaccessible, timed out, or blocked by issuer bot controls. |
| **`NOT_CHECKED`** | The lookup was not performed, including when candidate consent is missing or human approval was cancelled. |

---

## 4. Mandatory Official Test Cases (TC1–TC4)

CertiProof AI includes an automated test runner that runs and asserts all 4 hackathon test cases:

| Test ID | Scenario | Input | Expected Outcome | Actual Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC1** | Valid ID with matching name | Candidate: *Arjun Sharma*, ID: `CERT-TC1-MATCH`, Course: *Machine Learning Specialization* | `VERIFIED` | `VERIFIED` | **PASS** |
| **TC2** | ID returns a different name | Candidate: *Rahul Mehta*, ID: `CERT-TC2-MISMATCH` (Issuer returns *Priya Nair*) | `MISMATCH` | `MISMATCH` | **PASS** |
| **TC3** | No record found | Candidate: *Vikram Singh*, ID: `CERT-TC3-NOTFOUND` (Issuer returns 404/Empty) | `NOT_FOUND` | `NOT_FOUND` | **PASS** |
| **TC4** | No candidate consent on file | Candidate: *Sneha Kapoor*, Consent: `False` (Blocked before query) | `NOT_CHECKED` | `NOT_CHECKED` | **PASS** |

All 4 test cases are deterministic and can be executed via the **Official Test Runner** screen in the UI or via `POST /api/tests/run`.

---

## 5. Getting Started & Local Setup

### Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

### Step 1: Clone & Navigate
```bash
cd "d:\ziro hackathon"
```

### Step 2: Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Run Backend Server
```powershell
# From backend directory with venv activated:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Swagger documentation is live at: `http://127.0.0.1:8000/docs`  
Health check endpoint: `http://127.0.0.1:8000/api/health`

### Step 4: Frontend Setup & Run
Open a second terminal window:
```powershell
cd "d:\ziro hackathon\frontend"
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 6. Running Automated Tests

Run backend unit and integration tests via Pytest:
```powershell
cd "d:\ziro hackathon\backend"
.\venv\Scripts\python -m pytest -v
```
All 11 tests covering the decision engine, API endpoints, consent blocking, and test cases will execute and pass.

---

## 7. Judge & Demonstration Script

Follow this 5-minute workflow during the live hackathon demonstration:

1. **Overview Dashboard (`/`):**
   - Note the real database-derived counts (Total, Verified, Mismatch, Not Found, Unresolved, Not Checked).
   - Point out that there are no simulated or fake metrics.

2. **Step A — Recruiter Input (`New Verification`):**
   - Click the preset button **"Match Case (TC1)"** to populate synthetic data for *Arjun Sharma*.
   - Verify that **Candidate Consent** is checked.
   - Click **Submit & Plan Verification**.

3. **Step C — Human Approval Queue (`Approval Queue`):**
   - Show the approval card displaying the target issuer URL (`https://mock.certiproof.local/verify`), proposed browser action, credential ID, and purpose.
   - Click **Authorize & Execute**.

4. **Step D & E — Results & Evidence Viewer:**
   - Review the **`VERIFIED`** badge and deterministic reasons.
   - Expand the **Agent Execution Workflow** showing the 6 traceable steps with timestamps.
   - Click **Inspect Evidence** to view the field-by-field comparison (Claimed vs Extracted) and the raw payload. Note the explicit **MOCK DEMO** tag distinguishing test simulators from real sources.

5. **Test Case 4 — Privacy Guardrail (No Consent):**
   - Return to **New Verification**, click **"No Consent Blocked (TC4)"** (unchecks consent).
   - Submit the form. Notice the system blocks the lookup instantly without contacting the issuer, assigning `NOT_CHECKED`.

6. **Official Test Runner:**
   - Navigate to **Official Test Runner**.
   - Click **Run All 4 Official Test Cases**.
   - Watch the live assertion engine validate TC1, TC2, TC3, and TC4 with green **PASS** indicators.

---

## 8. Extensible Issuer Adapters & Safety Guardrails

### Adding a New Issuer Source
Implement `BaseIssuerAdapter` in `backend/app/adapters/issuer_adapters.py`:
```python
class CustomIssuerAdapter(BaseIssuerAdapter):
    name = "Custom Platform"
    slug = "custom-platform"
    base_url = "https://platform.example.com"
    
    async def verify(self, credential_id: str, **kwargs) -> ExtractionResult:
        # Perform permitted HTTP query or headless navigation
        ...
```

### Safety & Ethical Automation Rules
- **No CAPTCHA / OTP Circumvention:** The agent never attempts to bypass bot challenge walls or two-factor protections.
- **Fail-Safe Classification:** If an issuer portal is down or rate-limited, the outcome is classified as `UNRESOLVED`, never converted to `NOT_FOUND` or `VERIFIED`.
- **Privacy Minimization:** Only credential identifiers and candidate names are processed. No candidate PII is exported.
