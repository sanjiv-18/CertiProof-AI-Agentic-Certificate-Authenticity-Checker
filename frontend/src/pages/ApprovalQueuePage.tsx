import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { VerificationDetail } from '../types';
import type { ScreenId } from '../components/Sidebar';

interface ApprovalQueuePageProps {
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const ApprovalQueuePage: React.FC<ApprovalQueuePageProps> = ({ onNavigate }) => {
  const [pendingVerifications, setPendingVerifications] = useState<VerificationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await apiClient.getVerifications(0, 50);
      const awaiting = all.filter((v) => v.status === 'AWAITING_APPROVAL' || v.status === 'PENDING');

      const details = await Promise.all(
        awaiting.map((item) => apiClient.getVerification(item.id))
      );
      setPendingVerifications(details);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleDecision = async (id: string, action: 'APPROVE' | 'CANCEL') => {
    try {
      setProcessingId(id);
      setError(null);
      await apiClient.approveVerification(id, action);
      onNavigate('verification-result', id);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to execute decision');
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-white/[0.06]">
        <div className="taste-eyebrow text-blue-400 border-blue-500/30">
          <UserCheck className="w-3 h-3 text-blue-400" />
          <span>Step C: Human-in-the-Loop</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Human Approval Authorization Queue
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          The agent has planned the lookup and determined the target portal. Affirmative recruiter authorization is required before execution.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Safety Notice Box */}
      <div className="taste-bezel-outer p-1 bg-white/[0.02]">
        <div className="taste-bezel-inner p-4 text-xs space-y-1 bg-[#0c1220]">
          <div className="font-bold text-slate-200 flex items-center gap-2 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>AGENTIC AI GOVERNANCE GUARDRAIL</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Per the hackathon specification, the AI agent <strong>never</strong> initiates external automated browser actions or credential searches without affirmative human review. Every approval decision is timestamped and permanently preserved.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Clock className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-3" />
          <p className="text-xs font-mono">Polling pending authorization queue...</p>
        </div>
      ) : pendingVerifications.length === 0 ? (
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Queue Empty — All Actions Processed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No verifications are currently awaiting authorization. When a new verification is submitted with consent, its execution plan will appear here.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('new-verification')}
                className="taste-btn-primary"
              >
                <span>Initiate New Verification</span>
                <div className="taste-btn-icon-wrapper">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            Awaiting Human Decision ({pendingVerifications.length})
          </div>

          {pendingVerifications.map((item) => {
            const approval = item.approval_decision;
            const isProcessing = processingId === item.id;

            return (
              <div key={item.id} className="taste-bezel-outer border-blue-500/30">
                <div className="taste-bezel-inner overflow-hidden">
                  {/* Proposal Bar */}
                  <div className="px-6 py-3.5 border-b border-white/[0.06] bg-blue-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-blue-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-ping"></span>
                      <span>Execution Authorization Requested</span>
                      <span className="text-slate-400 font-mono text-[11px]">| Ref: {item.id.slice(0, 8)}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                      Gate: Step C
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-5">
                    {/* Candidate claims */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/[0.06] text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                          Candidate Claim:
                        </span>
                        <div className="text-base font-bold text-white mt-0.5">{item.candidate_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Course: <strong className="text-slate-200">{item.course_name}</strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                          Issuer &amp; Consent Record:
                        </span>
                        <div className="text-sm font-semibold text-slate-200 capitalize mt-0.5">
                          {item.issuer_slug.replace('-', ' ')}
                        </div>
                        <div className="text-xs text-emerald-400 mt-0.5 font-medium flex items-center gap-1 font-mono">
                          <span>✓ Candidate consent validated on file</span>
                        </div>
                      </div>
                    </div>

                    {/* Specification Action Box */}
                    <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                          Target Issuer URL:
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-blue-300 break-all text-xs">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{approval?.target_url || 'https://mock.certiproof.local/verify'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                          Proposed Browser Automation Action:
                        </span>
                        <p className="mt-1 text-slate-200 font-medium">
                          {approval?.proposed_action ||
                            `Navigate to issuer page and look up credential ID '${item.credential_id}'`}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                            Credential ID to Enter:
                          </span>
                          <code className="text-xs font-mono font-bold text-blue-400 mt-1 inline-block bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                            {approval?.credential_id_to_enter || item.credential_id}
                          </code>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                            Purpose of Action:
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {approval?.purpose || 'Extract candidate name, course, and credential status from issuer.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-[11px] text-slate-400 font-medium">
                        Approval resumes the agent to execute permitted retrieval and classification.
                      </p>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleDecision(item.id, 'CANCEL')}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08] transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <span>Cancel Lookup</span>
                        </button>

                        <button
                          onClick={() => handleDecision(item.id, 'APPROVE')}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none taste-btn-primary"
                        >
                          <span>{isProcessing ? 'Executing Agent...' : 'Authorize & Execute'}</span>
                          <div className="taste-btn-icon-wrapper">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
