import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapPlaceholder from "./components/MapPlaceholder";
import KpiCards from "./components/KpiCards";
import HealthMonitorTable from "./components/HealthMonitorTable";

export default function App() {
  return (
    <div id="app-shell" className="flex min-h-screen bg-[#f4f5f7]">
      {/* ── Fixed Sidebar ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div className="ml-[72px] flex flex-1 flex-col">
        {/* ── Topbar ── */}
        <Topbar />

        {/* ── Dashboard Grid ── */}
        <main id="dashboard-content" className="flex-1 px-6 pb-6">
          {/*
            Grid layout:
            - Top row: Map (spans ~65%) | KPI cards (spans ~35%)
            - Bottom row: Table (full width)
          */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            {/* ── Top-left: Map ── */}
            <MapPlaceholder />

            {/* ── Top-right: KPI Cards (stacked) ── */}
            <KpiCards />
          </div>

          {/* ── Bottom: Health Monitor Table ── */}
          <div className="mt-4">
            <HealthMonitorTable />
          </div>
        </main>
      </div>
    </div>
  );
}
