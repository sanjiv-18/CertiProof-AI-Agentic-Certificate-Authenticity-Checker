import {
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  currentScreenName: string;
  pendingApprovalsCount?: number;
  onOpenApprovalQueue: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreenName,
  pendingApprovalsCount = 0,
  onOpenApprovalQueue,
}) => {
  return (
    <header className="h-16 bg-[#080c14]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 flex items-center justify-between shrink-0 z-10 sticky top-0">
      {/* Active Screen Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="text-slate-400 font-medium">CertiProof</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <h2 className="text-sm font-bold text-white tracking-tight">
          {currentScreenName}
        </h2>
      </div>

      {/* Right status & actions */}
      <div className="flex items-center gap-3">
        {/* Pending approvals double-bezel pill */}
        {pendingApprovalsCount > 0 ? (
          <button
            onClick={onOpenApprovalQueue}
            className="group relative p-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200"
          >
            <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-ping"></span>
              <span>{pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Approval</span>
              <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform text-[11px]">&rarr;</span>
            </div>
          </button>
        ) : (
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
            <span>Policy Guardrails Enforced</span>
          </div>
        )}

        {/* Hackathon Badge */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/[0.08] text-xs">
          <div className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="font-semibold text-white">Ziro AI 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
};
