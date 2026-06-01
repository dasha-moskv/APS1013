import { useState } from "react";
import { 
  PlayCircle, 
  Send, 
  RefreshCw, 
  Server, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function ActionOrchestration({ 
  isDark, 
  threatRows = [], 
  approvedPlaybooks = {}, 
  onSupplierResponse
}) {
  const [activeOrchId, setActiveOrchId] = useState("");
  const [supplierStatus, setSupplierStatus] = useState("pending"); // pending, confirmed, mitigated, partial
  const [portalLogs, setPortalLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  // List of threats that have been approved for orchestration
  const approvedThreats = threatRows.filter(row => approvedPlaybooks[row.id]);

  const selectThreat = (id) => {
    setActiveOrchId(id);
    setSupplierStatus("pending");
    setSuccessBanner(false);
    setPortalLogs([]);
  };

  const handleSimulateSupplierPortal = (status) => {
    setSupplierStatus(status);
  };

  const executeClosedLoopIntegration = () => {
    if (!activeOrchId) return;
    setIsSubmitting(true);
    setPortalLogs([]);

    const threat = threatRows.find(t => t.id === activeOrchId);
    const targetFacility = threat ? threat.facility : "Supplier Facility";
    const logs = [
      `📡 INGESTING GROUND-TRUTH CALLBACK FROM ${targetFacility.toUpperCase()} PORTAL...`,
      `🔍 STATUS CODE RECEIVED: [${supplierStatus.toUpperCase()}]`,
      `💾 REGISTERING INTERPOLATED RESPONSE INTO COGNITIVE GRAPH...`,
      `🔗 CONNECTING SUPPLIER PORTAL API INTEGRATION INTERFACE...`,
      `📦 RETRIEVING COMPONENT DISRUPTION FLOW DATA...`
    ];

    if (supplierStatus === "mitigated") {
      logs.push(
        `➡️ ACTION: INITIATING WAREHOUSE REALLOCATION PLAYBOOK...`,
        `⏱️ LEAD TIME UPDATE: Alternate routing secured successfully.`,
        `⏱️ BUFFER REVISION: Drawing from pre-certified safety stock reserves.`,
        `✅ CLOSED-LOOP THREAT RESOLUTION: Recalculating threat score down to 1.2/10 Nominal.`
      );
    } else if (supplierStatus === "confirmed") {
      logs.push(
        `❌ WARNING: SUPPLIER INABILITY TO WORKAROUND. CRITICAL DELAY CONFIRMED.`,
        `➡️ ACTION: DISPATCH LOGISTICS EXPEDITE ESCALATION TICKETS...`,
        `⏱️ LEAD TIME UPDATE: Logistics buffer exhausted. Assembly delays anticipated.`,
        `⚠️ CLOSED-LOOP THREAT UPDATED: Confirming Critical Threat at 9.5/10 Severity.`
      );
    } else if (supplierStatus === "partial") {
      logs.push(
        `➡️ ACTION: COMMITTING SECTOR RE-ALLOCATION WITH BUFFERS...`,
        `⏱️ LEAD TIME UPDATE: Logistics buffer drawn down. Delivery delay revised to 3 days.`,
        `✅ CLOSED-LOOP THREAT RE-RATED: Recalculating threat score down to 4.5/10 Elevated.`
      );
    }

    logs.forEach((line, index) => {
      setTimeout(() => {
        setPortalLogs(prev => [...prev, `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${line}`]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setIsSubmitting(false);
            setSuccessBanner(true);
            
            // Trigger closed-loop score adjustment in parent state
            if (onSupplierResponse) {
              onSupplierResponse(activeOrchId, supplierStatus);
            }
          }, 300);
        }
      }, (index + 1) * 350);
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b pb-2 select-none border-slate-700/50">
        <h1 className="text-base font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
          <PlayCircle className="h-4 w-4 text-[#86BC25]" />
          Phase 3: Action Orchestration & Collaboration
        </h1>
        <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Approve and execute playbooks, trigger automated supplier portals, simulate real ground-truth verification responses, and coordinate closed-loop actions.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left: Approved Actions List & Comms (4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
          {/* Approved Orchestrations List */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Server className="h-4 w-4 text-[#86BC25]" />
              Approved Action Orchestrations
            </h2>

            {approvedThreats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 select-none">
                <AlertTriangle className="h-6 w-6 text-amber-500 mb-1" />
                <p className="text-[10px] font-mono uppercase font-bold text-amber-500">No Approved Plans</p>
                <p className="text-[9px] mt-1 max-w-[200px]">Sign off and approve mitigation playbooks in the Playbooks Workbench to queue them here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 select-none">
                {approvedThreats.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => selectThreat(t.id)}
                    className={`border p-3 cursor-pointer transition-all duration-150 flex flex-col gap-1 ${
                      activeOrchId === t.id 
                        ? "border-[#86BC25] bg-[#86BC25]/5" 
                        : isDark 
                          ? "border-slate-800 bg-[#111520] hover:bg-[#161B26]" 
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold font-sans ${isDark ? "text-white" : "text-slate-800"}`}>
                        {t.facility}
                      </span>
                      <span className="text-[8px] font-mono bg-sky-950/20 text-sky-400 border border-sky-800/40 px-1">
                        {t.id}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase">
                      Action Plan: APPROVED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplier Automated Query Simulator */}
          {activeOrchId && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <Mail className="h-4 w-4 text-[#86BC25]" />
                Automated Supplier Query
              </h2>
              
              <div className={`border p-3 font-mono text-[9px] leading-relaxed flex flex-col gap-2 select-none ${
                isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <div>
                  <span className="text-slate-500 font-bold block">FROM:</span>
                  <span>radar-automations@boeing.com</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">TO:</span>
                  <span>
                    {threatRows.find(t => t.id === activeOrchId)?.playbook.contacts[0].email}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-1.5 mt-1">
                  <span className="text-[#86BC25] font-bold block">SUBJECT: Priority-A Supplier Status Query</span>
                  <p className="mt-1 leading-normal font-sans">
                    Ref: Disruption {activeOrchId}. Deep-tier sensors identify operational supply shocks. Please verify and confirm regional capability workarounds via the secure Boeing portal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Supplier Portal & ERP logs (8 columns) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">
          {activeOrchId ? (
            <div className="flex flex-col gap-3">
              {/* Supplier Portal Mock Simulator */}
              <div className={`border p-4 rounded-none transition-colors duration-300 border-sky-800 bg-sky-950/5`}>
                <div className="flex items-center justify-between border-b pb-2 select-none border-slate-700/30">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-sky-400">
                    <Server className="h-4 w-4 text-sky-400" />
                    Supplier Portal Interface Simulator
                  </h2>
                  <span className="text-[8px] border border-sky-800 bg-sky-950/10 px-2 py-0.5 text-sky-400 font-mono font-bold uppercase animate-pulse">
                    ACT AS SUPPLIER REPRESENTATIVE
                  </span>
                </div>

                <div className="flex flex-col gap-3 mt-3">
                  <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    To simulate the **closed-loop feedback loop**, select a ground-truth response from the supplier below and click execute to observe the automatic threat score adjustment.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option A: Confirm Delay */}
                    <div 
                      onClick={() => handleSimulateSupplierPortal("confirmed")}
                      className={`border p-3 cursor-pointer transition-all duration-150 flex flex-col gap-1 select-none ${
                        supplierStatus === "confirmed"
                          ? "border-red-500 bg-red-950/10 text-red-400"
                          : isDark ? "border-slate-800 bg-[#111520] hover:bg-[#161B26]" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">Confirm Critical Impact</span>
                      <p className="text-[9px] leading-relaxed text-slate-500 mt-1">
                        "Rail strike confirmed. 12-day delay stands. Sourcing alternates is blocked."
                      </p>
                    </div>

                    {/* Option B: Buffer Bypass (Mitigated) */}
                    <div 
                      onClick={() => handleSimulateSupplierPortal("mitigated")}
                      className={`border p-3 cursor-pointer transition-all duration-150 flex flex-col gap-1 select-none ${
                        supplierStatus === "mitigated"
                          ? "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25]"
                          : isDark ? "border-slate-800 bg-[#111520] hover:bg-[#161B26]" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">Mitigate / Deny Impact</span>
                      <p className="text-[9px] leading-relaxed text-slate-500 mt-1">
                        "Wichita composite warehouse buffer bypasses rail delays. Total line impact reduced to 0 days."
                      </p>
                    </div>

                    {/* Option C: Partial Mitigation */}
                    <div 
                      onClick={() => handleSimulateSupplierPortal("partial")}
                      className={`border p-3 cursor-pointer transition-all duration-150 flex flex-col gap-1 select-none ${
                        supplierStatus === "partial"
                          ? "border-amber-500 bg-amber-950/10 text-amber-400"
                          : isDark ? "border-slate-800 bg-[#111520] hover:bg-[#161B26]" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">Partial Mitigation Secure</span>
                      <p className="text-[9px] leading-relaxed text-slate-500 mt-1">
                        "Secured expedited highway trucks. Rail bottleneck bypassed. Delay reduced from 12 to 3 days."
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-700/30 pt-3 select-none flex items-center justify-end">
                    <button
                      onClick={executeClosedLoopIntegration}
                      disabled={supplierStatus === "pending" || isSubmitting}
                      className={`flex items-center gap-1.5 border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all duration-150 ${
                        isSubmitting
                          ? "border-sky-500 bg-sky-950/15 text-sky-400 cursor-not-allowed"
                          : supplierStatus !== "pending"
                            ? "border-sky-500 bg-sky-950/10 text-sky-400 hover:bg-sky-500 hover:text-black"
                            : "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Executing Callback API Integration...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Submit Supplier Ground Truth
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Automated Portal Transaction Logs */}
              <div className="border border-slate-800 bg-[#070A11] p-3 font-mono text-[9px] text-sky-400 select-text flex flex-col gap-2 min-h-[200px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 select-none">
                  <span className="font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-sky-400" />
                    AUTOMATED PORTAL TRANSACTION LOGS
                  </span>
                  <span className="text-slate-600 font-bold">PORT: 443</span>
                </div>
                
                {portalLogs.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-slate-600 select-none py-12">
                    [STANDBY - SUBMIT SUPPLIER PORTAL DATA TO CONNECT GATEWAY]
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
                    {portalLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed break-words font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                )}

                {successBanner && (
                  <div className="border border-[#86BC25] bg-[#86BC25]/10 p-2.5 flex items-start gap-2 mt-2 select-none text-[#86BC25]">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="text-[10px]">
                      <span className="font-bold uppercase tracking-wider font-mono">CLOSED LOOP SHIFT REGISTERED!</span>
                      <p className="mt-0.5 text-slate-300 font-sans font-medium">
                        The central risk telemetry has been updated in real-time. KPI boardroom math updated.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`border p-12 text-center select-none ${
              isDark ? "bg-[#0D111A] border-[#1E293B] text-slate-500" : "bg-white border-slate-200 text-slate-400"
            }`}>
              <PlayCircle className="h-10 w-10 mx-auto text-[#86BC25] mb-2 animate-bounce" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#86BC25] font-mono">Execution Bench Standby</h3>
              <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                Select an active approved action orchestration from the left side panel to trigger communications and ERP updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
