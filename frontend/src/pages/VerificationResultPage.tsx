import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  SearchX,
  HelpCircle,
  Ban,
  Clock,
  FolderOpen,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { VerificationDetail, AgentStep, VerificationSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import type { ScreenId } from '../components/Sidebar';

interface VerificationResultPageProps {
  verificationId?: string;
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const VerificationResultPage: React.FC<VerificationResultPageProps> = ({
  verificationId,
  onNavigate,
}) => {
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [verificationsList, setVerificationsList] = useState<VerificationSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | undefined>(verificationId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getVerifications(0, 30)
      .then((data) => {
        setVerificationsList(data);
        if (!currentId && data.length > 0) {
          setCurrentId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (verificationId) {
      setCurrentId(verificationId);
    }
  }, [verificationId]);

  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    setError(null);
    apiClient
      .getVerification(currentId)
      .then((data) => setDetail(data))
      .catch((err: any) => {
        console.error(err);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load verification');
      })
      .finally(() => setLoading(false));
  }, [currentId]);

  const steps: AgentStep[] = detail?.agent_run?.steps
    ? JSON.parse(detail.agent_run.steps)
    : [];

  const reasons: string[] = detail?.outcome_record?.reasons
    ? JSON.parse(detail.outcome_record.reasons)
    : detail?.outcome_reason
    ? [detail.outcome_reason]
    : [];

  const mismatchedFields: string[] = detail?.outcome_record?.mismatched_fields
    ? JSON.parse(detail.outcome_record.mismatched_fields)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Record Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="taste-eyebrow text-blue-400 border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Step E: Decision Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Verification Result &amp; Audit Trace
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Deterministic decision outcome, applied rules explanation, and traceable agent execution log.
          </p>
        </div>

        {verificationsList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Record:</span>
            <select
              value={currentId || ''}
              onChange={(e) => setCurrentId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl bg-black/40 text-slate-200 border border-white/[0.08] focus:border-blue-500 focus:outline-none max-w-xs truncate"
            >
              {verificationsList.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                  {v.candidate_name} — {v.credential_id} ({v.outcome || v.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Clock className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-3" />
          <p className="text-xs font-mono">Loading verification record &amp; audit graph...</p>
        </div>
      ) : !detail ? (
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-500 mb-1" />
            <p className="text-sm font-semibold text-slate-300">No verification record selected</p>
            <button
              onClick={() => onNavigate('new-verification')}
              className="taste-btn-primary mt-2"
            >
              <span>Create New Verification</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Outcome Hero Double-Bezel Card */}
          <div className={`taste-bezel-outer ${
            detail.outcome === 'VERIFIED'
              ? 'border-emerald-500/40'
              : detail.outcome === 'MISMATCH'
              ? 'border-rose-500/40'
              : detail.outcome === 'NOT_FOUND'
              ? 'border-amber-500/40'
              : detail.outcome === 'UNRESOLVED'
              ? 'border-purple-500/40'
              : 'border-white/[0.08]'
          }`}>
            <div className={`taste-bezel-inner p-6 sm:p-8 bg-gradient-to-br ${
              detail.outcome === 'VERIFIED'
                ? 'from-emerald-500/10 via-[#0f1626] to-[#0f1626]'
                : detail.outcome === 'MISMATCH'
                ? 'from-rose-500/10 via-[#0f1626] to-[#0f1626]'
                : detail.outcome === 'NOT_FOUND'
                ? 'from-amber-500/10 via-[#0f1626] to-[#0f1626]'
                : detail.outcome === 'UNRESOLVED'
                ? 'from-purple-500/10 via-[#0f1626] to-[#0f1626]'
                : 'from-slate-800/20 via-[#0f1626] to-[#0f1626]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    detail.outcome === 'VERIFIED'
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : detail.outcome === 'MISMATCH'
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                      : detail.outcome === 'NOT_FOUND'
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : detail.outcome === 'UNRESOLVED'
                      ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {detail.outcome === 'VERIFIED' && <ShieldCheck className="w-8 h-8" />}
                    {detail.outcome === 'MISMATCH' && <AlertTriangle className="w-8 h-8" />}
                    {detail.outcome === 'NOT_FOUND' && <SearchX className="w-8 h-8" />}
                    {detail.outcome === 'UNRESOLVED' && <HelpCircle className="w-8 h-8" />}
                    {(!detail.outcome || detail.outcome === 'NOT_CHECKED') && <Ban className="w-8 h-8" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge outcome={detail.outcome} status={detail.status} size="lg" />
                      <span className="text-[11px] font-mono text-slate-400">ID: {detail.id.slice(0, 8)}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {detail.candidate_name} &bull; {detail.course_name}
                    </h3>

                    <p className="text-xs text-slate-400">
                      Issuer Platform: <span className="text-slate-200 font-semibold capitalize">{detail.issuer_slug.replace('-', ' ')}</span> &bull; Credential Key: <code className="text-blue-400 font-mono">{detail.credential_id}</code>
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => onNavigate('evidence-viewer', detail.id)}
                    className="taste-btn-primary"
                  >
                    <span>Inspect Raw Evidence</span>
                    <div className="taste-btn-icon-wrapper">
                      <FolderOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Decision Rules List */}
              {reasons.length > 0 && (
                <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-2">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                    Deterministic Verification Logic:
                  </div>
                  <ul className="space-y-1.5">
                    {reasons.map((r, i) => (
                      <li key={i} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mismatch Alert Box */}
              {mismatchedFields.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <strong>Material Field Contradiction:</strong>{' '}
                    {mismatchedFields.map((f) => (
                      <span key={f} className="inline-block px-2 py-0.5 ml-1.5 font-mono font-bold bg-rose-500/30 text-rose-200 rounded border border-rose-500/50">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Claim vs Consent Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Candidate Claims */}
            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Candidate Claim</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Claimed Name:</span>
                    <span className="font-bold text-white text-sm">{detail.candidate_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Claimed Course:</span>
                    <span className="font-semibold text-slate-200">{detail.course_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Claimed Issue Date:</span>
                    <span className="text-slate-300 font-mono">{detail.claimed_issue_date || 'Not claimed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Status */}
            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Consent Audit</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Candidate Consent:</span>
                    {detail.candidate_consent ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-400 font-mono">
                        ✓ Consent Confirmed on File
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-rose-400 font-mono">
                        ✗ Absent — Lookup Blocked
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Submitted At:</span>
                    <span className="text-slate-300 font-mono">{new Date(detail.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Execution Status:</span>
                    <span className="font-mono text-blue-400 font-bold">{detail.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Decision */}
            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Human Gate (Step C)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Decision:</span>
                    <span className="font-bold text-white font-mono">
                      {detail.approval_decision?.decision || 'NOT REQUIRED / BYPASS'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Execution Status:</span>
                    <span className="font-mono text-slate-300">{detail.approval_decision?.execution_status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Decided At:</span>
                    <span className="text-slate-400 font-mono">
                      {detail.approval_decision?.decided_at
                        ? new Date(detail.approval_decision.decided_at).toLocaleTimeString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traceable Agent Step-by-Step Workflow */}
          <div className="taste-bezel-outer">
            <div className="taste-bezel-inner p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h4 className="text-sm font-extrabold text-white tracking-tight">
                  Traceable Agent Step-by-Step Execution Workflow
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                  State: {detail.agent_run?.state || 'COMPLETED'}
                </span>
              </div>

              {steps.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono">No agent step logs recorded.</p>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/[0.08]">
                  {steps.map((st, idx) => {
                    const isDone = st.status === 'DONE';
                    const isError = st.status === 'ERROR';
                    const isSkipped = st.status === 'SKIPPED';
                    const isRunning = st.status === 'RUNNING';

                    return (
                      <div key={idx} className="relative flex items-start gap-3 pl-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white z-10 ${
                          isDone
                            ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : isError
                            ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                            : isSkipped
                            ? 'bg-slate-700'
                            : 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                        }`}>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isError && <XCircle className="w-3.5 h-3.5" />}
                          {isSkipped && <Ban className="w-3.5 h-3.5" />}
                          {isRunning && <Clock className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 p-3 rounded-xl bg-black/30 border border-white/[0.06] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white font-mono">{st.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(st.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {st.detail && (
                            <p className="text-[11px] text-slate-300 mt-1 break-all leading-relaxed font-sans">{st.detail}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
