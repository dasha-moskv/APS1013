import json
import os

files = [
    "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/data/signals.json",
    "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/data/threatRegistry.json",
    "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/signals.json",
    "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/threatRegistry.json"
]

new_record = {
    "id": "SUP-BREACH",
    "facility": "Non-ASL Forging & Casting Facility",
    "location": "Beijing, CN",
    "disruption": "Uncertified forging deployment violates FAA airworthiness regulations",
    "severity": 9.5,
    "severity_justification": "Critical compliance violation due to uncertified aerospace forging usage.",
    "severity_factors": [
        "FAA Safety Violation",
        "Unapproved Supplier",
        "Airworthiness Risk"
    ],
    "likelihood": 100,
    "likelihood_justification": "Active supply chain audit flagged non-ASL vendor activity.",
    "likelihood_factors": [
        "Audit Finding",
        "Supplier Non-Compliance"
    ],
    "timeToHit": 0,
    "timeToHit_justification": "Regulatory block is immediate upon detection.",
    "timeToHit_factors": [
        "Regulatory Intercept",
        "FAA Stop-Work"
    ],
    "tier": 2,
    "fullDescription": "The AI Playbook Agent proposed sourcing from Mega Casting Corp, which is not listed on the Boeing Approved Supplier List (ASL). The AI Judge intercepted this payload to prevent an FAA compliance breach, flagging the record and blocking downstream SAP PO generation.",
    "downstreamBusinessImpact": "Immediate regulatory halt on affected engine assemblies if uncertified castings are integrated.",
    "mitigationObjective": "Manually override or certify sourcing path through official FAA/Boeing channels, or reallocate to a certified ASL vendor.",
    "sourceData": "AI Judge Governance Interceptor",
    "mapPosition": {
        "coordinates": [116.4074, 39.9042],
        "color": "#EF4444",
        "role": "Tier-2 / Uncertified Forgings",
        "status": "Compliance Breach"
    },
    "playbook": {
        "mitigationPlan": {
            "steps": [
                "⚠️ COMPLIANCE BREACH INTERCEPTED: Playbook blocked by AI Judge.",
                "Proposed non-ASL vendor 'Mega Casting Corp' fails FAA airworthiness safety certification.",
                "Reallocated capacity changes rejected. Reverting to manual override queue."
            ],
            "timeline": "BLOCKED"
        },
        "validationPlan": {
            "steps": [
                "Perform manual vendor audit on FAA certification files.",
                "Escalate to Sourcing Director for Human-in-the-Loop review."
            ],
            "timeline": "IMMEDIATE"
        }
    },
    "sources": [
        {
            "title": "FAA Approved Supplier List Rules",
            "url": "https://www.faa.gov/aircraft/safety/programs/sups/",
            "summary": "FAA regulations dictate that all safety-critical aerospace components must originate from certified ASL vendors."
        }
    ],
    "dailyExposure": 14500000,
    "slaThresholdDays": 12,
    "bufferInventoryLevel": "0 days",
    "downstreamDependencies": [
        "Boeing Renton Factory"
    ]
}

for path in files:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Check if already exists
        exists = False
        for i, item in enumerate(data):
            if item.get("id") == "SUP-BREACH":
                data[i] = new_record
                exists = True
                break
        
        if not exists:
            # Add to the beginning of list
            data.insert(0, new_record)
            
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Successfully updated: {path}")
    else:
        print(f"Skipped (not found): {path}")
