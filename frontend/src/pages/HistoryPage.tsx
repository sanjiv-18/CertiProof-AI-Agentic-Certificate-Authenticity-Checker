import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { VerificationSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import type { ScreenId } from '../components/Sidebar';

interface HistoryPageProps {
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [verifications, setVerifications] = useState<VerificationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getVerifications(0, 100);
      setVerifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = verifications.filter((v) => {
    const matchesSearch =
      v.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.credential_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOutcome =
      outcomeFilter === 'ALL' || v.outcome === outcomeFilter;

    const matchesStatus =
      statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesOutcome && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="taste-eyebrow text-blue-400 border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Audit Trail</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Verification History &amp; Audit Log
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Searchable, auditable database records of all evaluated candidate certificates.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08] transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="taste-bezel-outer p-1 bg-white/[0.02]">
        <div className="taste-bezel-inner p-4 flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, credential ID, course, or record UUID..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-black/40 text-white placeholder-slate-500 border border-white/[0.08] focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono">Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-black/40 text-white border border-white/[0.08] focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="MISMATCH">MISMATCH</option>
              <option value="NOT_FOUND">NOT FOUND</option>
              <option value="UNRESOLVED">UNRESOLVED</option>
              <option value="NOT_CHECKED">NOT CHECKED</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-black/40 text-white border border-white/[0.08] focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All States</option>
              <option value="AWAITING_APPROVAL">AWAITING APPROVAL</option>
              <option value="RUNNING">RUNNING</option>
              <option value="DONE">DONE</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="taste-bezel-outer">
        <div className="taste-bezel-inner overflow-hidden">
          <div className="px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Audited <strong>{filtered.length}</strong> of {verifications.length} records
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <History className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching verification records</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 uppercase font-mono text-[10px] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-5 py-3">Record ID</th>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Credential ID</th>
                    <th className="px-5 py-3">Issuer</th>
                    <th className="px-5 py-3">Consent</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Outcome</th>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400">
                        {v.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3.5 font-bold text-white">
                        {v.candidate_name}
                        <div className="text-[10px] font-normal text-slate-400 truncate max-w-[170px]">
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
                          <span className="text-emerald-400 font-semibold text-[11px] font-mono">✓ Yes</span>
                        ) : (
                          <span className="text-rose-400 font-semibold text-[11px] font-mono">✗ Absent</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge outcome={v.outcome} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                        {new Date(v.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1">
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
