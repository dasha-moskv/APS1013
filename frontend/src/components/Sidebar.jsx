import { useState } from "react";
import {
  Flame,
  Moon,
  Sun,
  Home,
  User,
  Users,
  FolderOpen,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Users, label: "Team", id: "team" },
  { icon: FolderOpen, label: "Folders", id: "folders" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export default function Sidebar() {
  const [activeNav, setActiveNav] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 bottom-0 z-50 flex w-[72px] flex-col items-center
                 bg-gradient-to-b from-[#ede7f6] to-[#e0d6f0] py-5"
      style={{
        boxShadow: "2px 0 20px rgba(108, 92, 231, 0.08)",
      }}
    >
      {/* ── Logo ── */}
      <div
        id="sidebar-logo"
        className="mb-6 flex h-10 w-10 items-center justify-center"
      >
        <Flame className="h-7 w-7 text-[#6c5ce7]" strokeWidth={2.2} />
      </div>

      {/* ── Dark-mode toggle ── */}
      <button
        id="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        className="mb-6 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full
                   bg-[#1a1a2e]/90 text-amber-300 shadow-md transition-all duration-300
                   hover:scale-110 hover:bg-[#1a1a2e]"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      {/* ── Navigation Icons ── */}
      <nav id="sidebar-nav" className="flex flex-1 flex-col items-center gap-2">
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = activeNav === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setActiveNav(id)}
              className={`group relative flex h-11 w-11 cursor-pointer items-center justify-center
                         rounded-full transition-all duration-300
                         ${
                           isActive
                             ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/30"
                             : "bg-white/60 text-[#6b7280] hover:bg-white hover:text-[#6c5ce7] hover:shadow-md"
                         }`}
              aria-label={label}
              title={label}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {/* Tooltip */}
              <span
                className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg
                           bg-[#1a1a2e] px-2.5 py-1 text-xs font-medium text-white opacity-0
                           shadow-lg transition-all duration-200 group-hover:opacity-100"
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <button
        id="sidebar-logout"
        onClick={() => {}}
        className="mt-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-full
                   text-[#ff6b6b]/70 transition-all duration-300
                   hover:bg-[#ff6b6b]/10 hover:text-[#ff6b6b]"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
    </aside>
  );
}
