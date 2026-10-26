/**
 * CertiProof AI — Frontend API Service Client
 * Canonical service layer for interacting with backend REST endpoints.
 */

import axios from 'axios';
import type {
  DashboardStats,
  VerificationSummary,
  VerificationDetail,
  IssuerSource,
  TestCaseRun,
  TestCaseDefinition,
  EvidenceRecord,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Health
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Dashboard
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  // Verifications
  getVerifications: async (skip = 0, limit = 50): Promise<VerificationSummary[]> => {
    const res = await api.get('/verifications', { params: { skip, limit } });
    return res.data;
  },

  getVerification: async (id: string): Promise<VerificationDetail> => {
    const res = await api.get(`/verifications/${id}`);
    return res.data;
  },

  createVerification: async (payload: {
    candidate_name: string;
    credential_id: string;
    issuer_slug: string;
    course_name: string;
    claimed_issue_date?: string | null;
    candidate_consent: boolean;
  }): Promise<VerificationSummary> => {
    const res = await api.post('/verifications', payload);
    return res.data;
  },

  approveVerification: async (id: string, action: 'APPROVE' | 'CANCEL'): Promise<VerificationDetail> => {
    const res = await api.post(`/verifications/${id}/approve`, { action });
    return res.data;
  },

  cancelVerification: async (id: string): Promise<VerificationDetail> => {
    const res = await api.post(`/verifications/${id}/cancel`);
    return res.data;
  },

  getEvidence: async (id: string): Promise<EvidenceRecord> => {
    const res = await api.get(`/verifications/${id}/evidence`);
    return res.data;
  },

  // Issuers
  getIssuers: async (): Promise<IssuerSource[]> => {
    const res = await api.get('/issuers');
    return res.data;
  },

  // Tests
  getTestCases: async (): Promise<TestCaseDefinition[]> => {
    const res = await api.get('/tests/cases');
    return res.data;
  },

  runTests: async (test_ids?: string[]): Promise<TestCaseRun[]> => {
    const res = await api.post('/tests/run', { test_ids: test_ids || null });
    return res.data;
  },

  getTestResults: async (): Promise<TestCaseRun[]> => {
    const res = await api.get('/tests/results');
    return res.data;
  },
};

export default apiClient;
