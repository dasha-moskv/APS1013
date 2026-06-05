# Subsequent Development Roadmap: Transitioning to an Enterprise-Grade Product
## Supplier Disruption Radar Agent (Project Radar)

This document outlines the 1-week intensive development plan to upgrade the **Supplier Disruption Radar Agent (Project Radar)** from its Pilot MVP state to a strong, enterprise-grade decision-support product.

To meet Boeing's production targets (e.g., Rate 47 narrowbody/widebody ramp-ups at Renton and Charleston) and defend enterprise Free Cash Flow (FCF) from sub-tier supply chain disruptions, the platform must move beyond reactive alert monitoring. The target product is a proactive, data-fused, risk-scored, and strictly governed agentic cockpit.

---

## 🗺️ Implementation Gantt Chart & Status

The following timeline details the 7-day development roadmap to achieve the strong product. Days 1 through 3 have been successfully completed, and Days 4 through 7 represent the upcoming implementation scope.

```mermaid
gantt
    title Development Roadmap: Upgrading to a Strong Product
    dateFormat  YYYY-MM-DD
    section Data & Taxonomy
    Day 1: 12-Category DoD Alignment       :done, day1, 2026-06-06, 1d
    Day 2: Multi-Source Data Fusion        :done, day2, 2026-06-07, 1d
    section Analytics & Logic
    Day 3: Risk-Based Alerting Engine      :done, day3, 2026-06-08, 1d
    Day 4: Governed Sourcing Nudges        :active, day4, 2026-06-09, 1d
    section Interface & Governance
    Day 5: Business Value ROI Dashboard    :day5, 2026-06-10, 1d
    Day 6: Agentic Guardrails & Auditing  :day6, 2026-06-11, 1d
    section Validation
    Day 7: System Verification Suite       :day7, 2026-06-12, 1d
```

---

## 🛰️ Competitive Differentiation & Strategic Context

A competitive analysis of leading SCRM platforms exposes key limitations that Project Radar will exploit to deliver unique, consulting-led business value:

| Capability | Everstream | Prewave | Resilinc / Interos | **Project Radar (Target Product)** |
| :--- | :--- | :--- | :--- | :--- |
| **Ingestion Coverage** | Alerts on macro/weather events | Scrapes public feeds for supplier names | Maps basic entity profiles and risk indices | **Full 12-Category DoD SCRM Taxonomy v2.1** |
| **Supply Web Mapping** | No product/part mapping | Generic supplier lists, no BOM | No component/BOM mapping | **GraphRAG-Enabled N-Tier BOM & Supplier Linkages** |
| **Operational Impact** | No exposure calculation | No downstream line stop linkage | No financial exposure estimates | **Real-Time Stop-Line Cost Exposure ($/Day)** |
| **Mitigation Model** | Passive alerting, stops at alert | Text advice, manual execution | Static playbooks, no ERP integration | **Governed Agentic Sourcing Nudges & SAP Dispatch** |
| **Compliance Checks** | None | None | None | **FAA Approved Supplier List (ASL) Interceptor** |

By deploying **Agentic AI Orchestration**, Project Radar transitions supply chain management from a reactive quarterly review to a continuous, self-correcting loop, buying back the "Golden Window" for operational intervention.

---

## 🛡️ Multi-Agent Orchestration Architecture

Our agentic processing loop is structured as a collaborative system of three specialized agents overseen by an autonomous compliance interceptor (the "AI Judge"):

```
                      +-----------------------------+
                      |    OSINT & News Ingestion   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   12-Category Classifier    |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Multi-Agent Collaborative  |
                      |   Scoring & Analysis Jury   |
                      |    (Severity, Likelihood,   |
                      |     Time-to-Hit Factors)    |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Playbook Agent: Sourcing  |
                      |     Nudges & Allocations    |
                      +--------------+--------------+
                                     |
                                     v [Intercepts Payload]
               ======+===============================+======
              ||      Governance Interceptor Check   |      ||
              ||   (Approved Supplier List Validator)|      ||
              ||                     +               |      ||
              ||         [Valid]     |     [Invalid] |      ||
              ||      +--------------+--------------+ |      ||
              ||      |                             | |      ||
              ||      v                             v |      ||
              ||  [ERP Dispatch]            [Block & Flag   ||
              ||  (Simulated SAP)           Compliance Breach]
              ||                                    |       ||
              ||                                    v       ||
              ||                             [Governance    ||
              ||                              Audit Logs]   ||
               ======+===============================+======
```

1.  **Ingestion & Classification Agent**: Classifies raw public signals against the 12-category DoD SCRM Taxonomy v2.1 and clusters events using Jaccard Similarity ($\ge 65\%$).
2.  **Blast-Radius & BOM Impact Agent**: Traverses the supply web database (`knowledgeGraph.json`) to identify the exact parts affected (e.g., turbine blades, structural brackets), downstream Boeing assembly programs (B737 MAX, B787), and active financial stop-line exposures ($14.5M/day for Everett, $8.8M/day for Renton).
3.  **FAA Compliance & ASL Sourcing Agent**: Identifies pre-certified backup suppliers from the Approved Supplier List (ASL). Instead of binary switches, it recommends **dynamic capacity allocations** (e.g., "Shift 30% of forging requirements to Precision Castparts for 90 days") to avoid overloading secondary supplier capacities.
4.  **Compliance Guardrails Interceptor (The AI Judge)**: Intercepts all generated playbook actions before database persistence. If an alternate supplier recommendation does not match an active ASL vendor, it blocks the update, flags the threat card with a "Compliance Breach" status, and updates the Governance Audit Log.

---

## 📊 Phase-by-Phase Roadmap Details

### 🟢 Completed Progress (Days 1–3)

#### **Day 1: Full Ontological Alignment (DoD SCRM Taxonomy v2.1)**
*   **Objective**: Standardize risk naming and lexicon by replacing the basic 4-category classification schema with the full 12 primary categories of the **DoD Supply Chain Risk Management (SCRM) Taxonomy v2.1** (published January 2025).
*   **Accomplished**:
    *   **Backend**: Expanded `get_taxonomy_by_id` in [backend/main.py](file:///Users/epheriami/Downloads/Projects/aps1013/project/backend/main.py) to support all 12 categories: *Regulatory & Compliance*, *Manufacturing & Supply*, *FOCI*, *Political*, *Technology & Cybersecurity*, *Financial*, *Economic*, *Product Quality & Design*, *Human Capital*, *Transportation & Distribution*, *Environmental*, and *Infrastructure*.
    *   **Frontend**: Updated [SignalTaxonomy.jsx](file:///Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/components/SignalTaxonomy.jsx) and [riskHeuristics.js](file:///Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/utils/riskHeuristics.js) to render all 12 categories with distinct Lucide icons, HSL-tailored colors, and detailed descriptions.
    *   **Data Migration**: Migrated all active entries in `signals.json` and `threatRegistry.json` to map clean category IDs.

#### **Day 2: Multi-Source Data Fusion & Supply Chain Knowledge Graph**
*   **Objective**: Build a structural model of Boeing's N-tier propulsion supply base and fuse raw OSINT signals with internal operational constraints.
*   **Accomplished**:
    *   **Backend Utility**: Created [knowledge_graph_builder.py](file:///Users/epheriami/Downloads/Projects/aps1013/project/backend/utils/knowledge_graph_builder.py) to load supply-base linkages from `knowledgeGraph.json`. Node parameters represent factory coordinates, daily stop-line exposure costs (e.g., $14.5M/day for Everett, $8.8M/day for Renton), safety stock, and downstream program relationships (e.g., B737 MAX, B787).
    *   **Data Fusion**: Enhanced the simulation and scrape handlers in [backend/main.py](file:///Users/epheriami/Downloads/Projects/aps1013/project/backend/main.py) to cross-reference raw news alerts against the supply chain graph. If a facility node (e.g., Spirit AeroSystems in Wichita, KS) matches the alert location, the agent injects live inventory balances, down-line programs, and financial exposures directly into the disruption record.

#### **Day 3: Risk-Based Alerting (RBA) Engine & Explainable Scoring**
*   **Objective**: Eliminate opaque, unexplainable threat metrics by transitioning the analysis loop to a dynamic RBA framework with explainable SHAP-style risk factors.
*   **Accomplished**:
    *   **Agent Refactor**: Modified the LLM prompt in [analyze_signals.py](file:///Users/epheriami/Downloads/Projects/aps1013/project/backend/agents/analyze_signals.py) to calculate:
        *   *Dynamic Severity*: Combining raw signal intensity with downstream stop-line costs.
        *   *Likelihood*: Based on whether the signal is active, confirmed, or unverified.
        *   *Time-to-Hit (TTH)*: Calculated by comparing logistics transit times against current safety stock margins.
    *   **Explainability Parameters**: Forced the agent to return structured arrays (`severity_factors`, `likelihood_factors`, `timeToHit_factors`) detailing the exact operational drivers (e.g., "Single-sourced component", "12-day safety stock cushion").
    *   **UI Enhancements**: Updated the slide-out inspector drawer in [HealthMonitorTable.jsx](file:///Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/components/HealthMonitorTable.jsx) to render these factors as high-contrast tag pills.

---

### 🔵 Upcoming Implementation Scope (Days 4–7)

#### **Day 4: Governed Sourcing Nudges & Alternate Routing**
*   **Objective**: Upgrade playbooks from generic bullet points to actionable sourcing commands constrained by FAA Type Certificate bounds and Approved Supplier List (ASL) clearances.
*   **Backend Scope**:
    *   Refactor [generate_mitigation_and_validation.py](file:///Users/epheriami/Downloads/Projects/aps1013/project/backend/agents/generate_mitigation_and_validation.py) to parse pre-certified suppliers from an ASL dictionary (e.g., mapping GE Aerospace, Safran, Rolls-Royce, and Toray).
    *   Enforce structured outputs for playbooks. Sourcing recommendations must return a defined JSON object containing:
        *   `backup_supplier`: Pre-approved vendor name and region.
        *   `reallocation_percentage`: Concrete capacity splits (e.g., "Shift 30% of forging allocations").
        *   `mitigation_timeline`: Days required to transition tooling and queue First Article Inspection (FAI) workflows.
*   **Frontend Scope**:
    *   Modify [MitigationPlaybooks.jsx](file:///Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/components/MitigationPlaybooks.jsx) to display these sourcing nudges as interactive, high-fidelity action cards.
    *   Add an "Authorize Sourcing Shift" button that opens a simulated ERP dispatch console, streaming mock SAP transaction logs (e.g., `ME21N` PO adjustments).

#### **Day 5: Business Value & ROI Dashboard**
*   **Objective**: Develop a dedicated cockpit view that aggregates the financial and operational return on investment (ROI) of Project Radar for executive review.
*   **Frontend Scope**:
    *   Create a new tab component `BusinessValueDashboard.jsx` implementing a Balanced Scorecard:
        *   *Total Cost to Serve*: Projected savings from avoiding emergency air freight (e.g., chartering Boeing 747s) and out-of-sequence traveled work.
        *   *Time-to-Recover (TTR) Reduction*: A dual-line chart comparing historical manual recovery vs. agent-assisted recovery.
        *   *Perfect Order % Protection*: Active projection of assembly line stability.
        *   *Downstream Exposure Gauge*: A financial radial dial aggregating the total exposure cost of active disruptions.
    *   Wire the dashboard to [App.jsx](file:///Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/App.jsx) and map dynamic metrics derived from the active threat registry list.

#### **Day 6: Agentic Guardrails, Containment & Auditing**
*   **Objective**: Establish a defense-in-depth safety layer to intercept and audit autonomous AI commands, ensuring compliance with FAA airworthiness standards.
*   **Backend Scope**:
    *   Implement a new middleware helper `backend/utils/governance_guardrails.py`.
    *   Intercept all generated playbooks before saving to `threatRegistry.json`. If the AI recommends a supplier not on the pre-certified ASL list, block the update, flag the threat card with a "Compliance Breach" status, and revert the playbook to a draft state.
*   **Frontend Scope**:
    *   Upgrade the Governance Console (`AIJudgeGovernance.jsx`) to display a scrolling "Audit Log Table".
    *   Render blocked compliance warnings, LLM logic traces, and mock human-in-the-loop override buttons.

#### **Day 7: E2E Verification & Performance Optimization**
*   **Objective**: Ensure 100% build health, validation compliance, and execution safety before final deployment.
*   **Scope**:
    *   Update [validate_schemas.py](file:///Users/epheriami/Downloads/Projects/aps1013/project/scripts/validate_schemas.py) to check the integrity of:
        *   The multi-tier knowledge graph schema.
        *   The 12-category DoD SCRM taxonomy mapping.
        *   The structured sourcing nudge JSON payload.
    *   Execute full verification commands:
        *   `python3 scripts/validate_schemas.py`
        *   `npm run lint`
        *   `npm run build`
    *   Deliver a production bundle with zero warnings or syntax issues.

---

## 🏗️ Architectural Blueprint

The updated system architecture is documented in [phase2_architecture.d2](file:///Users/epheriami/Downloads/Projects/aps1013/project/phase2_architecture.d2) and compiled to [phase2_architecture.svg](file:///Users/epheriami/Downloads/Projects/aps1013/project/phase2_architecture.svg). 

The multi-layer system is divided into four distinct boundaries:
1.  **Presentation Layer (React SPA)**: The analyst cockpit displaying the Risk Radar, Ingestion Pipeline, Mitigation Playbook, and Governance Console.
2.  **Application Layer (FastAPI Core)**: Exposes APIs for GEOJson ingestion, RSS news collectors, live simulation endpoints, and Server-Sent Event (SSE) telemetry.
3.  **Agentic Cluster (LangGraph / OpenAI)**: Independent agents executing supply base verification, disruption extraction, and mitigation routing.
4.  **Storage Layer**: Handles PostgreSQL relational databases, Neo4j graph databases (for supply network traversing), and Vector databases (for precedents and SLA contract retrievals).

---

## 🔒 Verification & Acceptance Criteria

To declare the "strong product" release successful, the implementation must pass the following validation matrix:

### 1. Automated Schema Integrity
*   Run command: `python3 scripts/validate_schemas.py`
*   **Acceptance**: Must complete with `[SUCCESS]` across all databases (`signals.json`, `threatRegistry.json`, and `knowledgeGraph.json`).

### 2. Frontend Quality Control
*   Run command: `npm run lint`
*   **Acceptance**: 0 errors and 0 warnings.
*   Run command: `npm run build`
*   **Acceptance**: Compiles successfully with zero warnings under 500ms.

### 3. Functional User Experience Scenarios
*   **Sourcing ASL Check**: Generate a playbook. Verify that the suggested backup supplier matches a valid vendor in the ASL list.
*   **Governance Containment Test**: Inject a mock signal suggesting an uncertified supplier. Verify the backend middleware intercepts it, displays a warning pill in the threat registry, and registers the warning in the Governance tab.
*   **ROI Dashboard Update**: Delete or resolve a threat. Navigate to the Business Value tab and verify that the avoided traveled-work cost is added to the total savings scorecard.
