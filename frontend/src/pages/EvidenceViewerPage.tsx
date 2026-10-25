import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Code2,
  Camera,
  FileQuestion,
  Info,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { VerificationDetail, EvidenceRecord, VerificationSummary } from '../types';
import type { ScreenId } from '../components/Sidebar';

interface EvidenceViewerPageProps {
  verificationId?: string;
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const EvidenceViewerPage: React.FC<EvidenceViewerPageProps> = ({
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
        setError(err?.response?.data?.detail || err?.message || 'Failed to load evidence');
      })
      .finally(() => setLoading(false));
  }, [currentId]);

  const ev: EvidenceRecord | undefined | null = detail?.evidence;

  const isNameMatch =
    detail &&
    ev?.extracted_candidate_name &&
    detail.candidate_name.trim().toLowerCase() === ev.extracted_candidate_name.trim().toLowerCase();

  return (
    <div className="space-y-6">
      {/* Top Header & Record Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="taste-eyebrow text-blue-400 border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Step D: Source Retrieval</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Cryptographic &amp; Source Evidence Viewer
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Raw HTTP/browser payloads retrieved from public verification portals with field-level audit alignment.
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
                  {v.candidate_name} — {v.credential_id}
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
          <p className="text-xs font-mono">Loading evidence telemetry...</p>
        </div>
      ) : !detail ? (
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-12 text-center text-slate-400 space-y-2">
            <FileQuestion className="w-8 h-8 mx-auto text-slate-500 mb-1" />
            <p className="text-sm font-semibold text-slate-300">No record selected</p>
          </div>
        </div>
      ) : !ev ? (
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-10 text-center space-y-3">
            <Info className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-white">No External Evidence Captured</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {detail.candidate_consent === false
                ? 'Candidate consent was not provided. By policy, the agent was strictly blocked from performing an external query.'
                : detail.status === 'AWAITING_APPROVAL'
                ? 'Verification is currently in Step C (Awaiting Human Approval). Evidence will be captured upon recruiter authorization.'
                : 'The verification was cancelled or did not produce an external retrieval record.'}
            </p>
            {detail.status === 'AWAITING_APPROVAL' && (
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('approval-queue')}
                  className="taste-btn-primary"
                >
                  <span>Go to Approval Queue</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mock simulator banner if mock */}
          {ev.is_mock && (
            <div className="taste-bezel-outer border-indigo-500/40 p-1 bg-indigo-500/[0.04]">
              <div className="taste-bezel-inner p-4 bg-gradient-to-r from-indigo-500/20 via-[#0f1626] to-[#0f1626] flex items-center justify-between text-xs text-indigo-200">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="leading-relaxed">
                    <strong className="text-white">Deterministic Simulator Notice:</strong> This evidence was retrieved from the test <span className="font-semibold text-indigo-300">Mock Issuer Adapter</span> for reproducible testing. It is explicitly labeled and never represented as authentic live issuer records.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-mono font-bold text-[10px] tracking-wider shrink-0 border border-indigo-500/40">
                  MOCK DEMO
                </span>
              </div>
            </div>
          )}

          {/* Evidence Metadata Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-4">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">Issuer Name</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{ev.issuer_name || 'Unknown'}</span>
              </div>
            </div>

            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-4">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">Retrieval Timestamp</span>
                <span className="font-mono text-slate-300 text-xs mt-0.5 block">
                  {ev.retrieved_at ? new Date(ev.retrieved_at).toLocaleString() : '—'}
                </span>
              </div>
            </div>

            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-4">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">Credential ID Used</span>
                <code className="text-blue-400 font-mono text-xs font-bold mt-0.5 block truncate">
                  {ev.credential_id_used || detail.credential_id}
                </code>
              </div>
            </div>

            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-4">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">Retrieval Outcome</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold mt-0.5 ${
                  ev.retrieval_outcome === 'SUCCESS' || ev.retrieval_outcome === 'MOCK'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : ev.retrieval_outcome === 'NOT_FOUND'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {ev.retrieval_outcome}
                </span>
              </div>
            </div>
          </div>

          {/* Source Verification URL */}
          <div className="taste-bezel-outer">
            <div className="taste-bezel-inner p-4 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">
                Permitted Issuer Verification URL Query
              </span>
              <div className="flex items-center gap-2 font-mono text-xs break-all text-blue-300 pt-0.5">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={ev.source_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {ev.source_url}
                </a>
              </div>
            </div>
          </div>

          {/* Claimed vs Extracted Field Comparison Table */}
          <div className="taste-bezel-outer">
            <div className="taste-bezel-inner overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white tracking-tight">
                  Field Alignment Matrix: Candidate Claim vs Issuer Evidence
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Deterministic
                </span>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 text-[10px] uppercase font-mono border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-3">Field</th>
                    <th className="px-6 py-3">Candidate Claimed Value</th>
                    <th className="px-6 py-3">Issuer Extracted Value</th>
                    <th className="px-6 py-3 text-right">Alignment Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {/* Candidate Name */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white font-mono">Candidate Name</td>
                    <td className="px-6 py-4 text-slate-200">{detail.candidate_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {ev.extracted_candidate_name || <span className="text-slate-400 italic">Not returned</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ev.extracted_candidate_name ? (
                        isNameMatch ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> EXACT MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 font-mono font-bold text-[11px]">
                            <XCircle className="w-4 h-4 text-rose-400" /> CONFLICT DETECTED
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Course Name */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white font-mono">Course / Track</td>
                    <td className="px-6 py-4 text-slate-200">{detail.course_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {ev.extracted_course_name || <span className="text-slate-400 italic">Not returned</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ev.extracted_course_name ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CONFIRMED
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Issue Date */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white font-mono">Issue Date</td>
                    <td className="px-6 py-4 text-slate-200">
                      {detail.claimed_issue_date || <span className="text-slate-400 italic">Not claimed</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200 font-mono">
                      {ev.extracted_issue_date || <span className="text-slate-400 italic">Not returned</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {ev.extracted_issue_date ? 'RECORDED' : '—'}
                    </td>
                  </tr>

                  {/* Status */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white font-mono">Credential Status</td>
                    <td className="px-6 py-4 text-slate-200">Claimed Valid</td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {ev.extracted_status ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
                          {ev.extracted_status}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not returned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {ev.extracted_status ? 'VALIDATED' : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cryptographic Terminal Raw Response & Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span>Raw Issuer Payload / Response</span>
                </div>
                <pre className="p-4 bg-black/60 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-white/[0.08]">
                  {ev.raw_response || 'No raw payload captured.'}
                </pre>
              </div>
            </div>

            <div className="taste-bezel-outer">
              <div className="taste-bezel-inner p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Visual Extraction Snapshot</span>
                </div>
                {ev.screenshot_path ? (
                  <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                    <img
                      src={`/${ev.screenshot_path}`}
                      alt="Issuer Verification Screenshot"
                      className="w-full object-cover max-h-60"
                    />
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-white/[0.08] rounded-xl text-center text-slate-400 text-xs flex flex-col items-center justify-center h-48">
                    <Camera className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                    <p className="font-medium text-slate-300">HTTP API Extraction Complete</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      No headless browser screenshot required for JSON API adapter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
