import React, { useEffect, useState } from 'react';
import {
  TestTube2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { TestCaseDefinition, TestCaseRun } from '../types';
import type { ScreenId } from '../components/Sidebar';

interface TestRunnerPageProps {
  onNavigate: (screen: ScreenId, verificationId?: string) => void;
}

export const TestRunnerPage: React.FC<TestRunnerPageProps> = ({ onNavigate }) => {
  const [testCases, setTestCases] = useState<TestCaseDefinition[]>([]);
  const [testResults, setTestResults] = useState<TestCaseRun[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [cases, results] = await Promise.all([
        apiClient.getTestCases(),
        apiClient.getTestResults(),
      ]);
      setTestCases(cases);
      setTestResults(results);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load test suite');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAll = async () => {
    try {
      setRunning(true);
      setError(null);
      const results = await apiClient.runTests(['TC1', 'TC2', 'TC3', 'TC4']);
      setTestResults((prev) => [...results, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'Test suite execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleRunSingle = async (testId: string) => {
    try {
      setActiveTestId(testId);
      setError(null);
      const results = await apiClient.runTests([testId]);
      setTestResults((prev) => [...results, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'Test execution failed');
    } finally {
      setActiveTestId(null);
    }
  };

  const getLatestResult = (testId: string) => {
    return testResults.find((r) => r.test_id === testId);
  };

  const allPassed =
    testCases.length > 0 &&
    testCases.every((tc) => {
      const res = getLatestResult(tc.id);
      return res && res.passed === true;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="taste-eyebrow text-emerald-400 border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Hackathon Official Suite</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Official Hackathon Test-Case Runner
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Automated test deck validating all 4 mandatory problem statement scenarios (TC1–TC4).
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={running}
          className="taste-btn-primary group"
        >
          {running ? (
            <>
              <span>Running Verification Suite...</span>
              <div className="taste-btn-icon-wrapper">
                <Clock className="w-3.5 h-3.5 animate-spin text-white" />
              </div>
            </>
          ) : (
            <>
              <span>Run All 4 Official Test Cases</span>
              <div className="taste-btn-icon-wrapper">
                <Play className="w-3 h-3 text-white fill-current" />
              </div>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Summary Status Hardware Banner */}
      <div className="taste-bezel-outer">
        <div className="taste-bezel-inner p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                allPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
              }`}
            >
              {allPassed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <TestTube2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                {allPassed ? '100% Official Scenarios Validated' : 'Evaluation Test Deck Ready'}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic assertion logic confirms classification rules, consent blocking, and mock evidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.06]">
              TC1: VERIFIED
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.06]">
              TC2: MISMATCH
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.06]">
              TC3: NOT FOUND
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.06]">
              TC4: NOT CHECKED
            </span>
          </div>
        </div>
      </div>

      {/* Test Cases Deck */}
      <div className="space-y-4">
        {testCases.map((tc) => {
          const latest = getLatestResult(tc.id);
          const isThisRunning = activeTestId === tc.id || (running && !latest);

          return (
            <div
              key={tc.id}
              className={`taste-bezel-outer transition-all duration-300 ${
                latest?.passed === true
                  ? 'border-emerald-500/30'
                  : latest?.passed === false
                  ? 'border-rose-500/40'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="taste-bezel-inner p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30">
                      {tc.id}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{tc.name}</h3>

                    {/* PASS / FAIL Badge */}
                    {latest && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold ${
                          latest.passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {latest.passed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            PASS
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            FAIL
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{tc.description}</p>

                  {/* Input vs Expected vs Actual Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                      <span className="text-slate-400 block uppercase font-mono font-bold text-[10px]">
                        Input Parameters
                      </span>
                      <span className="font-bold text-white mt-1 block">{tc.candidate_name}</span>
                      <div className="font-mono text-blue-400 text-[11px] truncate mt-0.5">{tc.credential_id}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Consent: {tc.candidate_consent ? '✓ On File' : '✗ Absent (Blocked)'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                      <span className="text-slate-400 block uppercase font-mono font-bold text-[10px]">
                        Expected Outcome
                      </span>
                      <span className="font-mono font-bold text-blue-400 text-sm mt-1 block">
                        {tc.expected_outcome}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">Assertion target</div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                      <span className="text-slate-400 block uppercase font-mono font-bold text-[10px]">
                        Actual Outcome
                      </span>
                      {latest?.actual_outcome ? (
                        <span
                          className={`font-mono font-bold text-sm mt-1 block ${
                            latest.actual_outcome === tc.expected_outcome
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {latest.actual_outcome}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs mt-1 block font-mono">Pending execution</span>
                      )}
                      {latest?.run_at && (
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Timestamp: {new Date(latest.run_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {latest?.evidence_summary && (
                    <div className="text-[11px] text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/[0.06] font-mono leading-relaxed">
                      <strong className="text-blue-400">Audit:</strong> {latest.evidence_summary}
                    </div>
                  )}
                </div>

                {/* Single Run Action */}
                <div className="flex md:flex-col items-center justify-end gap-2.5 shrink-0">
                  <button
                    onClick={() => handleRunSingle(tc.id)}
                    disabled={isThisRunning || running}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-white/[0.04] text-slate-200 border border-white/[0.08] hover:bg-white/[0.08] transition disabled:opacity-50"
                  >
                    {isThisRunning ? (
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>Run {tc.id}</span>
                  </button>

                  {latest?.verification_id && (
                    <button
                      onClick={() => onNavigate('verification-result', latest.verification_id!)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition"
                    >
                      <span>View Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
