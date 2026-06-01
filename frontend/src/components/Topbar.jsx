import { Search, Bell, Play } from "lucide-react";

export default function Topbar({ onTriggerDemoSignal, signalsLeft, isDark }) {
  return (
    <header
      id="topbar"
      className={`flex h-12 items-center gap-4 border-b px-6 font-sans transition-colors duration-300 ${
        isDark
          ? "border-[#1E293B] bg-[#0D111A] text-white"
          : "border-slate-200 bg-white text-[#0F172A]"
      }`}
    >
      {/* ── Corporate Breadcrumbs & System Identity ── */}
      <div className="hidden items-center gap-2 md:flex">
        <span className={`text-[10px] font-bold uppercase tracking-wider font-sans ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          SUPPLY NETWORK RISK PORTAL
        </span>
        <span className={isDark ? "text-slate-700" : "text-slate-300"}>|</span>
        <span className={`text-[10px] font-mono font-medium ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          DELOITTE ANALYTICS
        </span>
      </div>

      {/* ── Search Bar ── */}
      <div id="topbar-search" className="relative flex flex-1 max-w-sm items-center">
        <Search className={`absolute left-3 h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Search facilities, commodities, or risk signals..."
          className={`h-8 w-full rounded-none border pl-9 pr-3 text-xs font-sans
                     transition-all duration-150 focus:ring-1 focus:ring-[#86BC25] focus:outline-none focus:border-[#86BC25] ${
            isDark
              ? "border-[#1E293B] bg-[#161B26] text-white placeholder-slate-500"
              : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400"
          }`}
        />
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Live Telemetry Ingestion Simulator ── */}
      <button
        onClick={onTriggerDemoSignal}
        disabled={signalsLeft === 0}
        className={`flex cursor-pointer items-center gap-1.5 border px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider rounded-none transition-colors duration-150 select-none
                   ${signalsLeft > 0 
                     ? "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25] hover:bg-[#86BC25] hover:text-black" 
                     : isDark
                       ? "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"
                       : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"}`}
      >
        <Play className="h-3 w-3" fill={signalsLeft > 0 ? "currentColor" : "none"} />
        Simulate Live Signal ({signalsLeft} Left)
      </button>

      {/* ── Live System Telemetry Status ── */}
      <div
        id="topbar-status-radar"
        className={`flex items-center gap-2 border px-3 py-1 font-mono text-[9px] transition-colors duration-300 ${
          isDark ? "border-[#1E293B] bg-[#111520]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#86BC25] opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#86BC25]"></span>
        </span>
        <span className={`font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          RADAR ACTIVE
        </span>
      </div>

      {/* ── Notifications ── */}
      <button
        id="topbar-notifications"
        className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border transition-colors duration-150 ${
          isDark
            ? "border-[#1E293B] bg-[#161B26] text-slate-400 hover:border-slate-500 hover:text-white"
            : "border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-700"
        }`}
        aria-label="Notifications"
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-none bg-[#86BC25]" />
      </button>

      {/* ── Corporate User Profile ── */}
      <div id="topbar-profile" className={`flex items-center gap-3 border-l pl-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className={`h-8 w-8 overflow-hidden rounded-none border p-0.5 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-100"}`}>
          <img
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexW&backgroundColor=b6e3f4"
            alt="Alex Williamson avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="hidden flex-col md:flex">
          <span className={`text-xs font-semibold leading-none ${isDark ? "text-white" : "text-slate-800"}`}>
            Alex Williamson
          </span>
          <span className={`text-[9px] font-mono tracking-tight mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Senior Risk Analyst
          </span>
        </div>
      </div>
    </header>
  );
}
