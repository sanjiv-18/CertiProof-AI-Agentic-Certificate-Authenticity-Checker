# CertiProof AI — Evidence Screenshots & Visual Documentation

This folder stores automated evidence screenshots captured during certificate verification lookups and UI previews for documentation.

---

## 1. Storage & Runtime Behavior

- **Automated Evidence Store:** When the agent retrieves permitted evidence from an external issuer portal using Playwright or headless capture, full-page PNG screenshots are written to this directory with stable naming conventions:  
  `screenshots/evidence_{verification_id}_{timestamp}.png`
- **UI Access:** In local development and production, screenshots are served statically at `/screenshots/{filename}` and rendered inside the **Evidence Viewer** screen.
- **Production Serverless Fallback:** On Vercel, screenshots are temporarily stored in `/tmp/screenshots` to comply with read-only lambda filesystem limitations.

---

## 2. Application Screen Showcase

CertiProof AI features an 8-screen interface built with **React 19**, **Tailwind CSS v4**, and the **Leonxlnx/taste-skill** design system:

| Screen | Route | Description |
| :--- | :--- | :--- |
| **01. Recruiter Dashboard** | `/` | Real-time verification KPI metrics (Verified, Mismatch, Not Found, Unresolved, Not Checked, Pending Approvals) and recent verifications audit table. |
| **02. New Verification Form** | `/verify` | Recruiter submission form with mandatory consent confirmation checkbox, dynamic issuer selector, and input validation. |
| **03. Approval Queue** | `/approvals` | Human-in-the-Loop authorization gate displaying target URL, proposed automated action, and Approve/Cancel triggers. |
| **04. Verification Result** | `/verifications/:id` | Traceable outcome screen displaying deterministic rule classification, evidence alignment, and reason breakdown. |
| **05. Evidence Viewer** | `/evidence/:id` | Side-by-side evidence inspection displaying raw issuer response payload, timestamp, and visual snapshot proof. |
| **06. Verification History** | `/history` | Searchable, paginated audit table of all historical candidate certificate inquiries. |
| **07. Test Runner** | `/tests` | One-click official test runner executing TC1, TC2, TC3, and TC4 live against deterministic issuer endpoints. |
| **08. Issuer Settings** | `/settings` | Registry status of supported public course platforms (Mock Adapter, Coursera Public API). |

---

## 3. UI Aesthetics & Design Highlights

CertiProof AI's interface strictly implements the anti-slop design specifications:
- **Typography:** Displayed in Plus Jakarta Sans with monospace metrics in JetBrains Mono.
- **Micro-Surfaces:** Double-bezel bordered cards (`border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md`).
- **Button-in-Button Controls:** Micro-styled tactile inputs with ambient radial glow backgrounds.
- **Color Signifiers:** Accessible status badges (`bg-emerald-950/60 text-emerald-300`, `bg-rose-950/60 text-rose-300`, etc.).
