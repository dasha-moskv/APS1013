import { ChevronDown } from "lucide-react";

const rows = [
  {
    id: 1,
    supplyBase: "Aecons Ltd.",
    signalType: "Labor Strikes",
    severity: { value: "9/10", color: "#ff6b6b", bg: "#ff6b6b18" },
    likelihood: { value: "85%", color: "#feca57", bg: "#feca5718" },
    timeToHit: { value: "12 days", color: "#48dbfb", bg: "#48dbfb18" },
  },
  {
    id: 2,
    supplyBase: "Nextera Inc.",
    signalType: "Raw Material Shortage",
    severity: { value: "7/10", color: "#feca57", bg: "#feca5718" },
    likelihood: { value: "62%", color: "#feca57", bg: "#feca5718" },
    timeToHit: { value: "30 days", color: "#00d2d3", bg: "#00d2d318" },
  },
  {
    id: 3,
    supplyBase: "Greenfield Co.",
    signalType: "Port Congestion",
    severity: { value: "5/10", color: "#48dbfb", bg: "#48dbfb18" },
    likelihood: { value: "40%", color: "#00d2d3", bg: "#00d2d318" },
    timeToHit: { value: "45 days", color: "#00d2d3", bg: "#00d2d318" },
  },
];

export default function HealthMonitorTable() {
  return (
    <div
      id="slot-table"
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]"
    >
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a2e]">Health Monitor</h2>
          <p className="text-sm text-[#6b7280]">
            An overview of threat signals across all supply bases
          </p>
        </div>
        <button
          id="table-date-filter"
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#e5e7eb]
                     px-3 py-1.5 text-sm font-medium text-[#1a1a2e] transition-colors
                     duration-200 hover:border-[#6c5ce7]/30 hover:text-[#6c5ce7]"
        >
          April 2024
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table id="health-monitor-table" className="w-full text-left">
          <thead>
            <tr className="border-b border-[#e5e7eb]">
              <th className="w-10 pb-3 pr-4" />
              <th className="pb-3 pr-4 text-sm font-semibold text-[#6b7280]">
                Supply Base
              </th>
              <th className="pb-3 pr-4 text-sm font-semibold text-[#6b7280]">
                Signal Type
              </th>
              <th className="pb-3 pr-4 text-sm font-semibold text-[#6b7280]">
                Severity
              </th>
              <th className="pb-3 pr-4 text-sm font-semibold text-[#6b7280]">
                Likelihood
              </th>
              <th className="pb-3 pr-4 text-sm font-semibold text-[#6b7280]">
                Time-to-hit
              </th>
              <th className="pb-3 text-sm font-semibold text-[#6b7280]" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="group border-b border-[#f3f4f6] transition-colors duration-200
                           hover:bg-[#f8f7ff]"
              >
                {/* Checkbox */}
                <td className="py-4 pr-4">
                  <input
                    type="checkbox"
                    id={`row-checkbox-${row.id}`}
                    className="h-4 w-4 cursor-pointer rounded border-[#d1d5db] accent-[#6c5ce7]"
                  />
                </td>
                <td className="py-4 pr-4 text-sm font-medium text-[#1a1a2e]">
                  {row.supplyBase}
                </td>
                <td className="py-4 pr-4 text-sm text-[#6b7280]">
                  {row.signalType}
                </td>
                <td className="py-4 pr-4">
                  <span
                    className="inline-block rounded-md px-3 py-1 text-xs font-bold"
                    style={{
                      color: row.severity.color,
                      backgroundColor: row.severity.bg,
                    }}
                  >
                    {row.severity.value}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span
                    className="inline-block rounded-md px-3 py-1 text-xs font-bold"
                    style={{
                      color: row.likelihood.color,
                      backgroundColor: row.likelihood.bg,
                    }}
                  >
                    {row.likelihood.value}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span
                    className="inline-block rounded-md px-3 py-1 text-xs font-bold"
                    style={{
                      color: row.timeToHit.color,
                      backgroundColor: row.timeToHit.bg,
                    }}
                  >
                    {row.timeToHit.value}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button
                    className="cursor-pointer text-xs font-medium text-[#6b7280] transition-colors
                               duration-200 hover:text-[#6c5ce7]"
                  >
                    Details &gt;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
