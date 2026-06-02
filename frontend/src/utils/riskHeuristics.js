export function getSeverityLabel(score) {
  if (score >= 9.0) return `${score.toFixed(1)}/10 CRITICAL`;
  if (score >= 7.0) return `${score.toFixed(1)}/10 SEVERE`;
  if (score >= 5.0) return `${score.toFixed(1)}/10 ELEVATED`;
  if (score >= 3.0) return `${score.toFixed(1)}/10 MODERATE`;
  if (score >= 1.5) return `${score.toFixed(1)}/10 RESOLVED`;
  return `${score.toFixed(1)}/10 NOMINAL`;
}

export function getSeverityColor(score) {
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

export function getLikelihoodColor(prob) {
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

export function getTaxonomy(id) {
  if (id.startsWith("FAC-001") || id.startsWith("FAC-003") || id.startsWith("SUP-771A")) return "Operations & Capacity";
  if (id.startsWith("SUP-001A") || id.startsWith("SUP-109B") || id.startsWith("FAC-010") || id.startsWith("SUP-302B")) return "Logistics & Transit";
  if (id.startsWith("SUP-401A") || id.startsWith("SUP-502A") || id.startsWith("SUP-404R") || id.startsWith("SUP-512S") || id.startsWith("SUP-212H")) return "Regulatory & Quality";
  return "External Infrastructure";
}

