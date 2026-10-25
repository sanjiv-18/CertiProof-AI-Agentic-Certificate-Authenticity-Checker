import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  FileSearch,
  FolderOpen,
  History,
  TestTube2,
  Settings,
  Fingerprint,
} from 'lucide-react';

export type ScreenId =
  | 'overview'
  | 'new-verification'
  | 'approval-queue'
  | 'verification-result'
  | 'evidence-viewer'
  | 'history'
  | 'test-runner'
  | 'settings';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  pendingApprovalsCount = 0,
}) => {
  const menuItems = [
    {
      id: 'overview' as ScreenId,
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'new-verification' as ScreenId,
      label: 'New Verification',
      icon: ShieldCheck,
    },
    {
      id: 'approval-queue' as ScreenId,
      label: 'Human Approval Queue',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      id: 'verification-result' as ScreenId,
      label: 'Verification Result',
      icon: FileSearch,
    },
    {
      id: 'evidence-viewer' as ScreenId,
      label: 'Evidence Viewer',
      icon: FolderOpen,
    },
    {
      id: 'history' as ScreenId,
      label: 'Verification History',
      icon: History,
    },
    {
      id: 'test-runner' as ScreenId,
      label: 'Official Test Runner',
      icon: TestTube2,
      tag: 'TC1–TC4',
    },
    {
      id: 'settings' as ScreenId,
      label: 'Settings & Issuers',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#070b14] text-slate-300 flex flex-col shrink-0 border-r border-white/[0.06] select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <div className="w-full h-full bg-[#070b14] rounded-[11px] flex items-center justify-center text-blue-400">
              <Fingerprint className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">
                CertiProof
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Team Infinity Castle
            </p>
          </div>
        </div>

        <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-400 flex items-center justify-between">
          <span className="font-mono tracking-wider uppercase text-[9px] text-slate-400">Hackathon 2026</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
            Agentic Live
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-400 px-3 pb-2 font-mono">
          Control Plane
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                isActive
                  ? 'bg-blue-600/15 text-white border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'bg-white/[0.03] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse">
                  {item.badge}
                </span>
              )}
              {item.tag && (
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/[0.05] text-slate-400 border border-white/[0.06]">
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/[0.06] text-[11px] text-slate-400 bg-black/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Deterministic Engine</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px] font-mono">
            Active
          </span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 truncate font-mono">
          Audited: Public Issuer APIs
        </div>
      </div>
    </aside>
  );
};
