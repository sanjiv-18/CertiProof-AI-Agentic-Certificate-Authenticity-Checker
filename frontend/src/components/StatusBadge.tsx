import React from 'react';
import type { VerificationOutcome, VerificationStatus } from '../types';

interface StatusBadgeProps {
  outcome?: VerificationOutcome | null;
  status?: VerificationStatus | string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ outcome, status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider',
    md: 'px-2.5 py-1 text-xs tracking-wider',
    lg: 'px-3.5 py-1.5 text-xs font-bold tracking-widest',
  }[size];

  if (outcome) {
    switch (outcome) {
      case 'VERIFIED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
            VERIFIED
          </span>
        );
      case 'MISMATCH':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)] ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]"></span>
            MISMATCH
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span>
            NOT FOUND
          </span>
        );
      case 'UNRESOLVED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)] ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]"></span>
            UNRESOLVED
          </span>
        );
      case 'NOT_CHECKED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            NOT CHECKED
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case 'AWAITING_APPROVAL':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)] animate-pulse ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]"></span>
            AWAITING APPROVAL
          </span>
        );
      case 'RUNNING':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            RUNNING
          </span>
        );
      case 'PENDING':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700/80 ${sizeClasses}`}>
            PENDING
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase bg-slate-800/80 text-slate-400 border border-slate-700 ${sizeClasses}`}>
            CANCELLED
          </span>
        );
      case 'DONE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase bg-slate-800/80 text-slate-300 border border-slate-700 ${sizeClasses}`}>
            DONE
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  return null;
};
