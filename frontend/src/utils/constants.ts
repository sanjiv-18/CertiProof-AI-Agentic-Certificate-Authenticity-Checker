/**
 * Frontend application constants and outcome color mappings.
 */

export const OUTCOME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VERIFIED: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
  },
  MISMATCH: {
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-700/60',
  },
  NOT_FOUND: {
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-700/60',
  },
  UNRESOLVED: {
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-700/60',
  },
  NOT_CHECKED: {
    bg: 'bg-slate-900/60',
    text: 'text-slate-400',
    border: 'border-slate-700/60',
  },
};

export const APP_CONFIG = {
  name: 'CertiProof AI',
  tagline: 'Autonomous Certificate Authenticity Verification Agent',
  team: 'Infinity Castle',
  hackathon: 'Ziro.Digital Agentic AI Hackathon 2026',
};
