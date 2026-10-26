# Contributing to CertiProof AI

Thank you for your interest in contributing to **CertiProof AI**! 

This repository was designed for the **Ziro.Digital Agentic AI Hackathon 2026** by Team **Infinity Castle**. We welcome community contributions, additional issuer adapters, and feature enhancements.

---

## 1. Development Workflow

1. **Fork the Repository:**
   Fork the repository to your own GitHub account and clone it locally.

2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/issuer-edx-adapter
   ```

3. **Set Up the Local Environment:**
   Follow [docs/setup.md](docs/setup.md) to set up both backend and frontend virtual environments.

---

## 2. Coding Standards

### Backend (Python / FastAPI)
- **Formatting:** Follow PEP 8 guidelines.
- **Type Annotations:** Use Python 3.10+ typing (`from __future__ import annotations`, `Optional`, `List`, `tuple`).
- **Data Validation:** All models must use Pydantic v2 schemas (`model_config = ConfigDict(...)`, `@field_validator`).
- **Database Operations:** Always execute database sessions using context managers or FastAPI `Depends(get_db)`.
- **Deterministic Rules:** The decision engine must remain deterministic. Never allow LLM outputs to overwrite missing evidence.

### Frontend (React / TypeScript / Tailwind)
- **Framework:** React 19 with TypeScript.
- **Design System:** Strictly adhere to the `Leonxlnx/taste-skill` double-bezel, high-contrast, anti-slop visual language.
- **Styling:** Use Tailwind CSS v4 utility classes. Avoid arbitrary inline styles.

---

## 3. Testing Requirements

All contributions must pass automated tests before merging:

```bash
# Run backend tests
pytest backend/tests -v

# Run root integration tests
pytest tests/test_integration.py -v

# Build frontend
cd frontend
npm run build
```

---

## 4. Submitting a Pull Request

1. Ensure all tests pass locally.
2. Commit your changes with meaningful commit messages:
   ```bash
   git commit -m "feat(adapters): add Udemy public verification adapter"
   ```
3. Push to your feature branch and open a Pull Request against `main`.
4. Fill out the PR template describing the changes made and include test verification evidence.
