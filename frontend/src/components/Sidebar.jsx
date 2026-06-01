import {
  Moon,
  Sun,
  Radio,
  FileText,
  Activity,
  PlayCircle,
  ShieldAlert,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: Radio, label: "Risk Radar", id: "radar" },
  { icon: FileText, label: "Base Ingest", id: "ingest" },
  { icon: Activity, label: "Mitigation Playbooks", id: "playbooks" },
  { icon: ShieldAlert, label: "AI Judge & Governance", id: "governance" },
];

export default function Sidebar({ isDark, toggleDark, activeTab, setActiveTab }) {
  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 bottom-0 z-50 flex w-16 flex-col items-center
                 bg-[#0D111A] border-r border-[#1E293B] py-4 animate-fade-in"
    >
      {/* ── Corporate Brand Logo (D. Style) ── */}
      <div
        id="sidebar-logo"
        className="mb-6 flex h-10 w-10 items-center justify-center font-sans select-none"
      >
        <span className="text-2xl font-bold text-white tracking-tighter">
          R<span className="text-[#86BC25]">.</span>
        </span>
      </div>

      {/* ── Sleek Dark Mode Toggle ── */}
      <button
        id="dark-mode-toggle"
        onClick={toggleDark}
        className="mb-8 flex h-8 w-8 cursor-pointer items-center justify-center rounded-none
                   border border-[#1E293B] bg-[#161B26] text-slate-400 hover:text-white 
                   hover:border-slate-500 transition-all duration-150"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
      </button>

      {/* ── Navigation Icons ── */}
      <nav id="sidebar-nav" className="flex w-full flex-1 flex-col items-center gap-1">
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setActiveTab(id)}
              className={`group relative flex h-12 w-full cursor-pointer items-center justify-center
                         rounded-none transition-all duration-150 border-y border-transparent
                         ${
                           isActive
                             ? "bg-[#161B26] text-white border-l-4 border-l-[#86BC25]"
                             : "text-slate-400 hover:bg-[#111520] hover:text-white"
                         }`}
              aria-label={label}
              title={label}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#86BC25]" : ""}`} strokeWidth={2} />
              
              {/* Telemetry Tooltip */}
              <span
                className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-none
                           border border-slate-700 bg-black px-2 py-1 text-[10px] font-mono 
                           text-white opacity-0 transition-opacity duration-100 group-hover:opacity-100 uppercase tracking-wider"
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer / Logout (Visual Placeholder) ── */}
      <button
        id="sidebar-logout"
        onClick={() => {}}
        className="mt-auto flex h-12 w-full cursor-pointer items-center justify-center rounded-none
                   text-slate-500 hover:bg-[#2D1616] hover:text-red-400 transition-all duration-150"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
      </button>
    </aside>
  );
}
