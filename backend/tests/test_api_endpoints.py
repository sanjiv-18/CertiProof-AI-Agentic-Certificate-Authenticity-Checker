import pytest
from fastapi.testclient import TestClient
from app.main import app, _seed_issuers
from app.database import init_db

client = TestClient(app)


def setup_module(module):
    init_db()
    _seed_issuers()


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_issuers():
    response = client.get("/api/issuers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    slugs = [d["slug"] for d in data]
    assert "mock-issuer" in slugs


def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total" in stats
    assert "verified" in stats
    assert "mismatch" in stats
    assert "not_found" in stats
    assert "unresolved" in stats
    assert "not_checked" in stats
    assert "pending_approvals" in stats


def test_create_verification_no_consent_blocks_lookup():
    payload = {
        "candidate_name": "Test Candidate",
        "credential_id": "TEST-123",
        "issuer_slug": "mock-issuer",
        "course_name": "Test Course",
        "claimed_issue_date": "2024-01-01",
        "candidate_consent": False,
    }
    response = client.post("/api/verifications", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["candidate_consent"] is False
    assert data["status"] == "DONE"
    assert data["outcome"] == "NOT_CHECKED"


def test_official_test_runner():
    response = client.post("/api/tests/run", json={"test_ids": ["TC1", "TC2", "TC3", "TC4"]})
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 4

    # TC1
    tc1 = next(r for r in results if r["test_id"] == "TC1")
    assert tc1["expected_outcome"] == "VERIFIED"
    assert tc1["actual_outcome"] == "VERIFIED"
    assert tc1["passed"] is True

    # TC2
    tc2 = next(r for r in results if r["test_id"] == "TC2")
    assert tc2["expected_outcome"] == "MISMATCH"
    assert tc2["actual_outcome"] == "MISMATCH"
    assert tc2["passed"] is True

    # TC3
    tc3 = next(r for r in results if r["test_id"] == "TC3")
    assert tc3["expected_outcome"] == "NOT_FOUND"
    assert tc3["actual_outcome"] == "NOT_FOUND"
    assert tc3["passed"] is True

    # TC4
    tc4 = next(r for r in results if r["test_id"] == "TC4")
    assert tc4["expected_outcome"] == "NOT_CHECKED"
    assert tc4["actual_outcome"] == "NOT_CHECKED"
    assert tc4["passed"] is True
