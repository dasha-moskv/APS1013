export function getSeverityLabel(score) {
  if (score >= 9.0) return `${score.toFixed(1)}/10 CRITICAL`;
  if (score >= 7.0) return `${score.toFixed(1)}/10 SEVERE`;
  if (score >= 5.0) return `${score.toFixed(1)}/10 ELEVATED`;
  if (score >= 3.0) return `${score.toFixed(1)}/10 MODERATE`;
  if (score >= 1.5) return `${score.toFixed(1)}/10 RESOLVED`;
  return `${score.toFixed(1)}/10 NOMINAL`;
}

export function getSeverityColor(score, isDark) {
  if (isDark) {
    if (score >= 9.0) return "text-red-400 bg-red-950/20 border-red-900/30";
    if (score >= 7.0) return "text-amber-400 bg-amber-950/20 border-amber-900/30";
    if (score >= 5.0) return "text-sky-400 bg-sky-950/20 border-sky-900/30";
    if (score >= 3.0) return "text-slate-400 bg-slate-900/30 border-slate-800/50";
    return "text-green-400 bg-green-950/20 border-green-900/30";
  }
  if (score >= 9.0) return "text-[#991B1B] bg-[#FEF2F2] border-[#FEE2E2]";
  if (score >= 7.0) return "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]";
  if (score >= 5.0) return "text-[#1E3A8A] bg-[#EFF6FF] border-[#DBEAFE]";
  if (score >= 3.0) return "text-[#334155] bg-[#F8FAFC] border-[#E2E8F0]";
  return "text-[#16A34A] bg-[#F0FDF4] border-[#DCFCE7]";
}

export function getLikelihoodLabel(prob) {
  if (prob >= 70) return `${prob}% HIGH`;
  if (prob >= 40) return `${prob}% MODERATE`;
  if (prob >= 1) return `${prob}% LOW`;
  return "0% NOMINAL";
}

export function getLikelihoodColor(prob, isDark) {
  if (isDark) {
    if (prob >= 90) return "text-red-400 bg-red-950/20 border-red-900/30";
    if (prob >= 70) return "text-amber-400 bg-amber-950/20 border-amber-900/30";
    if (prob >= 40) return "text-sky-400 bg-sky-950/20 border-sky-900/30";
    if (prob >= 1) return "text-slate-400 bg-slate-900/30 border-slate-800/50";
    return "text-green-400 bg-green-950/20 border-green-900/30";
  }
  if (prob >= 90) return "text-[#991B1B] bg-[#FEF2F2] border-[#FEE2E2]";
  if (prob >= 70) return "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]";
  if (prob >= 40) return "text-[#1E3A8A] bg-[#EFF6FF] border-[#DBEAFE]";
  if (prob >= 1) return "text-[#334155] bg-[#F8FAFC] border-[#E2E8F0]";
  return "text-[#16A34A] bg-[#F0FDF4] border-[#DCFCE7]";
}

export function formatTimeToHit(days) {
  if (days === -1) return "Bypassed (0 Days)";
  if (days === 0) return "Immediate";
  if (days > 0 && days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days > 1 && days < 7) return `${days} days`;
  if (days >= 7 && days <= 14) return "1-2 weeks";
  if (days > 14 && days <= 28) return "2-4 weeks";
  if (days > 28 && days <= 60) return "1-2 months";
  const months = Math.round(days / 30);
  return `${months} months`;
}

let taxonomyMapping = null;

export function setTaxonomyData(data) {
  taxonomyMapping = data;
}

export function getTaxonomy(idOrObj) {
  if (!idOrObj) return "External Infrastructure";
  let id = "";
  let text = "";
  if (typeof idOrObj === "object") {
    if (idOrObj.category) return idOrObj.category;
    id = idOrObj.id || "";
    text = ((idOrObj.disruption || "") + " " + (idOrObj.facility || "") + " " + (idOrObj.fullDescription || "")).toLowerCase();
  } else {
    id = idOrObj;
  }

  // 1. Check for Regulatory & Quality keywords
  const qualityKeywords = [
    "quality", "regulation", "regulatory", "audit", "defect", "defects",
    "compliance", "inspection", "checks", "paperwork", "forgeries",
    "documentation", "sanctions", "ban", "legal", "certificate", "traceability"
  ];
  if (qualityKeywords.some(k => text.includes(k))) {
    return "Regulatory & Quality";
  }

  // 2. Check for Logistics & Transit keywords
  const logisticsKeywords = [
    "logistics", "transit", "shipping", "delays", "delay", "transport",
    "freight", "cargo", "routing", "rail", "port", "customs", "border",
    "carrier", "import", "delivery", "deliveries", "stalled", "freighter"
  ];
  if (logisticsKeywords.some(k => text.includes(k))) {
    return "Logistics & Transit";
  }

  // 3. Check for Operations & Capacity keywords
  const opsKeywords = [
    "strike", "labor", "union", "workforce", "capacity", "shortage",
    "shortages", "yield", "production", "constrain", "starvation",
    "manufacturing", "kiln", "shutdown", "furnace", "mold", "autoclave",
    "honing", "riveting", "outage", "spindle", "die", "billet", "smelting"
  ];
  if (opsKeywords.some(k => text.includes(k))) {
    return "Operations & Capacity";
  }

  // 4. Check for External Infrastructure keywords
  const infraKeywords = [
    "power", "grid", "telemetry", "scada", "telecommunication", "utilities",
    "weather", "freeze", "storm", "natural", "internet", "surge", "outage"
  ];
  if (infraKeywords.some(k => text.includes(k))) {
    return "External Infrastructure";
  }

  if (taxonomyMapping && taxonomyMapping.categories) {
    const match = taxonomyMapping.categories.find(cat => 
      cat.idPrefixes && cat.idPrefixes.some(prefix => id.startsWith(prefix))
    );
    if (match) return match.name;
  }

  // Fallback to static mapping before JSON is loaded or for unrecognized IDs
  if (id.startsWith("FAC-001") || id.startsWith("FAC-003") || id.startsWith("SUP-771A")) return "Operations & Capacity";
  if (id.startsWith("SUP-001A") || id.startsWith("SUP-109B") || id.startsWith("FAC-010") || id.startsWith("SUP-302B")) return "Logistics & Transit";
  if (id.startsWith("SUP-401A") || id.startsWith("SUP-502A") || id.startsWith("SUP-404R") || id.startsWith("SUP-512S") || id.startsWith("SUP-212H")) return "Regulatory & Quality";
  return "External Infrastructure";
}


