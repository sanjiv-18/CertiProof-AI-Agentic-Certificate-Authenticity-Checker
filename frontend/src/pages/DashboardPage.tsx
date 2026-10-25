import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  SearchX,
  HelpCircle,
  Clock,
  RefreshCw,
  PlusCircle,
  FileCheck2,
  Ban,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { DashboardStats, VerificationSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import type { ScreenId } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<VerificationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, verificationsData] = await Promise.all([
        apiClient.getStats(),
        apiClient.getVerifications(0, 10),
      ]);
      setStats(statsData);
      setRecentVerifications(verificationsData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="taste-eyebrow text-blue-400 border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Agentic Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certificate Authenticity Checker
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Real-time auditable verification agent querying permitted course-platform verification pages.
            All statistics reflect persistent database records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Stats</span>
          </button>

          <button
            onClick={() => onNavigate('new-verification')}
            className="taste-btn-primary group"
          >
            <span>New Verification</span>
            <div className="taste-btn-icon-wrapper">
              <PlusCircle className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Pending Approvals Notice Banner */}
      {stats && stats.pending_approvals > 0 && (
        <div className="taste-bezel-outer p-1 bg-amber-500/[0.03] border-amber-500/30">
          <div className="taste-bezel-inner p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-[#0f1626] to-[#0f1626]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  {stats.pending_approvals} Action{stats.pending_approvals > 1 ? 's' : ''} Awaiting Human Authorization
                </h3>
                <p className="text-xs text-amber-300/70 mt-0.5">
                  Agent paused before executing browser automation against issuer portals. Human review required.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('approval-queue')}
              className="px-4 py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition shrink-0"
            >
              Review Authorization Queue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Hardware Double-Bezel Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Total</span>
              <FileCheck2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {loading ? '—' : stats?.total ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">Audited records</div>
          </div>
        </div>

        {/* Verified */}
        <div className="taste-bezel-outer border-emerald-500/20 hover:border-emerald-500/40">
          <div className="taste-bezel-inner p-4 bg-gradient-to-b from-emerald-500/[0.08] to-[#0f1626]">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Verified</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono tracking-tight">
              {loading ? '—' : stats?.verified ?? 0}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-medium">Confirmed match</div>
          </div>
        </div>

        {/* Mismatch */}
        <div className="taste-bezel-outer border-rose-500/20 hover:border-rose-500/40">
          <div className="taste-bezel-inner p-4 bg-gradient-to-b from-rose-500/[0.08] to-[#0f1626]">
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Mismatch</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono tracking-tight">
              {loading ? '—' : stats?.mismatch ?? 0}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-medium">Conflicting data</div>
          </div>
        </div>

        {/* Not Found */}
        <div className="taste-bezel-outer border-amber-500/20 hover:border-amber-500/40">
          <div className="taste-bezel-inner p-4 bg-gradient-to-b from-amber-500/[0.08] to-[#0f1626]">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Not Found</span>
              <SearchX className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
              {loading ? '—' : stats?.not_found ?? 0}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-medium">No record found</div>
          </div>
        </div>

        {/* Unresolved */}
        <div className="taste-bezel-outer border-purple-500/20 hover:border-purple-500/40">
          <div className="taste-bezel-inner p-4 bg-gradient-to-b from-purple-500/[0.08] to-[#0f1626]">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Unresolved</span>
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono tracking-tight">
              {loading ? '—' : stats?.unresolved ?? 0}
            </div>
            <div className="text-[10px] text-purple-400/80 mt-1 font-medium">Incomplete/error</div>
          </div>
        </div>

        {/* Not Checked */}
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Not Checked</span>
              <Ban className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 font-mono tracking-tight">
              {loading ? '—' : stats?.not_checked ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">No consent/cancelled</div>
          </div>
        </div>
      </div>

      {/* Asymmetric Bento Workflow Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step A */}
        <div
          onClick={() => onNavigate('new-verification')}
          className="taste-bezel-outer group cursor-pointer hover:border-blue-500/40"
        >
          <div className="taste-bezel-inner p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#0f1626] to-[#0a0f1d]">
            <div>
              <div className="flex items-center justify-between text-blue-400 text-xs font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">STEP A</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mt-3">New Verification Input</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Input candidate details, credential ID, course claims, and record mandatory candidate consent.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              <span>Initiate Lookup</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>

        {/* Step C */}
        <div
          onClick={() => onNavigate('approval-queue')}
          className="taste-bezel-outer group cursor-pointer hover:border-amber-500/40"
        >
          <div className="taste-bezel-inner p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#0f1626] to-[#0a0f1d]">
            <div>
              <div className="flex items-center justify-between text-amber-400 text-xs font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">STEP C</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mt-3">Human-in-the-Loop Queue</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Review proposed browser automation and authorize credential queries before execution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <span>Inspect Approvals</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>

        {/* Official Suite */}
        <div
          onClick={() => onNavigate('test-runner')}
          className="taste-bezel-outer group cursor-pointer hover:border-emerald-500/40"
        >
          <div className="taste-bezel-inner p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#0f1626] to-[#0a0f1d]">
            <div>
              <div className="flex items-center justify-between text-emerald-400 text-xs font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">TC1–TC4</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mt-3">Official Test Runner</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Execute the 4 mandatory hackathon scenarios with live assertion validation and audit evidence.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span>Execute Suite</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Verifications Audit Table */}
      <div className="taste-bezel-outer">
        <div className="taste-bezel-inner overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Verification Audits</h3>
              <p className="text-xs text-slate-400">Live feed of certificates evaluated by the agentic engine</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              <span>Full Audit History</span>
              <span>&rarr;</span>
            </button>
          </div>

          {recentVerifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileCheck2 className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No verification records found</p>
              <p className="text-xs text-slate-400 mt-1">Submit a verification or run the official test suite.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Credential ID</th>
                    <th className="px-5 py-3">Issuer</th>
                    <th className="px-5 py-3">Consent</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Outcome</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentVerifications.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">
                        {v.candidate_name}
                        <div className="text-[10px] font-normal text-slate-400 truncate max-w-[180px]">
                          {v.course_name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-blue-400 text-[11px]">
                        {v.credential_id}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 capitalize">
                        {v.issuer_slug.replace('-', ' ')}
                      </td>
                      <td className="px-5 py-3.5">
                        {v.candidate_consent ? (
                          <span className="text-[11px] font-semibold text-emerald-400">✓ On File</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-400">✗ Absent</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge outcome={v.outcome} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                        {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onNavigate('verification-result', v.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition"
                        >
                          Result
                        </button>
                        <button
                          onClick={() => onNavigate('evidence-viewer', v.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-md transition"
                        >
                          Evidence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
