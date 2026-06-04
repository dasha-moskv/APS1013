# Refined SCRM AI Platform MVP Use Case Diagram

This document contains the refined, presentation-ready UML Use Case diagram for the MVP version of the Supply Chain Risk Management (SCRM) AI Platform. It has been styled with a custom, high-fidelity color scheme and organized into Phase 1 & Phase 2 boundaries.

## Rendered MVP Use Case Diagram

![SCRM MVP Use Case Diagram](uml-use-case-mvp-refined.png)

## Diagram Source (Mermaid)

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'fontFamily': 'Inter, system-ui, -apple-system, sans-serif',
    'fontSize': '14px',
    'background': '#ffffff',
    'primaryColor': '#F8FAFC',
    'primaryTextColor': '#0F172A',
    'primaryBorderColor': '#E2E8F0',
    'lineColor': '#64748B',
    'secondaryColor': '#F1F5F9',
    'tertiaryColor': '#FFFFFF',
    'nodeBorder': '#CBD5E1'
  }
}}%%
flowchart LR
    %% Primary Actors (Initiators) on the Left
    subgraph Initiators ["👤 Human & Autonomous Initiators"]
        direction TB
        Manager("👤 Supply Chain / Risk Manager"):::actor
        Crawler("🕷️ Autonomous Web Crawler /<br>Stream Listener"):::actor
    end

    %% System Boundary
    subgraph SCRM ["🛡️ Supply Chain Risk Management (SCRM) AI Platform"]
        direction TB
        
        %% Phase 1: Ingestion & Detection
        subgraph Phase1 ["Phase 1: Ingestion & Detection"]
            direction TB
            UC_Ingest([Ingest & Normalize Signals]):::phase1
            UC_Triage([Triage Threat & Score Risk]):::phase1
            UC_Alert([Trigger Disruption Alert]):::phase1
            UC_Monitor([Monitor Global Dashboard]):::phase1
        end
        
        %% Phase 2: Impact & Strategy
        subgraph Phase2 ["Phase 2: Impact & Strategy"]
            direction TB
            UC_ReqScenario([Request Mitigation Scenarios]):::phase2
            UC_AssessBOM([Assess BOM & Financial Impact]):::phase2
            UC_DraftPlaybook([Draft Mitigation Playbook]):::phase2
        end
    end

    %% Secondary Actors & Specialized AI Agents on the Right
    subgraph ExternalSystems ["⚙️ External Systems"]
        direction TB
        DataSources("🌐 Public Data Streams"):::external
    end

    subgraph AIAgents ["🤖 Specialized AI Agents & DBs"]
        direction TB
        ThreatAI("🤖 Threat Validator AI (NLP)"):::aiActor
        ImpactAI("🤖 Impact Analyzer AI (Graph)"):::aiActor
        GenAI("🤖 Playbook Gen AI (LLM/RAG)"):::aiActor
    end

    %% --- ASSOCIATIONS (Initiators to Use Cases) ---
    Manager --- UC_Monitor
    Manager --- UC_ReqScenario
    
    Crawler --- UC_Ingest

    %% --- ASSOCIATIONS (Use Cases to Secondary Actors/Agents) ---
    UC_Ingest --- DataSources
    UC_Triage --- ThreatAI
    UC_AssessBOM --- ImpactAI
    UC_DraftPlaybook --- GenAI

    %% --- DEPENDENCIES (Includes / Extends) ---
    
    %% Ingestion flow
    UC_Ingest -. "<<include>>" .-> UC_Triage
    UC_Triage -. "<<extend>> <br>(If score > threshold)" .-> UC_Alert
    
    %% Scenario Generation flow
    UC_ReqScenario -. "<<include>>" .-> UC_AssessBOM
    UC_ReqScenario -. "<<include>>" .-> UC_DraftPlaybook

    %% Styling Classes
    classDef actor fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A,font-weight:bold;
    classDef external fill:#F8FAFC,stroke:#64748B,stroke-width:1.5px,color:#0F172A;
    classDef aiActor fill:#F5F3FF,stroke:#8B5CF6,stroke-width:2px,color:#4C1D95,font-weight:bold;
    classDef phase1 fill:#ECFDF5,stroke:#10B981,stroke-width:2px,color:#064E3B,font-weight:bold;
    classDef phase2 fill:#FFFBEB,stroke:#F59E0B,stroke-width:2px,color:#78350F,font-weight:bold;

    %% Subgraph Styling
    style Initiators fill:#F8FAFC,stroke:#E2E8F0,stroke-width:1px,stroke-dasharray: 4;
    style SCRM fill:#FFFFFF,stroke:#94A3B8,stroke-width:2.5px;
    style Phase1 fill:#F6FDF9,stroke:#A7F3D0,stroke-width:1px;
    style Phase2 fill:#FFFDF5,stroke:#FDE68A,stroke-width:1px;
    style ExternalSystems fill:#F8FAFC,stroke:#E2E8F0,stroke-width:1px,stroke-dasharray: 4;
    style AIAgents fill:#FAF5FF,stroke:#E9D5FF,stroke-width:1px,stroke-dasharray: 4;
```
