import { 
  Scale, 
  Factory, 
  EyeOff, 
  Globe, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  CheckSquare, 
  Users, 
  Truck, 
  CloudLightning, 
  Activity 
} from "lucide-react";
import { getTaxonomy } from "../utils/riskHeuristics";

const DEFAULT_CATEGORIES = [
  { 
    name: "Regulatory & Compliance", 
    color: "bg-blue-500", 
    textColor: "text-blue-500", 
    borderColor: "border-blue-500/20", 
    icon: Scale,
    description: "Risks arising from import/export controls, compliance standards, legal rulings, sanctions, and FAA regulations."
  },
  { 
    name: "Manufacturing & Supply", 
    color: "bg-amber-500", 
    textColor: "text-amber-500", 
    borderColor: "border-amber-500/20", 
    icon: Factory,
    description: "Capacity constraints, single points of failure, material shortages, and production facility shutdowns."
  },
  { 
    name: "Foreign Ownership, Control, or Influence (FOCI)", 
    color: "bg-indigo-500", 
    textColor: "text-indigo-500", 
    borderColor: "border-indigo-500/20", 
    icon: EyeOff,
    description: "Adversarial ownership, unauthorized tech transfer, corporate espionage, or geopolitical control risk."
  },
  { 
    name: "Political", 
    color: "bg-purple-500", 
    textColor: "text-purple-500", 
    borderColor: "border-purple-500/20", 
    icon: Globe,
    description: "Geopolitical trade disputes, localized civil unrest, regional conflicts, and governmental instability."
  },
  { 
    name: "Technology & Cybersecurity", 
    color: "bg-red-500", 
    textColor: "text-red-500", 
    borderColor: "border-red-500/20", 
    icon: ShieldAlert,
    description: "Malware, ransomware campaigns, software vulnerabilities, and compromised IT/OT vendor networks."
  },
  { 
    name: "Financial", 
    color: "bg-emerald-500", 
    textColor: "text-emerald-500", 
    borderColor: "border-emerald-500/20", 
    icon: DollarSign,
    description: "Supplier bankruptcy, liquidity shortfalls, capital shortages, and severe cost escalations."
  },
  { 
    name: "Economic", 
    color: "bg-teal-500", 
    textColor: "text-teal-500", 
    borderColor: "border-teal-500/20", 
    icon: TrendingUp,
    description: "Macroeconomic pressures, inflation surges, currency swings, and shifting market demand."
  },
  { 
    name: "Product Quality & Design", 
    color: "bg-cyan-500", 
    textColor: "text-cyan-500", 
    borderColor: "border-cyan-500/20", 
    icon: CheckSquare,
    description: "Component defects, material inspection failures, component recall notices, and testing backlogs."
  },
  { 
    name: "Human Capital", 
    color: "bg-orange-500", 
    textColor: "text-orange-500", 
    borderColor: "border-orange-500/20", 
    icon: Users,
    description: "Labor strikes, safety walkouts, staffing deficits, and technical talent constraints."
  },
  { 
    name: "Transportation & Distribution", 
    color: "bg-rose-500", 
    textColor: "text-rose-500", 
    borderColor: "border-rose-500/20", 
    icon: Truck,
    description: "Logistics route delays, shipping bottlenecks, customs blockades, and port congestion."
  },
  { 
    name: "Environmental", 
    color: "bg-sky-500", 
    textColor: "text-sky-500", 
    borderColor: "border-sky-500/20", 
    icon: CloudLightning,
    description: "Natural disasters, extreme weather events, earthquakes, and resource scarcity."
  },
  { 
    name: "Infrastructure", 
    color: "bg-[#86BC25]", 
    textColor: "text-[#86BC25]", 
    borderColor: "border-[#86BC25]/20", 
    icon: Activity,
    description: "Utility grid outages, SCADA system alerts, physical equipment maintenance, and factory tool damage."
  }
];

const ICON_MAP = {
  Scale, 
  Factory, 
  EyeOff, 
  Globe, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  CheckSquare, 
  Users, 
  Truck, 
  CloudLightning, 
  Activity 
};

export default function SignalTaxonomy({ threatRows = [], selectedCategories = [], onSelectCategories, isDark, categories }) {
  const total = threatRows.length;
  
  const activeCategories = categories ? categories.map(cat => ({
    ...cat,
    icon: ICON_MAP[cat.icon] || Activity
  })) : DEFAULT_CATEGORIES;

  const categoryStats = activeCategories.map(cat => {
    const count = threatRows.filter(row => getTaxonomy(row) === cat.name).length;
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
          {categoryStats.map((cat, idx) => {
            const Icon = cat.icon || Activity;
            const isSelected = selectedCategories.includes(cat.name);
            const tooltipAlign = idx % 2 === 0 ? "left-0" : "right-0";
            const tooltipPosition = idx < 2 ? "top-full mt-2" : "bottom-full mb-2";
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
                className={`group relative p-2 border transition-all duration-75 cursor-pointer flex flex-col justify-between select-none rounded-none min-h-[58px] ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white"
                    : isDark
                      ? `bg-[#0F1520] ${cat.borderColor || "border-[#1E293B]"} hover:bg-[#151C2C] text-slate-300`
                      : `bg-white ${cat.borderColor || "border-slate-200"} hover:bg-slate-50 text-slate-800`
                }`}
              >
                {/* Tooltip Overlay */}
                {cat.description && (
                  <div className={`pointer-events-none absolute ${tooltipPosition} ${tooltipAlign} z-[100] w-64 max-w-[calc(100vw-32px)] p-3 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                    isDark
                      ? "bg-[#0A0D14]/95 border-[#1E293B] text-slate-200 backdrop-blur-md"
                      : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                  }`}>
                    <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                      {cat.color && <span className={`h-2 w-2 rounded-none ${cat.color}`} />}
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${cat.textColor || ""}`}>{cat.name}</span>
                    </div>
                    <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {cat.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white" : cat.textColor || ""}`} />
                    <span className="text-[9.5px] font-bold font-sans tracking-tight leading-tight truncate">
                      {cat.name ? cat.name.split(" & ")[0] : ""}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] font-bold shrink-0 ${isSelected ? "text-white" : isDark ? "text-slate-400" : "text-slate-700"}`}>
                    {cat.count}
                  </span>
                </div>

                <div className={`w-full h-1 rounded-none overflow-hidden mt-1.5 ${progressTrack}`}>
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className={`h-full transition-all duration-500 rounded-none ${isSelected ? "bg-[#86BC25]" : cat.color || "bg-[#86BC25]"}`}
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
