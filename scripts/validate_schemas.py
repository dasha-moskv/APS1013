#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validation Script for Aerospace Supply Chain Threat Schemas
Validates that backend signals database aligns 100% with the frontend components and 3D map expectations.
"""

import json
import os
import sys

def validate_threat_schema():
    signals_path = "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/signals.json"
    
    if not os.path.exists(signals_path):
        print(f"[ERROR] Signals database not found at: {signals_path}")
        sys.exit(1)
        
    try:
        with open(signals_path, "r", encoding="utf-8") as f:
            signals = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load JSON database: {e}")
        sys.exit(1)
        
    print("="*65)
    print(f"SCHEMATIC SYNERGY VALIDATION: {len(signals)} RECORDS")
    print("="*65)
    
    errors = 0
    warnings = 0
    
    # Required keys and their expected types / bounds
    required_keys = {
        "id": str,
        "facility": str,
        "location": str,
        "disruption": str,
        "severity": (int, float),
        "likelihood": int,
        "timeToHit": int,
        "tier": int,
        "fullDescription": str,
        "sourceData": str,
        "mapPosition": dict,
        "playbook": dict,
        "downstreamImpact": str,
        "mitigationObjective": str,
        "ingestedAt": int,
        "sources": list
    }
    
    for i, item in enumerate(signals, start=1):
        record_id = item.get("id", f"Record #{i}")
        
        # Check all required core fields
        for key, expected_type in required_keys.items():
            if key not in item:
                print(f"[FAIL] {record_id}: Missing required key '{key}'")
                errors += 1
                continue
                
            val = item[key]
            if not isinstance(val, expected_type):
                print(f"[FAIL] {record_id}: Key '{key}' has invalid type {type(val).__name__} (Expected {expected_type})")
                errors += 1
                
        if errors > 10:
            print("[FATAL] Too many validation failures. Stopping check.")
            break
            
        # Specific sub-field validation: mapPosition
        map_pos = item.get("mapPosition", {})
        if map_pos:
            if "coordinates" not in map_pos or not isinstance(map_pos["coordinates"], list) or len(map_pos["coordinates"]) != 2:
                print(f"[FAIL] {record_id}: 'mapPosition.coordinates' must be a list of exactly 2 float elements [lon, lat]")
                errors += 1
            else:
                for coord in map_pos["coordinates"]:
                    if not isinstance(coord, (int, float)):
                        print(f"[FAIL] {record_id}: Coordinate value {coord} must be numeric")
                        errors += 1
            
            if "color" not in map_pos or not str(map_pos["color"]).startswith("#"):
                print(f"[FAIL] {record_id}: 'mapPosition.color' must be a hex color code starting with '#'")
                errors += 1
                
            if "role" not in map_pos or not isinstance(map_pos["role"], str):
                print(f"[FAIL] {record_id}: 'mapPosition.role' must be a string")
                errors += 1
                
        # Specific sub-field validation: playbook
        playbook = item.get("playbook", {})
        if playbook:
            for plan_name in ["mitigationPlan", "validationPlan"]:
                if plan_name not in playbook:
                    print(f"[FAIL] {record_id}: Playbook is missing '{plan_name}' structure")
                    errors += 1
                    continue
                plan = playbook[plan_name]
                if not isinstance(plan, dict):
                    print(f"[FAIL] {record_id}: 'playbook.{plan_name}' must be a dictionary")
                    errors += 1
                    continue
                if "steps" not in plan or not isinstance(plan["steps"], list) or not all(isinstance(s, str) for s in plan["steps"]):
                    print(f"[FAIL] {record_id}: 'playbook.{plan_name}.steps' must be a list of strings")
                    errors += 1
                if "timeline" not in plan or not isinstance(plan["timeline"], str):
                    print(f"[FAIL] {record_id}: 'playbook.{plan_name}.timeline' must be a string")
                    errors += 1

        # Specific sub-field validation: sources
        sources = item.get("sources", [])
        if isinstance(sources, list):
            for s_idx, src in enumerate(sources):
                for k in ["title", "url", "summary"]:
                    if k not in src or not isinstance(src[k], str):
                        print(f"[FAIL] {record_id}: source item #{s_idx} missing or invalid '{k}' string")
                        errors += 1

    print("="*65)
    print("VALIDATION SUMMARY")
    print("="*65)
    if errors == 0:
        print("[SUCCESS] 100% Schematic Synergy Achieved!")
        print(f"[+] All {len(signals)} records fully compliant with interactive map, list grids, and side panels.")
    else:
        print(f"[FAIL] Schema checks completed with {errors} errors. See logs above.")
        
    print("="*65)

if __name__ == "__main__":
    validate_threat_schema()
