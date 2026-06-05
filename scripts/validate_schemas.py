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
    base_dir = "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data"
    files_to_validate = [
        ("signals.json", os.path.join(base_dir, "signals.json")),
        ("threatRegistry.json", os.path.join(base_dir, "threatRegistry.json"))
    ]
    
    total_errors = 0
    
    for filename, filepath in files_to_validate:
        if not os.path.exists(filepath):
            print(f"[ERROR] Database file not found at: {filepath}")
            sys.exit(1)
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                records = json.load(f)
        except Exception as e:
            print(f"[ERROR] Failed to load {filename} JSON database: {e}")
            sys.exit(1)
            
        print("="*65)
        print(f"SCHEMATIC SYNERGY VALIDATION ({filename}): {len(records)} RECORDS")
        print("="*65)
        
        errors = 0
        
        # Required keys and their expected types
        required_keys = {
            "id": str,
            "facility": str,
            "location": str,
            "disruption": str,
            "severity": (int, float),
            "likelihood": (int, float),
            "timeToHit": (int, str),
            "tier": int,
            "fullDescription": str,
            "sourceData": str,
            "playbook": dict,
            "downstreamBusinessImpact": str,
            "mitigationObjective": str,
            "sources": list
        }
        
        for i, item in enumerate(records, start=1):
            record_id = item.get("id", f"Record #{i}")
            
            # Check all required core fields
            for key, expected_type in required_keys.items():
                if key not in item:
                    print(f"[FAIL] {filename} -> {record_id}: Missing required key '{key}'")
                    errors += 1
                    continue
                    
                val = item[key]
                if not isinstance(val, expected_type):
                    print(f"[FAIL] {filename} -> {record_id}: Key '{key}' has invalid type {type(val).__name__} (Expected {expected_type})")
                    errors += 1
                    
            if errors > 20:
                print(f"[FATAL] Too many validation failures in {filename}. Stopping file check.")
                break
                
            # Specific coordinates verification
            has_map_pos = "mapPosition" in item and isinstance(item["mapPosition"], dict)
            has_top_coords = "coordinates" in item and isinstance(item["coordinates"], list)
            
            if not (has_map_pos or has_top_coords):
                print(f"[FAIL] {filename} -> {record_id}: Missing both 'mapPosition' and top-level 'coordinates'")
                errors += 1
            
            # Specific sub-field validation: mapPosition
            if has_map_pos:
                map_pos = item["mapPosition"]
                if "coordinates" not in map_pos or not isinstance(map_pos["coordinates"], list) or len(map_pos["coordinates"]) != 2:
                    print(f"[FAIL] {filename} -> {record_id}: 'mapPosition.coordinates' must be a list of exactly 2 float elements [lon, lat]")
                    errors += 1
                else:
                    for coord in map_pos["coordinates"]:
                        if not isinstance(coord, (int, float)):
                            print(f"[FAIL] {filename} -> {record_id}: Coordinate value {coord} in mapPosition must be numeric")
                            errors += 1
                
                if "color" not in map_pos or not str(map_pos["color"]).startswith("#"):
                    print(f"[FAIL] {filename} -> {record_id}: 'mapPosition.color' must be a hex color code starting with '#'")
                    errors += 1
                    
                if "role" not in map_pos or not isinstance(map_pos["role"], str):
                    print(f"[FAIL] {filename} -> {record_id}: 'mapPosition.role' must be a string")
                    errors += 1
                    
            # Specific sub-field validation: top-level coordinates
            if has_top_coords:
                coords = item["coordinates"]
                if len(coords) != 2:
                    print(f"[FAIL] {filename} -> {record_id}: 'coordinates' must be a list of exactly 2 float elements [lon, lat]")
                    errors += 1
                else:
                    for coord in coords:
                        if not isinstance(coord, (int, float)):
                            print(f"[FAIL] {filename} -> {record_id}: Coordinate value {coord} in top-level coordinates must be numeric")
                            errors += 1
                    
            # Specific sub-field validation: playbook
            playbook = item.get("playbook", {})
            if playbook:
                for plan_name in ["mitigationPlan", "validationPlan"]:
                    if plan_name not in playbook:
                        print(f"[FAIL] {filename} -> {record_id}: Playbook is missing '{plan_name}' structure")
                        errors += 1
                        continue
                    plan = playbook[plan_name]
                    if not isinstance(plan, dict):
                        print(f"[FAIL] {filename} -> {record_id}: 'playbook.{plan_name}' must be a dictionary")
                        errors += 1
                        continue
                    if "steps" not in plan or not isinstance(plan["steps"], list) or not all(isinstance(s, str) for s in plan["steps"]):
                        print(f"[FAIL] {filename} -> {record_id}: 'playbook.{plan_name}.steps' must be a list of strings")
                        errors += 1
                    if "timeline" not in plan or not isinstance(plan["timeline"], str):
                        print(f"[FAIL] {filename} -> {record_id}: 'playbook.{plan_name}.timeline' must be a string")
                        errors += 1
    
            # Specific sub-field validation: sources
            sources = item.get("sources", [])
            if isinstance(sources, list):
                for s_idx, src in enumerate(sources):
                    for k in ["title", "url", "summary"]:
                        if k not in src or not isinstance(src[k], str):
                            print(f"[FAIL] {filename} -> {record_id}: source item #{s_idx} missing or invalid '{k}' string")
                            errors += 1
            
            # Specific RBA scoring factors validation
            for factor_key in ["severity_factors", "likelihood_factors", "timeToHit_factors"]:
                if factor_key in item:
                    val = item[factor_key]
                    if not isinstance(val, list) or not all(isinstance(x, str) for x in val):
                        print(f"[FAIL] {filename} -> {record_id}: Key '{factor_key}' must be a list of strings")
                        errors += 1
                            
        total_errors += errors
        if errors == 0:
            print(f"[SUCCESS] {filename} satisfies all schema validation checks!")
        else:
            print(f"[FAIL] {filename} failed with {errors} schema errors.")
            
    print("="*65)
    print("VALIDATION SUMMARY")
    print("="*65)
    if total_errors == 0:
        print("[SUCCESS] 100% Schematic Synergy Achieved across all database files!")
    else:
        print(f"[FAIL] Schema checks completed with {total_errors} errors. See logs above.")
        sys.exit(1)
    print("="*65)

if __name__ == "__main__":
    validate_threat_schema()
