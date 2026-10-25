import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Lock,
  FileCheck2,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { IssuerSource } from '../types';
import type { ScreenId } from '../components/Sidebar';

interface NewVerificationPageProps {
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const NewVerificationPage: React.FC<NewVerificationPageProps> = ({ onNavigate }) => {
  const [issuers, setIssuers] = useState<IssuerSource[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [issuerSlug, setIssuerSlug] = useState('mock-issuer');
  const [courseName, setCourseName] = useState('');
  const [claimedIssueDate, setClaimedIssueDate] = useState('');
  const [candidateConsent, setCandidateConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiClient
      .getIssuers()
      .then((data) => {
        setIssuers(data);
        if (data.length > 0) {
          setIssuerSlug(data[0].slug);
        }
      })
      .catch((err) => console.error('Failed to load issuers', err));
  }, []);

  const applyPreset = (preset: 'match' | 'mismatch' | 'notfound' | 'noconsent') => {
    setError(null);
    setFieldErrors({});
    switch (preset) {
      case 'match':
        setCandidateName('Arjun Sharma');
        setCredentialId('CERT-TC1-MATCH');
        setIssuerSlug('mock-issuer');
        setCourseName('Machine Learning Specialization');
        setClaimedIssueDate('2024-03-15');
        setCandidateConsent(true);
        break;
      case 'mismatch':
        setCandidateName('Rahul Mehta');
        setCredentialId('CERT-TC2-MISMATCH');
        setIssuerSlug('mock-issuer');
        setCourseName('Deep Learning Specialization');
        setClaimedIssueDate('2024-06-20');
        setCandidateConsent(true);
        break;
      case 'notfound':
        setCandidateName('Vikram Singh');
        setCredentialId('CERT-TC3-NOTFOUND');
        setIssuerSlug('mock-issuer');
        setCourseName('Data Science Professional Certificate');
        setClaimedIssueDate('');
        setCandidateConsent(true);
        break;
      case 'noconsent':
        setCandidateName('Sneha Kapoor');
        setCredentialId('CERT-TC4-NOCONSENT');
        setIssuerSlug('mock-issuer');
        setCourseName('AI for Everyone');
        setClaimedIssueDate('');
        setCandidateConsent(false);
        break;
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!candidateName.trim()) errors.candidateName = 'Candidate name is required.';
    if (!credentialId.trim()) errors.credentialId = 'Credential ID is required.';
    if (!issuerSlug) errors.issuerSlug = 'Issuing organization is required.';
    if (!courseName.trim()) errors.courseName = 'Claimed course name is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError(null);

      const created = await apiClient.createVerification({
        candidate_name: candidateName.trim(),
        credential_id: credentialId.trim(),
        issuer_slug: issuerSlug,
        course_name: courseName.trim(),
        claimed_issue_date: claimedIssueDate.trim() || null,
        candidate_consent: candidateConsent,
      });

      if (!candidateConsent) {
        onNavigate('verification-result', created.id);
      } else {
        onNavigate('approval-queue');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-white/[0.06]">
        <div className="taste-eyebrow text-blue-400 border-blue-500/30">
          <FileCheck2 className="w-3 h-3 text-blue-400" />
          <span>Step A: Recruiter Input</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          New Certificate Verification Request
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Initialize a traceable agent verification run. Input candidate claims and confirm required consent.
        </p>
      </div>

      {/* Demo Presets Chips */}
      <div className="taste-bezel-outer p-1 bg-blue-500/[0.02]">
        <div className="taste-bezel-inner p-4 bg-gradient-to-r from-blue-500/10 via-[#0f1626] to-[#0f1626]">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Synthetic Demonstration Presets</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Click any test archetype to automatically populate test data:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('match')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition active:scale-95"
            >
              Match Case (TC1)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('mismatch')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition active:scale-95"
            >
              Mismatch Case (TC2)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('notfound')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition active:scale-95"
            >
              Not Found (TC3)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('noconsent')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition active:scale-95"
            >
              No Consent Blocked (TC4)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Hardware Form */}
      <form onSubmit={handleSubmit} className="taste-bezel-outer">
        <div className="taste-bezel-inner p-6 sm:p-8 space-y-6">
          {/* Candidate Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Candidate Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              className={`w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 text-white placeholder-slate-500 border focus:outline-none transition ${
                fieldErrors.candidateName
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-white/[0.08] focus:border-blue-500'
              }`}
            />
            {fieldErrors.candidateName && (
              <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.candidateName}</p>
            )}
          </div>

          {/* Credential ID & Issuer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Credential ID / Identifier <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="e.g. CERT-TC1-MATCH"
                className={`w-full px-4 py-2.5 text-xs font-mono rounded-xl bg-black/40 text-blue-300 placeholder-slate-500 border focus:outline-none transition ${
                  fieldErrors.credentialId
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-white/[0.08] focus:border-blue-500'
                }`}
              />
              {fieldErrors.credentialId && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.credentialId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Issuing Organization / Source <span className="text-rose-400">*</span>
              </label>
              <select
                value={issuerSlug}
                onChange={(e) => setIssuerSlug(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 text-white border border-white/[0.08] focus:border-blue-500 focus:outline-none"
              >
                {issuers.map((iss) => (
                  <option key={iss.slug} value={iss.slug} className="bg-slate-900 text-white">
                    {iss.name} {iss.slug === 'mock-issuer' ? '(Deterministic Simulator)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Name & Claimed Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Claimed Course Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Machine Learning Specialization"
                className={`w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 text-white placeholder-slate-500 border focus:outline-none transition ${
                  fieldErrors.courseName
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-white/[0.08] focus:border-blue-500'
                }`}
              />
              {fieldErrors.courseName && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.courseName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Claimed Issue Date <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={claimedIssueDate}
                onChange={(e) => setClaimedIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 text-white border border-white/[0.08] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Consent Checkbox Box */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-start gap-3">
                <input
                  id="consentCheckbox"
                  type="checkbox"
                  checked={candidateConsent}
                  onChange={(e) => setCandidateConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded bg-black/40 border-slate-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="consentCheckbox" className="text-xs font-bold text-white cursor-pointer select-none">
                  Candidate Consent Confirmation on File
                </label>
              </div>
              <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                I verify that the candidate has signed explicit written consent authorizing third-party
                verification of this certificate against public issuer databases.
              </p>
              {!candidateConsent && (
                <div className="ml-7 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Strict Privacy Policy:</strong> Without affirmative candidate consent, the agent is
                    completely blocked from querying the issuer. The record will be created directly as <code>NOT_CHECKED</code>.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Step B (Agent Step Planning) triggers on submission.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${
                candidateConsent
                  ? 'taste-btn-primary'
                  : 'inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold border border-slate-700'
              } disabled:opacity-50 transition group`}
            >
              {loading ? (
                <span>Formulating Plan...</span>
              ) : candidateConsent ? (
                <>
                  <span>Submit &amp; Plan Verification</span>
                  <div className="taste-btn-icon-wrapper">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Record Blocked Lookup (No Consent)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
