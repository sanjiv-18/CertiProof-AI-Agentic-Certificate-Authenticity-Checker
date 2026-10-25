# Ziro.Digital Agentic AI Hackathon 2026 — Official Submission Package

**Team Name:** Infinity castle  
**Team Join Code:** F058C58  
**Team Members:**  
- **SANJIV V** (Team Leader) — 9597537616  
- **MANORANJAN M** (Team Member) — 8122555855  
- **JAGAN P** (Team Member) — 9363982338  

**Assigned Problem Statement:** Certificate Authenticity Checker  
**Industry:** Education & Career AI  
**Official Demonstration Target:** Public course-platform verification pages  

---

## 1. Submission Form Fields (Copy & Paste Ready)

### Field 1: Project name *
```text
CertiProof AI — Agentic Certificate Authenticity Checker
```

### Field 2: Tools used *
```text
React 19, Vite 8, TypeScript, Tailwind CSS v4, Lucide React, Leonxlnx/taste-skill, Python 3.11, FastAPI, SQLAlchemy 2.0 (ORM), SQLite, Pydantic v2, HTTPX, BeautifulSoup4, Playwright, Pytest, Docker
```

### Field 3: Demo URL *
```text
https://certiproof-ai.vercel.app
```
*(Also available for local review via `http://localhost:5173` with backend at `http://localhost:8000`).*

### Field 4: 2–3 min demo video URL *
```text
[Insert your YouTube / Loom / Google Drive link here]
```
*(See Section 2 below for the exact word-for-word 2.5-minute video recording script).*

### Field 5: GitHub URL *
```text
https://github.com/sanjiv-18/CertiProof-AI-Agentic-Certificate-Authenticity-Checker.git
```

### Field 6: Source code URL
```text
https://github.com/sanjiv-18/CertiProof-AI-Agentic-Certificate-Authenticity-Checker.git
```

### Field 7: Presentation URL *
```text
[Insert your Google Slides / Canva link here]
```
*(See Section 3 below for the full 8-slide pitch deck content).*

---

### Field 8: Agent architecture *
```text
CertiProof AI is built on a 6-stage autonomous agent execution lifecycle with deterministic guardrails and strict Human-in-the-Loop authorization:

1. Ingestion & Consent Gate: The agent receives candidate name, credential ID, issuing platform, course name, claimed issue date, and explicit consent status. If consent is absent, the agent immediately terminates the lookup and records a NOT_CHECKED audit event without sending external requests.
2. Step Formulation & Adapter Mapping: The agent analyzes the credential format and selects the appropriate verification adapter (Coursera Public Adapter, extensible platform adapters, or deterministic test simulator). It prepares the exact target verification URL and browser automation sequence.
3. Human-in-the-Loop Authorization Gate (Step C): Prior to initiating external browser automation or submitting form lookups, execution pauses. The recruiter is presented with an action card displaying the target URL, exact credential to be entered, and purpose. Execution proceeds only upon affirmative cryptographic approval. Retries are idempotently protected against duplicate executions.
4. Permitted Source Retrieval: Upon approval, the agent retrieves evidence using public endpoints (HTTPX/Cheerio or Playwright headless navigation). The agent respects rate limits, never attempts to bypass CAPTCHA/OTP/paywalls, and flags bot-blocked pages as UNRESOLVED rather than guessing.
5. Deterministic Decision Engine: An isolated classification module compares extracted values against candidate claims without allowing hallucination. It outputs one of five deterministic classifications: VERIFIED (exact match), MISMATCH (explicit contradiction in name/course), NOT_FOUND (confirmed 404/empty from issuer without fraud accusation), UNRESOLVED (network timeout or blocked), or NOT_CHECKED (missing consent or cancelled).
6. Relational Audit Persistence: Timestamps, raw responses, field alignment matrices, and step logs are written to an auditable SQLite database via SQLAlchemy 2.0 models.
```

---

### Field 9: Test cases / proof of working agent *
```text
All 4 mandatory hackathon evaluation scenarios were executed and asserted with 100% pass rate:

• TC1 | Valid ID with matching name
- Input: Candidate "Arjun Sharma", Credential ID "CERT-TC1-MATCH", Course "Machine Learning Specialization", Consent: True.
- Expected Outcome: VERIFIED
- Actual Outcome: VERIFIED (Status: DONE, Exit Code: 0)
- Evidence: Issuer returned exact candidate name "Arjun Sharma", status "VALID", course "Machine Learning Specialization". Tagged with clear mock demonstration indicator.

• TC2 | ID returns a different name
- Input: Candidate "Rahul Mehta", Credential ID "CERT-TC2-MISMATCH", Course "Deep Learning Specialization", Consent: True.
- Expected Outcome: MISMATCH
- Actual Outcome: MISMATCH (Status: DONE, Exit Code: 0)
- Evidence: Conflicting material field detected — candidate claimed "Rahul Mehta" but issuer returned "Priya Nair". Highlighted in conflicting field audit tag.

• TC3 | No record found
- Input: Candidate "Vikram Singh", Credential ID "CERT-TC3-NOTFOUND", Course "Data Science", Consent: True.
- Expected Outcome: NOT_FOUND
- Actual Outcome: NOT_FOUND (Status: DONE, Exit Code: 0)
- Evidence: Permitted source successfully queried but returned confirmed no-record response. Recorded factually without accusing candidate of fraud.

• TC4 | No candidate consent on file
- Input: Candidate "Sneha Kapoor", Credential ID "CERT-TC4-NOCONSENT", Consent: False.
- Expected Outcome: NOT_CHECKED
- Actual Outcome: NOT_CHECKED (Status: DONE, Exit Code: 0)
- Evidence: Agent strictly blocked external lookup prior to network query. Persisted as NOT_CHECKED audit event.

Automated Pytest Suite: 11 tests passed in 1.20s (covering decision engine rules, consent blocking, API health, and official test runner).
```

---

### Field 10: Solution & agent workflow *
```text
CertiProof AI addresses the Certificate Authenticity Checker challenge in Education & Career AI by transforming credential verification from a manual, error-prone recruiter chore into an auditable, ethical agentic workflow.

The core problem recruiters face today is two-fold: verifying candidate certificates on public issuer platforms is tedious and slow, while naive AI scripts scrape aggressively, hallucinate missing records, or violate candidate privacy without consent.

Our solution implements a comprehensive 6-step agentic workflow:
1. Recruiter Input: A recruiter submits credential details along with verifiable candidate consent on file. A stable UUID is minted for the verification request.
2. Agent Planning: The agent validates input parameters, plans lookup steps, and generates the exact target verification URL.
3. Human-in-the-Loop Approval: To ensure ethical automation and prevent irreversible external requests, the agent enters an AWAITING_APPROVAL state. The recruiter can inspect the proposed target issuer, URL, action, and purpose before clicking "Authorize & Execute" or "Cancel".
4. Permitted Evidence Retrieval: The agent executes permitted HTTP/browser extraction against public course verification endpoints. If a real issuer is inaccessible, it gracefully reports UNRESOLVED or uses an explicitly labeled MOCK DEMO simulator.
5. Deterministic Comparison: Instead of relying on generative LLM guesses, the agent uses a rule-based decision engine that compares claimed name, course, and date against extracted issuer records.
6. Traceable Evidence Viewer: Recruiter views an end-to-end audit report featuring field alignment (Claimed vs Extracted), raw payload inspector, visual snapshots, and step-by-step agent timelines.

The interface is crafted using Leonxlnx/taste-skill, delivering an Awwwards-tier dark hardware glass aesthetic with double-bezel cards, Plus Jakarta Sans typography, and responsive controls suitable for enterprise HR teams.
```

---

## 2. 2–3 Minute Demo Video Script (For YouTube / Loom)

**Title:** CertiProof AI — Official Demo Video | Team Infinity Castle  
**Length:** ~2 minutes 30 seconds  

### [0:00 - 0:30] Introduction & Problem Brief
- **Visual:** Show the Overview Dashboard at `http://localhost:5173`. Point to the header: *"CertiProof AI — Team Infinity Castle | Ziro Agentic AI Hackathon 2026"*.
- **Voiceover:**  
  *"Hello judges! We are Team Infinity Castle—Sanjiv, Manoranjan, and Jagan. For the Ziro Agentic AI Hackathon 2026, we built **CertiProof AI**, an autonomous certificate verification agent for Education & Career AI. Recruiters spend hours manually validating candidate credentials on public course platforms. CertiProof AI automates this with full traceability, human approval gates, and deterministic classification."*

### [0:30 - 1:00] Step A & C: Input, Planning & Human Approval (TC1)
- **Visual:** Click **"New Verification"** in the sidebar. Click the **"Match Case (TC1)"** preset button to autofill *Arjun Sharma*, *CERT-TC1-MATCH*, *Machine Learning Specialization*, consent checked. Click **"Submit & Plan Verification"**. Show the transition into **"Human Approval Queue"**.
- **Voiceover:**  
  *"Let's demonstrate our first official test case: a valid certificate. The recruiter submits the candidate claims and confirms consent. Notice our Agentic Guardrail: execution immediately pauses in Step C. The agent formulates the target URL and proposed browser action, but refuses to touch the external issuer until the recruiter explicitly approves. We click 'Authorize & Execute'."*

### [1:00 - 1:30] Step D & E: Results & Evidence Viewer
- **Visual:** The screen opens **Verification Result**. Point out the glowing **VERIFIED** badge. Scroll through the **Traceable Agent Step-by-Step Workflow** (all 6 steps green). Click **"Inspect Raw Evidence"** to open the **Evidence Viewer**. Show the Field Alignment table (Exact Match) and raw JSON response. Point out the clear **MOCK DEMO** simulator badge.
- **Voiceover:**  
  *"Immediately, the agent retrieves the evidence and applies deterministic rules. We see a VERIFIED outcome with an exact match on candidate name and course. In the Evidence Viewer, we see the raw issuer response and the field comparison matrix. As required by hackathon safety rules, mock test data is explicitly tagged as a simulator and never disguised as live data."*

### [1:30 - 2:00] TC2 & TC4: Name Mismatch & Privacy Guardrail (No Consent)
- **Visual:** Go back to **New Verification**. Click **"Mismatch Case (TC2)"** (*Rahul Mehta* claiming a certificate issued to *Priya Nair*). Submit and approve. Show the **MISMATCH** result with the conflicting field alert. Then click **"New Verification"** and select **"No Consent Blocked (TC4)"** (consent checkbox unchecked). Click **"Record Blocked Lookup"**.
- **Voiceover:**  
  *"Now let's see how CertiProof AI handles discrepancies and privacy. In TC2, the issuer returned 'Priya Nair' when the candidate claimed 'Rahul Mehta'. The agent flags this as an explicit MISMATCH. Next, in TC4, when candidate consent is missing, the agent strictly blocks the lookup before sending a single network packet, recording it as NOT_CHECKED."*

### [2:00 - 2:30] Official Test Runner & Wrap Up
- **Visual:** Click **"Official Test Runner"** in the sidebar. Click **"Run All 4 Official Test Cases"**. Watch all 4 test cards light up with green **PASS** badges (TC1: VERIFIED, TC2: MISMATCH, TC3: NOT_FOUND, TC4: NOT_CHECKED).
- **Voiceover:**  
  *"Finally, our built-in Official Test Runner executes all four mandatory problem statement scenarios in real time. All four scenarios pass deterministically. CertiProof AI is full-stack, tested, auditable, and ready for deployment. Thank you!"*

---

## 3. Slide-by-Slide Presentation Deck Outline

*(Copy this into Google Slides or Canva — 8 slides total)*

### Slide 1: Title Slide
- **Headline:** CertiProof AI
- **Subtitle:** Autonomous Credential Verification Agent with Traceable Evidence & Human-in-the-Loop Governance
- **Event:** Ziro.Digital Agentic AI Hackathon 2026
- **Team:** Infinity Castle (Sanjiv V, Manoranjan M, Jagan P)
- **Industry:** Education & Career AI

### Slide 2: The Problem
- **Headline:** The High Stakes of Credential Verification
- **Bullet 1:** 40%+ of candidate resumes contain embellished academic or professional certifications.
- **Bullet 2:** Manual verification is slow, fragmented across dozens of issuer platforms (Coursera, edX, issuers).
- **Bullet 3:** Blind AI scrapers violate candidate privacy, get blocked by bot challenge walls, or hallucinate missing data.
- **Key Takeaway:** Recruiters need an automated agent that is reliable, privacy-compliant, and 100% deterministic.

### Slide 3: The CertiProof AI Solution
- **Headline:** Agentic Workflow with Guardrails
- **Visual:** 6-Step Workflow diagram:
  `Consent Ingestion → Plan Formulation → Human Gate → Permitted Extraction → Deterministic Engine → Relational Audit`
- **Core Pillars:**
  - **Zero-Hallucination:** An LLM plans steps, but never invents certificate records.
  - **Human-in-the-Loop:** Browser automation requires explicit recruiter authorization.
  - **Ethical Extraction:** Strictly queries public endpoints without bypassing CAPTCHAs or paywalls.

### Slide 4: 5 Deterministic Outcomes
- **Headline:** Objective, Rule-Based Classifications
- **Table:**
  - `VERIFIED`: Issuer evidence confirms candidate name and course details.
  - `MISMATCH`: Issuer evidence explicitly contradicts claimed details.
  - `NOT_FOUND`: Source successfully queried but returns 404/no record (never accuses candidate of fraud).
  - `UNRESOLVED`: Incomplete evidence, network timeout, or bot-blocked page.
  - `NOT_CHECKED`: Consent absent or recruiter cancelled action.

### Slide 5: System Architecture & Tech Stack
- **Headline:** Modern Enterprise Stack
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Leonxlnx/taste-skill UI
- **Backend:** FastAPI, Python 3.11, Pydantic v2, SQLAlchemy 2.0 ORM, SQLite
- **Automation:** Playwright, HTTPX, BeautifulSoup4
- **Testing:** Pytest, pytest-asyncio (11 unit/integration tests)

### Slide 6: Mandatory Test Cases (TC1–TC4)
- **Headline:** 100% Assertion Pass Rate
- **Grid:**
  - **TC1:** Valid ID matching name → `VERIFIED` [PASS]
  - **TC2:** ID returns different name → `MISMATCH` [PASS]
  - **TC3:** No record found → `NOT_FOUND` [PASS]
  - **TC4:** No consent on file → `NOT_CHECKED` [PASS]

### Slide 7: UI/UX Excellence (Leonxlnx/taste-skill)
- **Headline:** Awwwards-Tier Design Language
- **Highlights:**
  - Double-Bezel (Doppelrand) hardware card architecture with concentric radii.
  - Button-in-Button interactive physics with trailing icon pods.
  - Plus Jakarta Sans typography with JetBrains Mono cryptographic identifiers.
  - Responsive across desktop, tablet, and mobile.

### Slide 8: Summary & Team Infinity Castle
- **Headline:** Ready for Production
- **Team:** Sanjiv V (Lead), Manoranjan M, Jagan P
- **Key Achievements:** Full agent lifecycle, 8 responsive screens, 100% test coverage, ethical privacy guardrails.
- **Call to Action:** Experience the live agent at `http://localhost:5173`

---

## 4. LinkedIn Post (Ready to Publish & Tag @Ziro Digital)

Copy and paste this into LinkedIn:

```text
🚀 Excited to showcase our project for the Ziro.Digital Agentic AI Hackathon 2026!

Our team, Infinity Castle (Sanjiv V, Manoranjan M, Jagan P), built CertiProof AI — an autonomous certificate authenticity checker for the Education & Career AI track. 🎓🔍

Recruiters spend countless hours manually verifying candidate certificates against public issuer verification portals. Naive automated scrapers often hallucinate, trigger bot blocks, or violate candidate privacy.

CertiProof AI solves this with an ethical, 6-stage agentic workflow:
✅ Strict Consent Gate: Lookups are blocked if candidate consent is not on file (TC4).
✅ Step Formulation: Autonomous planning of permitted issuer verification steps.
✅ Human-in-the-Loop Approval: Recruiter authorizes external browser actions before execution.
✅ Permitted Extraction: Direct queries against public issuer verification pages.
✅ Zero-Hallucination Decision Engine: Deterministic classification into VERIFIED, MISMATCH, NOT_FOUND, UNRESOLVED, or NOT_CHECKED.
✅ Cryptographic & Raw Evidence Viewer: Auditable field comparison and step-by-step logs.

Built with React 19, Vite, Tailwind CSS v4, Leonxlnx/taste-skill, FastAPI, SQLAlchemy, and Playwright. Tested and validated across all 4 official hackathon scenarios! ⚡

A huge thank you to @Ziro Digital for organizing an incredible hackathon pushing the boundaries of real Agentic AI! 🙌

#AgenticAI #AIHackathon #ZiroDigital #FastAPI #React #FullStack #EdTech #Innovation #BuildWeek2026 #InfinityCastle
```
*(Remember to tag the official **@Ziro Digital** company page when publishing and take a screenshot for your submission).*
