import { Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header
      id="topbar"
      className="flex h-16 items-center gap-4 px-6"
    >
      {/* ── Search Bar ── */}
      <div
        id="topbar-search"
        className="relative flex flex-1 max-w-2xl items-center"
      >
        <Search className="absolute left-4 h-4 w-4 text-[#6b7280]" />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Search for mail, target group, people etc."
          className="h-10 w-full rounded-full border border-[#e5e7eb] bg-white pl-11 pr-4
                     text-sm text-[#1a1a2e] placeholder-[#9ca3af] shadow-sm
                     transition-all duration-300
                     focus:border-[#6c5ce7]/40 focus:shadow-md focus:shadow-[#6c5ce7]/5 focus:outline-none"
        />
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Dark rectangle placeholder ── */}
      <div
        id="topbar-cta"
        className="h-9 w-28 rounded-xl bg-[#1a1a2e] shadow-md transition-transform duration-200
                   hover:scale-105 cursor-pointer"
      />

      {/* ── Bell ── */}
      <button
        id="topbar-notifications"
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full
                   bg-[#1a1a2e] text-white shadow-md transition-all duration-200
                   hover:scale-105"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {/* notification dot */}
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ff6b6b]" />
      </button>

      {/* ── User profile ── */}
      <div id="topbar-profile" className="flex items-center gap-3 pl-2">
        {/* Avatar */}
        <div
          className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7]
                     shadow-md ring-2 ring-white"
        >
          <img
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=AlexW&backgroundColor=b6e3f4"
            alt="Alex Williamson avatar"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Name / email */}
        <div className="hidden flex-col md:flex">
          <span className="text-sm font-semibold leading-tight text-[#1a1a2e]">
            Alex Williamson
          </span>
          <span className="text-xs text-[#6b7280]">
            williamson123@gmail.com
          </span>
        </div>
      </div>
    </header>
  );
}
