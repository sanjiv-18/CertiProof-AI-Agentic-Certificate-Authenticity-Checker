import React, { useEffect, useState } from 'react';
import {
  Server,
  Shield,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Lock,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { IssuerSource } from '../types';

export const SettingsPage: React.FC = () => {
  const [issuers, setIssuers] = useState<IssuerSource[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuersData, healthData] = await Promise.all([
        apiClient.getIssuers(),
        apiClient.getHealth(),
      ]);
      setIssuers(issuersData);
      setHealth(healthData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="taste-eyebrow text-blue-400 border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>System Configuration</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Settings &amp; Issuer Source Configuration
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Manage public course-platform issuer adapters, safety parameters, and audit policies.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08] transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* System Health Card */}
      <div className="taste-bezel-outer">
        <div className="taste-bezel-inner p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-white tracking-tight">FastAPI Verification Gateway</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Service: {health?.service || 'CertiProof AI'} &bull; Version: {health?.version || '1.0.0'}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono">
            <div className="text-slate-300 font-bold">SQLAlchemy 2.0 ORM</div>
            <div className="text-[10px] text-slate-400">Relational SQLite Audit Store</div>
          </div>
        </div>
      </div>

      {/* Extensible Issuer Adapters */}
      <div className="taste-bezel-outer">
        <div className="taste-bezel-inner overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">Configured Issuer Adapters</h3>
              <p className="text-xs text-slate-400">
                Permitted public course verification pages and test simulator adapters
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {issuers.length} Active Adapters
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {issuers.map((iss) => (
              <div key={iss.id} className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-white">{iss.name}</h4>
                      <code className="text-xs font-mono bg-white/[0.04] text-blue-300 px-2 py-0.5 rounded border border-white/[0.08]">
                        {iss.slug}
                      </code>
                      {iss.slug === 'mock-issuer' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                          TEST SIMULATOR
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{iss.notes}</p>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                    <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">Base URL</span>
                    <a
                      href={iss.base_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-blue-400 hover:underline flex items-center gap-1.5 text-xs mt-1"
                    >
                      <span className="truncate">{iss.base_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                    <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">Adapter Class</span>
                    <span className="font-mono text-slate-200 text-xs font-bold mt-1 block">
                      {iss.adapter_class}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Compliance Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anti-Scraping & Safety Guardrail */}
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Ethical Browser Automation Guardrail</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              CertiProof AI does <strong>not</strong> bypass CAPTCHAs, OTPs, paywalls, or authenticated portal
              restrictions. All lookups query strictly public issuer verification endpoints. If an issuer
              implements bot challenge measures, the agent flags the lookup as <code>UNRESOLVED</code> rather
              than attempting circumvention.
            </p>
          </div>
        </div>

        {/* Data Privacy & Retention Policy */}
        <div className="taste-bezel-outer">
          <div className="taste-bezel-inner p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Candidate Data Privacy &amp; Consent</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Personal data is restricted to candidate name and course identifiers. Passwords and secrets are
              never stored in client-side code or unencrypted logs. Synthetic test data can be purged, and every
              verification request requires explicit consent on file before retrieval is permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
