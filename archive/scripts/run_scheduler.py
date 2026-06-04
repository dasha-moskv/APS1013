#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supply Chain Risk - Background Ingestion Scheduler Daemon
Executes the Google News batch processor and translator every ~7 seconds,
logging execution telemetry, deduplication metrics, and high-severity alarms
directly to a persistent log file for active monitoring.
"""

import os
import sys
import time
import subprocess
from datetime import datetime

# Define workspace directories
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSOR_PATH = os.path.join(SCRIPTS_DIR, "google_news_batch_processor.py")
LOG_PATH = os.path.join(SCRIPTS_DIR, "scheduler.log")

def log_message(message):
    """Log formatted timestamped message to console and file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {message}"
    print(formatted)
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception as e:
        print(f"[ERROR] Failed to write to log file: {e}")

def main():
    log_message("="*80)
    log_message("INSPECTING SUPPLY CHAIN SCHEDULER: INITIALIZING BACKGROUND RUNNER...")
    log_message(f"Target Processor: {PROCESSOR_PATH}")
    log_message(f"Telemetry Log Output: {LOG_PATH}")
    log_message("Interval: Every 7 seconds")
    log_message("="*80)

    if not os.path.exists(PROCESSOR_PATH):
        log_message(f"[CRITICAL ERROR] Batch processor not found at {PROCESSOR_PATH}!")
        sys.exit(1)

    cycle_count = 0
    try:
        while True:
            cycle_count += 1
            log_message(f"[CYCLE {cycle_count}] Triggering Google News RSS batch scan...")
            
            start_time = time.time()
            
            # Execute batch processor as a subprocess
            result = subprocess.run(
                [sys.executable, PROCESSOR_PATH],
                capture_output=True,
                text=True
            )
            
            elapsed = time.time() - start_time
            
            if result.returncode == 0:
                # Extract summary line from standard output
                summary = "Scan completed successfully."
                for line in result.stdout.splitlines():
                    if "[+] Ingested" in line or "[+] TRANSFORMATION" in line:
                        summary = line.strip()
                log_message(f"[SUCCESS] Cycle {cycle_count} finished in {elapsed:.2f}s. {summary}")
            else:
                log_message(f"[WARNING] Cycle {cycle_count} failed with code {result.returncode}!")
                log_message(f"[STDERR] {result.stderr.strip()[:200]}...")
            
            # Rest for 7 seconds
            time.sleep(7)
            
    except KeyboardInterrupt:
        log_message("="*80)
        log_message("SCHEDULER TERMINATED BY USER (KEYBOARD INTERRUPT). SHUTTING DOWN CLEANLY.")
        log_message("="*80)

if __name__ == "__main__":
    main()
