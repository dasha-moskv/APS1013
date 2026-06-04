import json
import os

threats = [
    # --- OPERATIONS & CAPACITY (Prefixes: FAC-001, FAC-003, SUP-771A) ---
    {
        "id": "FAC-001A",
        "facility": "GE Aerospace Evendale Plant",
        "location": "Evendale, OH, US",
        "disruption": "GEnx compressor rotor tooling calibration drift",
        "severity": 8.0,
        "likelihood": 85,
        "timeToHit": 14,
        "tier": 1,
        "fullDescription": "Precision calibration lasers on CNC hone #4 recorded drift outside FAA quality limits. Compressor rotor production for GEnx assembly is temporarily quarantined pending quality signature.",
        "sourceData": "Evendale Metrology Alert EVN-CNC-04",
        "mapPosition": {
            "coordinates": [-84.45, 39.25],
            "color": "#D32F2F",
            "role": "Tier-1 / Main Engines",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy manual micrometer verification overlays on the production floor.",
                    "Divert priority rotor raw forgings to CFM backup hones in Evendale bay B."
                ],
                "timeline": "4 days of laser calibration and tooling swaps"
            },
            "validationPlan": {
                "steps": [
                    "Perform double-blind metrology audits on the first 50 rotor sleeves.",
                    "Conduct full-power containment testing on test stands before release."
                ],
                "timeline": "2 days of engineering test runs"
            }
        },
        "downstreamImpact": "Delays final engine assembly schedules; potential Rate 47 narrowbody impacts.",
        "mitigationObjective": "Restore hone tool alignment and clear queued component inspections."
    },
    {
        "id": "FAC-001B",
        "facility": "Spirit AeroSystems Wichita Plant",
        "location": "Wichita, KS, US",
        "disruption": "Robotic fuselage assembly cell hydraulic failure",
        "severity": 8.8,
        "likelihood": 90,
        "timeToHit": 7,
        "tier": 1,
        "fullDescription": "Primary structural wing/fuselage join cell robotic arms offline due to high-pressure manifold leak. Wichita line #1 final assembly halts.",
        "sourceData": "PLC telemetry code: WICH-ROB-MAN-01",
        "mapPosition": {
            "coordinates": [-97.2798, 37.6436],
            "color": "#D32F2F",
            "role": "Tier-1 / Fuselages & Wings",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy manual riveting and join overlays using reserve technician pool.",
                    "Air-ship replacement hydraulic manifold from supplier in Detroit."
                ],
                "timeline": "3 days for robotic head swap and safety checks"
            },
            "validationPlan": {
                "steps": [
                    "Perform non-destructive x-ray testing on stringer rivets in the affected zone.",
                    "Verify fastener squeeze force telemetry via manual torque audits."
                ],
                "timeline": "24 hours of robotic safety and squeeze verification"
            }
        },
        "downstreamImpact": "Direct fuselage delivery delays to Renton final assembly line.",
        "mitigationObjective": "Bypass robotic cell downtime using manual riveting overlays and safety audits."
    },
    {
        "id": "FAC-003A",
        "facility": "Toray Composite Materials Ehime Plant",
        "location": "Ehime, JP",
        "disruption": "Carbon fiber autoclave temperature controller malfunction",
        "severity": 7.4,
        "likelihood": 75,
        "timeToHit": 21,
        "tier": 2,
        "role": "Tier-2 / Carbon Fiber",
        "fullDescription": "Autoclave #2 thermal sensor drift during carbon fiber wing spar curing cycles. Layup batches quarantined due to structural porosity concerns.",
        "sourceData": "Factory IoT Status Feed: EHIME-AUTO-TEMP-02",
        "mapPosition": {
            "coordinates": [133.0906, 33.8569],
            "color": "#FFB300",
            "role": "Tier-2 / Carbon Fiber",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Shift wing spar composite layup loads to secondary prepreg lines in Nagoya.",
                    "Replace temperature controller sensors and re-verify thermal profiles."
                ],
                "timeline": "5 days for controller calibration and test runs"
            },
            "validationPlan": {
                "steps": [
                    "Perform ultrasonic void-detection tests on first post-repair wing spar layups.",
                    "Audit pressure profile logs over three consecutive test cycles."
                ],
                "timeline": "2 days of composite curing void inspections"
            }
        },
        "downstreamImpact": "Composite wing structure assembly halts at Everett final assembly line.",
        "mitigationObjective": "Maintain structural prepreg flow by activating Nagoya production bridges."
    },
    {
        "id": "FAC-003B",
        "facility": "Hexcel Decatur Facility",
        "location": "Decatur, AL, US",
        "disruption": "Prepreg weave loom drive motor burn-out",
        "severity": 6.8,
        "likelihood": 80,
        "timeToHit": 28,
        "tier": 2,
        "fullDescription": "Main loom drive motor for structural carbon fiber prepreg weaves failed. Production line #3 offline pending replacement component delivery.",
        "sourceData": "Metrology Alert: DEC-LOM-03-MTR",
        "mapPosition": {
            "coordinates": [-86.9833, 34.6059],
            "color": "#FFB300",
            "role": "Tier-2 / Advanced Composites",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Re-route raw fiber precursors to backup loom bays in Salt Lake City.",
                    "Expedite replacement motor delivery from Germany."
                ],
                "timeline": "6 operational days for shipping and motor install"
            },
            "validationPlan": {
                "steps": [
                    "Run metrology checks on weave tension profile for the first 500 yards.",
                    "Audit weave consistency using automatic optical sorting sweeps."
                ],
                "timeline": "24 hours of fabric verification"
            }
        },
        "downstreamImpact": "Slowdown in composite matrix deliveries for fuselage structural reinforcement rings.",
        "mitigationObjective": "Maintain supply continuity via Salt Lake City backup looms."
    },
    {
        "id": "SUP-771A1",
        "facility": "Precision Castparts Portland",
        "location": "Portland, OR, US",
        "disruption": "Titanium casting kiln refractory lining wearout",
        "severity": 8.2,
        "likelihood": 90,
        "timeToHit": 14,
        "tier": 2,
        "fullDescription": "Kiln #2 structural lining degradation. Titanium structural engine frame casting runs suspended for emergency chamber rebuild.",
        "sourceData": "SCADA sensor log: PORT-KLN-2-REF",
        "mapPosition": {
            "coordinates": [-122.6742, 45.5231],
            "color": "#D32F2F",
            "role": "Tier-2 / Titanium Forgings",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Authorize overtime pay for engineering teams repairing Kiln #2.",
                    "Transfer molds and priority dies to backup casting facility in Cleveland."
                ],
                "timeline": "7 operational days for furnace lining curing"
            },
            "validationPlan": {
                "steps": [
                    "Inspect thermal imaging logs of Kiln #2 during heat-up cycles.",
                    "Perform non-destructive stress testing on replacement castings."
                ],
                "timeline": "2 business days of thermal validation"
            }
        },
        "downstreamImpact": "Low-pressure compressor engine casing delays; risks assembly integration timeline.",
        "mitigationObjective": "Bypass production downtime via backup molding dies in Cleveland."
    },
    {
        "id": "SUP-771A2",
        "facility": "Moog Actuation Systems East Aurora Plant",
        "location": "East Aurora, NY, US",
        "disruption": "Actuator hone spindle calibration drift",
        "severity": 7.0,
        "likelihood": 80,
        "timeToHit": 10,
        "tier": 2,
        "fullDescription": "High-precision honing spindle drift on primary servovalve machining line #4. Flap control actuator sleeve batches quarantined.",
        "sourceData": "CNC Alert EA-CNC-HON-04",
        "mapPosition": {
            "coordinates": [-78.6153, 42.7669],
            "color": "#FFB300",
            "role": "Tier-2 / Primary Actuation",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy specialized laser calibration teams to reset honing spindle.",
                    "Pull pre-inspected servovalve sleeve safety stock from European logistics hub."
                ],
                "timeline": "4 days for laser realignment and calibration"
            },
            "validationPlan": {
                "steps": [
                    "Conduct air-gauge dimensional checks on first 50 sleeve samples post-repair.",
                    "Verify functional flow and pressure drop specs on automated hydraulic test benches."
                ],
                "timeline": "2 days of rigorous dimensional micro-auditing"
            }
        },
        "downstreamImpact": "Flap/slat control actuator shortages; delayed cockpit system integrations.",
        "mitigationObjective": "Bypass East Aurora downtime by clearing dimensional micro-anomalies."
    },
    {
        "id": "FAC-001C",
        "facility": "Pratt & Whitney East Hartford Facility",
        "location": "East Hartford, CT, US",
        "disruption": "Turbofan engine compressor ring welding nozzle blockage",
        "severity": 7.2,
        "likelihood": 78,
        "timeToHit": 15,
        "tier": 1,
        "fullDescription": "Precision electron beam welding nozzle blockages halting the direct energy deposition of the compressor housing assembly.",
        "sourceData": "Laser Sensor Telemetry EH-WELD-CRIT",
        "mapPosition": {
            "coordinates": [-72.6201, 41.7584],
            "color": "#D32F2F",
            "role": "Tier-1 / Turbofans",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy backup manual welding arrays to maintain compressor assembly flow.",
                    "Initiate precision nozzle ultrasonic cleaning cycle."
                ],
                "timeline": "4 operational days for nozzle flush and safety recalibration"
            },
            "validationPlan": {
                "steps": [
                    "Conduct automated CT scans on post-repair welds to inspect internal cavities.",
                    "Verify weld seam grain structure and tensile properties."
                ],
                "timeline": "2 days of advanced metallurgy testing"
            }
        },
        "downstreamImpact": "Compressor ring assembly bottleneck; delays final engine mount integration.",
        "mitigationObjective": "Bypass automated nozzle clogs via backup manual welding channels."
    },
    {
        "id": "FAC-003C",
        "facility": "Triumph Red Oak Facility",
        "location": "Red Oak, TX, US",
        "disruption": "Wing panel autoclave door seal rupture",
        "severity": 6.5,
        "likelihood": 82,
        "timeToHit": 18,
        "tier": 2,
        "fullDescription": "Pressure containment seal ruptured on autoclave #1 during layup cure. Structural composite skin panel batch scrapped due to pressure loss.",
        "sourceData": "Pressure Webhook: RO-AUTO-1-PRES",
        "mapPosition": {
            "coordinates": [-96.8044, 32.5201],
            "color": "#FFB300",
            "role": "Tier-2 / Wing Assembly",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Divert next skin panel batch to secondary autoclave #2.",
                    "Deploy technician crew to replace silicone pressure seals."
                ],
                "timeline": "3 business days for seal swap and pressure certification"
            },
            "validationPlan": {
                "steps": [
                    "Perform non-destructive ultrasound void scan on first five parts.",
                    "Audit pressure containment logs across three consecutive thermal test cycles."
                ],
                "timeline": "24 hours of sensor telemetry calibration"
            }
        },
        "downstreamImpact": "Wing skin sub-assembly shortages; delayed wing structure deliveries.",
        "mitigationObjective": "Bypass autoclave seal failure via secondary autoclave and rapid seal swap."
    },

    # --- LOGISTICS & TRANSIT (Prefixes: SUP-001A, SUP-109B, FAC-010, SUP-302B) ---
    {
        "id": "SUP-001A1",
        "facility": "BNSF Kansas Rail Corridor",
        "location": "Kansas City, MO, US",
        "disruption": "Midwest logistics union rail strike halts fuselage shipments",
        "severity": 9.2,
        "likelihood": 95,
        "timeToHit": 5,
        "tier": 1,
        "fullDescription": "Labor union walkouts across BNSF rail line stall fuselage transit cars. Renton B737 final assembly lines risk fuselage starvation in 10 days.",
        "sourceData": "Logistics tracker event: BNSF-KS-STRIKE",
        "mapPosition": {
            "coordinates": [-94.5786, 39.0997],
            "color": "#D32F2F",
            "role": "Logistics / Fuselage Transit",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Initiate emergency road oversize flatbed logistics carriers.",
                    "Lobby state governors for rapid oversized load highway corridor permits."
                ],
                "timeline": "8 days to configure heavy haul permits and flatbed mobilization"
            },
            "validationPlan": {
                "steps": [
                    "Verify transit permits and tracking logs with state DOTs.",
                    "Confirm trailer load clearance metrics match standard route tunnels."
                ],
                "timeline": "2 days of transit clearance audits"
            }
        },
        "downstreamImpact": "Boeing Renton assembly line stop; potential rate reductions.",
        "mitigationObjective": "Establish a road heavy-haul corridor to bypass rail network labor blocks."
    },
    {
        "id": "SUP-109B1",
        "facility": "Port of Seattle Terminal 91",
        "location": "Seattle, WA, US",
        "disruption": "Maritime cargo crane power grid failure",
        "severity": 7.5,
        "likelihood": 85,
        "timeToHit": 3,
        "tier": 1,
        "fullDescription": "Substation transformer explosion at Terminal 91. Container crane operations suspended, stalling incoming landing gear shipments.",
        "sourceData": "Seattle Port Authority Webhook: SEA-PWR-CRN",
        "mapPosition": {
            "coordinates": [-122.3833, 47.6333],
            "color": "#FFB300",
            "role": "Logistics / Marine Cargo",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Divert container vessels to operational cargo docks in Port of Tacoma.",
                    "Deploy emergency heavy mobile cranes to unload critical landing gear containers."
                ],
                "timeline": "4 days for ship rerouting and mobile crane staging"
            },
            "validationPlan": {
                "steps": [
                    "Check cargo manifests and verify GPS coordinates of incoming landing gears.",
                    "Confirm dock clearance capacity metrics with Port of Tacoma leads."
                ],
                "timeline": "24 hours of harbor coordination"
            }
        },
        "downstreamImpact": "Inbound transport delay causing landing gear sub-assembly shortages.",
        "mitigationObjective": "Divert incoming vessels to Port of Tacoma and stage backup mobile cranes."
    },
    {
        "id": "FAC-010A",
        "facility": "Safran Landing Systems Bidos Facility",
        "location": "Bidos, FR",
        "disruption": "France port strike blocks landing gear container transport",
        "severity": 7.8,
        "likelihood": 90,
        "timeToHit": 12,
        "tier": 1,
        "fullDescription": "National transport strikes block rail links between Bidos and Marseille port. Completed nose landing gear struts stalled at supplier yard.",
        "sourceData": "SNCF strike bulletin FR-SNCF-OUT",
        "mapPosition": {
            "coordinates": [-0.605, 43.181],
            "color": "#D32F2F",
            "role": "Tier-1 / Landing Gear",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Reroute cargo container transport routes via road trucking to Port of Antwerp.",
                    "Stage Antonov heavy airfreight options to ship landing gears directly to Seattle."
                ],
                "timeline": "6 days to organize heavy road haulage and air transport"
            },
            "validationPlan": {
                "steps": [
                    "Audit road carrier licenses and cross-border customs declarations.",
                    "Confirm airfreight loading parameters for heavy landing gear struts."
                ],
                "timeline": "2 days of customs and shipping compliance sign-off"
            }
        },
        "downstreamImpact": "Landing gear shortages for widebody assemblies; extended transport latency.",
        "mitigationObjective": "Bypass Marseille strike blocks by routing road transport to Antwerp."
    },
    {
        "id": "SUP-302B1",
        "facility": "Everett Logistics Hub",
        "location": "Everett, WA, US",
        "disruption": "Logistics terminal automated sorter software failure",
        "severity": 7.0,
        "likelihood": 85,
        "timeToHit": 4,
        "tier": 2,
        "fullDescription": "Warehouse control database corruption stops automated bin retrieval. Small component parts (fasteners, brackets) stalled in high-density storage bays.",
        "sourceData": "IT Incident report: EVT-WMS-SYS-ERR",
        "mapPosition": {
            "coordinates": [-122.2034, 47.4797],
            "color": "#FFB300",
            "role": "Logistics / Warehouse Sorter",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy manual pick-and-pack crews to override automated retrieval cells.",
                    "Initiate warehouse database rollback to last stable backup."
                ],
                "timeline": "2 days for system restoration and manual picking backlogs"
            },
            "validationPlan": {
                "steps": [
                    "Verify database index integrity across all high-density storage racks.",
                    "Confirm pick latency metrics return to baseline rates."
                ],
                "timeline": "12 hours of offline storage testing"
            }
        },
        "downstreamImpact": "Small parts bottlenecks; delayed assembly preparation kits.",
        "mitigationObjective": "Deploy manual picking crews and restore warehouse database index."
    },
    {
        "id": "SUP-001A2",
        "facility": "Schiphol Air Cargo Hub",
        "location": "Amsterdam, NL",
        "disruption": "Air traffic control IT outage delays micro-sensor transport",
        "severity": 6.8,
        "likelihood": 80,
        "timeToHit": 6,
        "tier": 2,
        "fullDescription": "Severe software corruption halts cargo flight clearances at Schiphol Airport. Shipments of flight deck sensors stalled in cargo terminal.",
        "sourceData": "Eurocontrol system alert: SCHIP-ATC-IT",
        "mapPosition": {
            "coordinates": [4.7683, 52.3086],
            "color": "#FFB300",
            "role": "Logistics / Air Cargo Hub",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Divert incoming cargo trucks to Frankfurt Airport for flight routing.",
                    "Deploy dedicated courier to manually carry high-priority sensor batches."
                ],
                "timeline": "3 days for overland transport and re-routing"
            },
            "validationPlan": {
                "steps": [
                    "Verify transit custody logs with Frankfurt cargo handler.",
                    "Ensure environmental sensors on carrier boxes remained active."
                ],
                "timeline": "24 hours of custody log auditing"
            }
        },
        "downstreamImpact": "Avionics sub-assembly delays at final assembly integration hubs.",
        "mitigationObjective": "Bypass Schiphol flight congestion by re-routing air cargo via Frankfurt."
    },
    {
        "id": "SUP-109B2",
        "facility": "Port of Rotterdam Terminal 4",
        "location": "Rotterdam, NL",
        "disruption": "Rotterdam port berth congestion extends shipping lead times",
        "severity": 7.1,
        "likelihood": 84,
        "timeToHit": 14,
        "tier": 2,
        "fullDescription": "High container volumes delay ship berthings. Raw titanium forging imports face ship dwell times of 12 operational days.",
        "sourceData": "Port status feed: ROT-CONG-LVL-4",
        "mapPosition": {
            "coordinates": [4.4792, 51.9244],
            "color": "#FFB300",
            "role": "Logistics / Port Gateway",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Transition incoming shipments to secondary maritime terminals in Antwerp.",
                    "Expedite urgent forging batches via airfreight overlays."
                ],
                "timeline": "5 business days for shipping re-routing"
            },
            "validationPlan": {
                "steps": [
                    "Confirm berth availability sheets at Antwerp terminal.",
                    "Verify air cargo container capacity with partner carrier."
                ],
                "timeline": "48 hours of transit planning audits"
            }
        },
        "downstreamImpact": "Forging inventory buffer depletion; delayed sub-assembly schedules.",
        "mitigationObjective": "Divert incoming vessels to Antwerp to bypass Rotterdam congestion."
    },
    {
        "id": "FAC-010B",
        "facility": "Woodward Fort Collins Plant",
        "location": "Fort Collins, CO, US",
        "disruption": "Logistics trucking contractor lock-out",
        "severity": 6.6,
        "likelihood": 78,
        "timeToHit": 9,
        "tier": 2,
        "fullDescription": "Primary logistics trucking contractor locks out union drivers during wage negotiations. Fuel controls shipments stalled at plant docks.",
        "sourceData": "Supplier notice: WOOD-LOG-LOK",
        "mapPosition": {
            "coordinates": [-105.0844, 40.5853],
            "color": "#FFB300",
            "role": "Tier-2 / Fuel Controls",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Engage backup non-union trucking carrier to clear Fort Collins bays.",
                    "Reschedule final component kits to match alternative transport arrival times."
                ],
                "timeline": "3 operational days to stage new logistics contract"
            },
            "validationPlan": {
                "steps": [
                    "Audit carrier insurance logs and safety certifications.",
                    "Verify receiver bay capacity schedules at assembly hub."
                ],
                "timeline": "24 hours of carrier verification"
            }
        },
        "downstreamImpact": "Avionics and propulsion system kit shortages; delay in final assembly starts.",
        "mitigationObjective": "Bypass transport lock-out by activating backup carrier contract."
    },
    {
        "id": "SUP-302B2",
        "facility": "Renton Parts Distribution Center",
        "location": "Renton, WA, US",
        "disruption": "Distribution center crane mechanical breakdown",
        "severity": 6.9,
        "likelihood": 80,
        "timeToHit": 4,
        "tier": 1,
        "fullDescription": "Heavy lift crane cable assembly snapped. Main engine mounting brackets stuck in overhead storage bay pending repair.",
        "sourceData": "SCADA alarm: RNT-CRN-02-BRK",
        "mapPosition": {
            "coordinates": [-122.2034, 47.4797],
            "color": "#FFB300",
            "role": "Logistics / Heavy Sorter",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy temporary heavy forklift bays to retrieve brackets from lower racks.",
                    "Expedite replacement crane cable delivery and schedule engineering crew."
                ],
                "timeline": "2 days for cable replacement and mechanical validation"
            },
            "validationPlan": {
                "steps": [
                    "Perform load-bearing tests on repaired crane assembly.",
                    "Audit warehouse safety checklists before full operations restart."
                ],
                "timeline": "12 hours of mechanical stress testing"
            }
        },
        "downstreamImpact": "Engine mount integration halts on B737 final assembly lines.",
        "mitigationObjective": "Bypass crane failure via forklift bay routing and rapid repairs."
    },

    # --- REGULATORY & QUALITY (Prefixes: SUP-401A, SUP-502A, SUP-404R, SUP-512S, SUP-212H) ---
    {
        "id": "SUP-401A1",
        "facility": "Honeywell Aerospace Phoenix Facility",
        "location": "Phoenix, AZ, US",
        "disruption": "Cleanroom HEPA filtration contamination breach",
        "severity": 7.6,
        "likelihood": 85,
        "timeToHit": 7,
        "tier": 1,
        "fullDescription": "Pressure sensors assembly cleanroom recorded Class 100 particle threshold violations. Micro-sensor production lines suspended for deep decontamination.",
        "sourceData": "Cleanroom telemetry: PHX-CLN-SEC4-ERR",
        "mapPosition": {
            "coordinates": [-112.074, 33.4484],
            "color": "#FFB300",
            "role": "Tier-1 / Avionics & APUs",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Isolate contaminated batch assemblies and place in quarantine hold.",
                    "Initiate deep cleanroom chemical scrub and replace HEPA filter elements."
                ],
                "timeline": "4 days for cleanroom scrub and certified air validation"
            },
            "validationPlan": {
                "steps": [
                    "Monitor continuous particle counts over 24-hour baseline cycle.",
                    "Audit micro-sensor microchip contacts under scanning electron microscope."
                ],
                "timeline": "24 hours of ambient safety verification"
            }
        },
        "downstreamImpact": "Flight deck pressure transducer shortages; delayed cockpit modular avionics integration.",
        "mitigationObjective": "Bypass Phoenix downtime by routing raw sensor lines to certified Penang facility."
    },
    {
        "id": "SUP-502A1",
        "facility": "Safran Landing Systems Bidos Facility",
        "location": "Bidos, FR",
        "disruption": "Landing gear cylinder metal inclusion quality escape",
        "severity": 8.5,
        "likelihood": 90,
        "timeToHit": 14,
        "tier": 1,
        "fullDescription": "Ultrasonic scan found microscopic air voids in forged steel cylinder blanks. Affected landing gear cylinder batches quarantined pending structural testing.",
        "sourceData": "Quality audit report: BDS-US-VOID-08",
        "mapPosition": {
            "coordinates": [-0.605, 43.181],
            "color": "#D32F2F",
            "role": "Tier-1 / Landing Gear",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Quarantine and tag all forged steel blanks from batch BDS-2026-08.",
                    "Divert raw forgings queue to secondary audited supplier in Sheffield."
                ],
                "timeline": "6 operational days for batch trace and tool setups"
            },
            "validationPlan": {
                "steps": [
                    "Perform non-destructive ultrasonic void scans on next 50 castings.",
                    "Conduct metallurgical grain analysis on co-forged coupon bars."
                ],
                "timeline": "3 business days of quality audits"
            }
        },
        "downstreamImpact": "Landing gear strut shortages; final integration halts.",
        "mitigationObjective": "Isolate contaminated metal batches and transition forging queue to Sheffield."
    },
    {
        "id": "SUP-404R1",
        "facility": "Rolls-Royce Derby Plant",
        "location": "Derby, UK",
        "disruption": "FAA airworthiness review on widebody turbine blade castings",
        "severity": 8.0,
        "likelihood": 88,
        "timeToHit": 10,
        "tier": 1,
        "fullDescription": "FAA regulators investigate turbine blade investment castings after microscopic cracking reports. Shipments on hold pending metallurgical validation.",
        "sourceData": "FAA bulletin: FAA-AD-RR-BLAD",
        "mapPosition": {
            "coordinates": [-1.4552, 52.8931],
            "color": "#D32F2F",
            "role": "Tier-1 / Aircraft Engines",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Initiate double-blind x-ray inspections on active inventory blades.",
                    "Utilize reserve turbine blade safety stock held at Schiphol hub."
                ],
                "timeline": "5 days of inspection sweeps and buffer release coordination"
            },
            "validationPlan": {
                "steps": [
                    "Verify replacement castings match strict FAA structural tolerances.",
                    "Audit stress tests on thermal test stand profiles."
                ],
                "timeline": "2 business days of engineering sign-off"
            }
        },
        "downstreamImpact": "Widebody engine shipment halts; potential Renton and Charleston assembly halts.",
        "mitigationObjective": "Execute rigorous double-blind inspections and release safety buffer stock."
    },
    {
        "id": "SUP-512S1",
        "facility": "CFM Evendale Assembly Lines",
        "location": "Evendale, OH, US",
        "disruption": "LEAP engine bypass duct quality escape",
        "severity": 8.3,
        "likelihood": 90,
        "timeToHit": 8,
        "tier": 1,
        "fullDescription": "Fastener drill misalignment found in composite engine bypass ducts. Inbound parts held for inspection and rework.",
        "sourceData": "Quality alert: CFM-QA-BYP-09",
        "mapPosition": {
            "coordinates": [-84.2619, 39.2573],
            "color": "#D32F2F",
            "role": "Tier-1 / Turbofans",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy rework teams to repair misaligned composite fastener holes.",
                    "Adjust assembly jigs to prevent drill guide calibration drift."
                ],
                "timeline": "4 business days of rework and jig adjustments"
            },
            "validationPlan": {
                "steps": [
                    "Perform metrology checks on fastener alignment on first 30 ducts.",
                    "Audit pull-force tolerances on replacement fasteners."
                ],
                "timeline": "24 hours of structural checkouts"
            }
        },
        "downstreamImpact": "LEAP-1B engine delivery delays for narrowbody B737 MAX assemblies.",
        "mitigationObjective": "Rework misaligned composite fastener holes and recalibrate guide jigs."
    },
    {
        "id": "SUP-212H1",
        "facility": "Collins Chula Vista Facility",
        "location": "Chula Vista, CA, US",
        "disruption": "Engine nacelle inlet acoustic panel bonding defect",
        "severity": 7.9,
        "likelihood": 85,
        "timeToHit": 12,
        "tier": 1,
        "fullDescription": "Ultrasonic scan found localized adhesive voids in nacelle inner barrel acoustic panels. Production batches quarantined.",
        "sourceData": "Metrology scan: CCV-US-BND-05",
        "mapPosition": {
            "coordinates": [-117.0842, 32.6401],
            "color": "#D32F2F",
            "role": "Tier-1 / Systems Integration",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Quarantine affected inner barrel panels and check bonding records.",
                    "Switch to backup composite curing lines to resume baseline output."
                ],
                "timeline": "5 days of process audit and line tooling swaps"
            },
            "validationPlan": {
                "steps": [
                    "Conduct non-destructive ultrasonic void testing on all replacement layups.",
                    "Perform pull tests on coupon samples cured under identical profiles."
                ],
                "timeline": "2 days of engineering quality checks"
            }
        },
        "downstreamImpact": "Propulsion integration delays; risks engine mount final delivery schedules.",
        "mitigationObjective": "Bypass composite bonding defects via backup curing line activation."
    },
    {
        "id": "SUP-401A2",
        "facility": "Safran Landing Systems Bidos Facility",
        "location": "Bidos, FR",
        "disruption": "Piston chromium plating plating thickness micro-escape",
        "severity": 7.3,
        "likelihood": 80,
        "timeToHit": 15,
        "tier": 1,
        "fullDescription": "Plating bath chemical imbalance resulted in chrome layers 5 microns below aerospace minimums. Batches quarantined.",
        "sourceData": "Chemical analysis report: BDS-CHM-PLT-02",
        "mapPosition": {
            "coordinates": [-0.605, 43.181],
            "color": "#FFB300",
            "role": "Tier-1 / Landing Gear",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Isolate plating batches from BDS-PLT-02 running queue.",
                    "Recalibrate plating chemical bath composition to standard parameters."
                ],
                "timeline": "3 operational days for chemical balancing and test runs"
            },
            "validationPlan": {
                "steps": [
                    "Verify layer thickness on test coupon rods using laser metrology.",
                    "Conduct micro-hardness test checks on first 10 production samples."
                ],
                "timeline": "24 hours of chemical composition testing"
            }
        },
        "downstreamImpact": "Landing gear piston shortages; delayed shock strut assembly schedules.",
        "mitigationObjective": "Bypass plating defects by chemical bath balancing and rapid test audits."
    },
    {
        "id": "SUP-502A2",
        "facility": "Honeywell Aerospace Phoenix Facility",
        "location": "Phoenix, AZ, US",
        "disruption": "Valve manifold machining casting quality escape",
        "severity": 6.9,
        "likelihood": 82,
        "timeToHit": 11,
        "tier": 1,
        "fullDescription": "Metrology scan found hydraulic casting voids in flow control valve housings. Inbound material quarantined for testing.",
        "sourceData": "Casting scan report: PHX-QA-CST-10",
        "mapPosition": {
            "coordinates": [-112.074, 33.4484],
            "color": "#FFB300",
            "role": "Tier-1 / Avionics & APUs",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Quarantine and label flow control valve casting housings.",
                    "Transition production queue to alternative audited foundry lines."
                ],
                "timeline": "4 days for casting setups and mold transfers"
            },
            "validationPlan": {
                "steps": [
                    "Perform ultrasonic void testing on next 30 castings.",
                    "Verify chemical precursors and structural tensile properties."
                ],
                "timeline": "24 hours of structural checkouts"
            }
        },
        "downstreamImpact": "APU build delays; delayed system integrations on narrowbody lines.",
        "mitigationObjective": "Bypass casting flaws via alternative foundry setups and quality checks."
    },
    {
        "id": "SUP-404R2",
        "facility": "Rolls-Royce Derby Plant",
        "location": "Derby, UK",
        "disruption": "Combustion liner welding gas contamination review",
        "severity": 7.4,
        "likelihood": 84,
        "timeToHit": 9,
        "tier": 1,
        "fullDescription": "Argon shield gas purity dropped below limits during combustion liner welding runs. Completed liners held for testing.",
        "sourceData": "Gas sensor telemetry: DRB-GAS-SHLD",
        "mapPosition": {
            "coordinates": [-1.4552, 52.8931],
            "color": "#FFB300",
            "role": "Tier-1 / Aircraft Engines",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy rework teams to scan combustion liner weld areas.",
                    "Replace argon shield gas bottles and verify nozzle flow rates."
                ],
                "timeline": "4 business days of inspection sweeps and nozzle tuning"
            },
            "validationPlan": {
                "steps": [
                    "Audit welding gas purity logs over three consecutive test cycles.",
                    "Perform non-destructive x-ray inspections on combustion liner seams."
                ],
                "timeline": "24 hours of gas composition validation"
            }
        },
        "downstreamImpact": "Combustor ring shortages; delayed final engine mount integration schedules.",
        "mitigationObjective": "Bypass welding gas flaws by gas bottle swaps and rapid scans."
    },

    # --- EXTERNAL INFRASTRUCTURE (Prefixes: Other IDs) ---
    {
        "id": "SUP-808H1",
        "facility": "Alcoa Reykjavik Smelter",
        "location": "Reykjavik, IS",
        "disruption": "Geothermal power grid substation failure stops smelter pots",
        "severity": 8.4,
        "likelihood": 90,
        "timeToHit": 21,
        "tier": 3,
        "fullDescription": "High-voltage grid substation transformer failure cut smelter power, causing raw aluminum molten metal freeze inside 12 pots.",
        "sourceData": "Power Grid SCADA Alert: REYK-SMELT-PWR",
        "mapPosition": {
            "coordinates": [-21.8277, 64.1265],
            "color": "#D32F2F",
            "role": "Tier-3 / Raw Aluminum",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Procure raw refined ingots from secondary smelter in Trondheim, Norway.",
                    "Deploy specialized contractor crew to clean frozen smelter pots."
                ],
                "timeline": "15 days to stage Norwegian imports and clean pots"
            },
            "validationPlan": {
                "steps": [
                    "Verify power supply stability logs with Reykjavik Energy leads.",
                    "Audit lining thickness metrics of repaired smelter pots."
                ],
                "timeline": "3 days of furnace validation test cycles"
            }
        },
        "downstreamImpact": "Aluminum alloy supply volatility for wing skin extrusions.",
        "mitigationObjective": "Establish a secondary smelting contract in Trondheim to bypass frozen pots."
    },
    {
        "id": "SUP-994A1",
        "facility": "VSMPO-Avisma Verkhnyaya Salda",
        "location": "Verkhnyaya Salda, RU",
        "disruption": "Raw titanium ingot export licensing delay",
        "severity": 8.9,
        "likelihood": 92,
        "timeToHit": 30,
        "tier": 3,
        "fullDescription": "Geopolitical trade compliance reviews delay custom clearance of raw titanium ingots at border control ports.",
        "sourceData": "Customs clearance logs: RU-SALD-EXP-3",
        "mapPosition": {
            "coordinates": [60.8028, 58.0461],
            "color": "#D32F2F",
            "role": "Tier-3 / Titanium Billets",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Lobby trade compliance panels to expedite defense export licenses.",
                    "Transition raw billet imports to pre-qualified friendly-nation sources."
                ],
                "timeline": "20 days for compliance audits and legal reviews"
            },
            "validationPlan": {
                "steps": [
                    "Confirm all alternative raw material suppliers possess active ASL-certification tags.",
                    "Verify customs clearance documentation files."
                ],
                "timeline": "2 days of legal compliance audits"
            }
        },
        "downstreamImpact": "Long-term titanium raw billet supply volatility; potential cost overrides.",
        "mitigationObjective": "Divert imports to domestic titanium mills and resolve trade licenses."
    },
    {
        "id": "SUP-808H2",
        "facility": "Woodward Fort Collins Plant",
        "location": "Fort Collins, CO, US",
        "disruption": "Regional power grid gas line rupture halts heat treat ovens",
        "severity": 7.2,
        "likelihood": 80,
        "timeToHit": 11,
        "tier": 2,
        "fullDescription": "Utility gas line leak cuts fuel supplies to Fort Collins. Valve heat treatment ovens shut down for safety containment.",
        "sourceData": "Utility feed: CO-GAS-LNE-FAIL",
        "mapPosition": {
            "coordinates": [-105.0844, 40.5853],
            "color": "#FFB300",
            "role": "Tier-2 / Fuel Controls",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Activate temporary electrical backup heaters to preserve active synthesize runs.",
                    "Divert next heat treat oven queue to partner facility in Loveland."
                ],
                "timeline": "4 days for utility gas line repairs and oven recalibration"
            },
            "validationPlan": {
                "steps": [
                    "Verify furnace pressure and gas purity logs.",
                    "Audit surface hardness metrics on first 50 valve sleeves."
                ],
                "timeline": "24 hours of chemical validation test cycles"
            }
        },
        "downstreamImpact": "Avionics system build delays; delayed cockpit system integrations.",
        "mitigationObjective": "Bypass Woodward gas loss via Loveland backup ovens and electric overlays."
    },
    {
        "id": "SUP-994A2",
        "facility": "Woodward Fort Collins Plant",
        "location": "Fort Collins, CO, US",
        "disruption": "Water main break floods machining cell floor",
        "severity": 6.7,
        "likelihood": 76,
        "timeToHit": 2,
        "tier": 2,
        "fullDescription": "Industrial water pipe burst flooded CNC shop floor. Production lines 1 and 2 offline pending cleanup and safety certification.",
        "sourceData": "Plant Facility SCADA: WOOD-FLD-FLR",
        "mapPosition": {
            "coordinates": [-105.0844, 40.5853],
            "color": "#FFB300",
            "role": "Tier-2 / Fuel Controls",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy industrial water extraction pumps to clear shop floor.",
                    "Switch to backup machining cells in Woodward bay C."
                ],
                "timeline": "2 days for water cleanup and machine drying validation"
            },
            "validationPlan": {
                "steps": [
                    "Conduct electrical safety checks on all flooded CNC machines.",
                    "Audit Metrology calibration files on first 10 production samples."
                ],
                "timeline": "12 hours of electrical checks"
            }
        },
        "downstreamImpact": "Valve manifold machining bottlenecks; delayed APU integration schedules.",
        "mitigationObjective": "Bypass flooded CNC shop floors using bay C backup cells."
    },
    {
        "id": "FAC-999A",
        "facility": "Port of Charleston Terminal 3",
        "location": "Charleston, SC, US",
        "disruption": "Severe coastal storm surge flooding blocks logistics terminal",
        "severity": 7.7,
        "likelihood": 86,
        "timeToHit": 1,
        "tier": 0,
        "fullDescription": "Tropical storm surge flooded Charleston harbor access roads. Cargo shipments of widebody parts delayed.",
        "sourceData": "NOAA Storm warning: CHS-SURGE-LEVEL-3",
        "mapPosition": {
            "coordinates": [-79.9311, 32.7765],
            "color": "#D32F2F",
            "role": "Logistics / Coastal Gateway",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Reroute cargo container transport routes via inland road trucking routes.",
                    "Verify power supply stability logs and check generator oil levels."
                ],
                "timeline": "4 days for road haulage setups and storm cleanup"
            },
            "validationPlan": {
                "steps": [
                    "Verify dry cargo parameters inside incoming composite matrix containers.",
                    "Audit harbor intake capacity logs before staged convoy arrivals."
                ],
                "timeline": "24 hours of harbor coordination"
            }
        },
        "downstreamImpact": "Inbound transport delay causing structural assembly shortages.",
        "mitigationObjective": "Reroute incoming container trucks to inland corridors to bypass storm floods."
    },
    {
        "id": "FAC-999B",
        "facility": "Everett Final Assembly Bay B",
        "location": "Everett, WA, US",
        "disruption": "Regional power grid surge halts assembly crane",
        "severity": 7.3,
        "likelihood": 80,
        "timeToHit": 2,
        "tier": 0,
        "fullDescription": "Severe lighting strike damaged substation transformer. Overhead assembly crane operations offline pending regulator repair.",
        "sourceData": "Utility sensor: EVT-GRID-SURGE",
        "mapPosition": {
            "coordinates": [-122.2034, 47.4797],
            "color": "#D32F2F",
            "role": "Tier-0 / Main Line Assembly",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Activate localized emergency generator backup to run secondary cranes.",
                    "Expedite replacement voltage transformer delivery from supplier."
                ],
                "timeline": "3 days for repair parts install and crane testing"
            },
            "validationPlan": {
                "steps": [
                    "Perform load-bearing tests on repaired crane assembly.",
                    "Audit transformer voltage consistency logs."
                ],
                "timeline": "12 hours of load testing"
            }
        },
        "downstreamImpact": "Main assembly flow halts; high risk of final assembly line delays.",
        "mitigationObjective": "Bypass crane downtime using generator backup arrays and quick transformer swaps."
    }
]

# Write out to frontend/src/data/threatRegistry.json and backend/data/threatRegistry.json
data_dir = "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/src/data"
os.makedirs(data_dir, exist_ok=True)
registry_path = os.path.join(data_dir, "threatRegistry.json")
with open(registry_path, "w", encoding="utf-8") as f:
    json.dump(threats, f, indent=2)

backend_dir = "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data"
os.makedirs(backend_dir, exist_ok=True)
backend_path = os.path.join(backend_dir, "threatRegistry.json")
with open(backend_path, "w", encoding="utf-8") as f:
    json.dump(threats, f, indent=2)

print(f"Generated registry with {len(threats)} signals!")
