import { Activity, ShieldCheck, Truck, Layers } from "lucide-react";
import { getTaxonomy } from "../utils/riskHeuristics";


const CATEGORIES = [
  { name: "Logistics & Transit", color: "bg-red-500", textColor: "text-red-500", borderColor: "border-red-500/20", icon: Truck },
  { name: "Operations & Capacity", color: "bg-amber-500", textColor: "text-amber-500", borderColor: "border-amber-500/20", icon: Layers },
  { name: "Regulatory & Quality", color: "bg-sky-500", textColor: "text-sky-500", borderColor: "border-sky-500/20", icon: ShieldCheck },
  { name: "External Infrastructure", color: "bg-[#86BC25]", textColor: "text-[#86BC25]", borderColor: "border-[#86BC25]/20", icon: Activity }
];

export default function SignalTaxonomy({ threatRows = [], selectedCategories = [], onSelectCategories, isDark }) {
  const total = threatRows.length;
  
  const categoryStats = CATEGORIES.map(cat => {
    const count = threatRows.filter(row => getTaxonomy(row.id) === cat.name).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    return { ...cat, count, percentage: parseInt(percentage) };
  });

  const containerBg = isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200";
  const headerBg = isDark ? "bg-[#0A0D14] border-[#1E293B]" : "bg-slate-50 border-slate-200";
  const headerText = isDark ? "text-slate-400" : "text-slate-500";
  const progressTrack = isDark ? "bg-[#1E293B]" : "bg-slate-100";

  return (
    <div
      id="signal-taxonomy-panel"
      className={`flex flex-col border rounded-none shadow-none h-full transition-colors duration-300 ${containerBg}`}
    >
      {/* Container Header */}
      <div className={`px-3 py-1.5 border-b flex items-center justify-between select-none transition-colors duration-300 ${headerBg}`}>
        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${headerText}`}>
          RISK TAXONOMY (MULTI-SELECT)
        </span>
        <span className={`text-[8px] font-mono uppercase ${headerText}`}>
          {total} ACTIVE
        </span>
      </div>

      {/* Categories Grid */}
      <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
        <div className="grid grid-cols-2 gap-2">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategories.includes(cat.name);
            return (
              <div
                key={cat.name}
                onClick={() => {
                  if (isSelected) {
                    onSelectCategories(prev => prev.filter(c => c !== cat.name));
                  } else {
                    onSelectCategories(prev => [...prev, cat.name]);
                  }
                }}
                className={`group p-2 border transition-all duration-75 cursor-pointer flex flex-col justify-between select-none rounded-none min-h-[58px] ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white"
                    : isDark
                      ? "bg-[#0F1520] border-[#1E293B] hover:bg-[#151C2C] text-slate-300"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white" : cat.textColor}`} />
                    <span className="text-[9.5px] font-bold font-sans tracking-tight leading-tight truncate">
                      {cat.name.split(" & ")[0]}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] font-bold shrink-0 ${isSelected ? "text-white" : isDark ? "text-slate-400" : "text-slate-700"}`}>
                    {cat.count}
                  </span>
                </div>

                <div className={`w-full h-1 rounded-none overflow-hidden mt-1.5 ${progressTrack}`}>
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className={`h-full transition-all duration-500 rounded-none ${isSelected ? "bg-[#86BC25]" : cat.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Filter Control */}
        {selectedCategories.length > 0 && (
          <button
            onClick={() => onSelectCategories([])}
            className={`w-full cursor-pointer text-center font-mono text-[8px] font-bold uppercase py-1 border transition-colors duration-75 mt-1 ${
              isDark
                ? "border-slate-700 hover:border-slate-400 bg-transparent text-slate-500 hover:text-slate-200"
                : "border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
          >
            Clear Selected Filter ({selectedCategories.length})
          </button>
        )}
      </div>
    </div>
  );
}
