import { Search, Bell, Play } from "lucide-react";

export default function Topbar({ onTriggerDemoSignal, mockSignalsLeft }) {
  return (
    <header
      id="topbar"
      className="flex h-12 items-center gap-4 border-b border-[#1E293B] bg-[#0D111A] px-6 font-sans text-white"
    >
      {/* ── Corporate Breadcrumbs & System Identity ── */}
      <div className="hidden items-center gap-2 md:flex">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
          SUPPLY NETWORK RISK PORTAL
        </span>
        <span className="text-slate-700">|</span>
        <span className="text-[10px] font-mono font-medium text-slate-300">
          DELOITTE ANALYTICS
        </span>
      </div>

      {/* ── Search Bar (Sharp, Dark Terminal Styling) ── */}
      <div
        id="topbar-search"
        className="relative flex flex-1 max-w-sm items-center"
      >
        <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Search facilities, commodities, or risk signals..."
          className="h-8 w-full rounded-none border border-[#1E293B] bg-[#161B26] pl-9 pr-3
                     text-xs text-white placeholder-slate-500 font-sans
                     transition-all duration-150
                     focus:border-[#86BC25] focus:ring-1 focus:ring-[#86BC25] focus:outline-none"
        />
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Live Telemetry Ingestion Simulator ── */}
      <button
        onClick={onTriggerDemoSignal}
        disabled={mockSignalsLeft === 0}
        className={`flex cursor-pointer items-center gap-1.5 border px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider rounded-none transition-colors duration-150 select-none
                   ${mockSignalsLeft > 0 
                     ? "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25] hover:bg-[#86BC25] hover:text-black" 
                     : "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"}`}
      >
        <Play className="h-3 w-3" fill={mockSignalsLeft > 0 ? "currentColor" : "none"} />
        Simulate Live Signal ({mockSignalsLeft} Left)
      </button>

      {/* ── Live System Telemetry Status ── */}
      <div
        id="topbar-status-radar"
        className="flex items-center gap-2 border border-[#1E293B] bg-[#111520] px-3 py-1 font-mono text-[9px]"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#86BC25] opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#86BC25]"></span>
        </span>
        <span className="font-bold uppercase tracking-wider text-slate-300">
          RADAR ACTIVE
        </span>
      </div>

      {/* ── Notifications (Sharp, Dark-Themed) ── */}
      <button
        id="topbar-notifications"
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-none
                   border border-[#1E293B] bg-[#161B26] text-slate-400 transition-colors duration-150
                   hover:border-slate-500 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-3.5 w-3.5" />
        {/* Crisp green alert dot */}
        <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-none bg-[#86BC25]" />
      </button>

      {/* ── Corporate User Profile ── */}
      <div id="topbar-profile" className="flex items-center gap-3 border-l border-slate-800 pl-4">
        {/* Square Border Avatar */}
        <div className="h-8 w-8 overflow-hidden rounded-none border border-slate-700 p-0.5 bg-slate-800">
          <img
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexW&backgroundColor=b6e3f4"
            alt="Alex Williamson avatar"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Corporate Name / Title */}
        <div className="hidden flex-col md:flex">
          <span className="text-xs font-semibold leading-none text-white">
            Alex Williamson
          </span>
          <span className="text-[9px] text-slate-400 font-mono tracking-tight mt-1">
            Senior Risk Analyst
          </span>
        </div>
      </div>
    </header>
  );
}
