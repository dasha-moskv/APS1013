import os
import sys
from datetime import datetime

class TerminalLogger:
    def __init__(self):
        self.output = []
        self.terminal = sys.stdout

    def write(self, message):
        self.terminal.write(message)
        self.output.append(message)

    def flush(self):
        self.terminal.flush()

    def clear(self):
        self.output = []

    def save_to_file(self):
        os.makedirs("runs", exist_ok=True)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        file_path = os.path.join("runs", f"{timestamp}.txt")

        full_output = "".join(self.output)
        lines = full_output.splitlines()

        filtered_lines = []
        keep = False
        skip_next_separator = False

        skip_lines = {
            "Verifying supply base validity...",
            "[✓] Verified supply base",
            "Collecting public disruption signals...",
            "[✓] Signals collected",
            "Analyzing signals...",
            "[✓] Signals analyzed",
            "Scoring disruption risks...",
            "[✓] Risk scoring complete",
            "Generating disruption cards...",
            "[✓] Disruption cards generated",
            "Generating mitigation playbook...",
            "[✓] Mitigation playbook generated",
        }

        for line in lines:
            stripped = line.strip()

            # Skip terminal input prompts
            if stripped.startswith("Please enter an industry supply base:"):
                continue

            if stripped.startswith("Would you like to save the following output"):
                continue

            # Start saving from Supply Base
            if stripped.startswith("Supply Base:"):
                keep = True
                filtered_lines.append(line)
                continue

            if not keep:
                continue

            # Skip unwanted status lines
            if stripped in skip_lines:
                continue

            filtered_lines.append(line)

        # Remove excessive blank lines
        final_lines = []
        previous_blank = False

        for line in filtered_lines:
            is_blank = line.strip() == ""

            # Allow only one consecutive blank line
            if is_blank and previous_blank:
                continue

            final_lines.append(line)
            previous_blank = is_blank

        cleaned_output = "\n".join(final_lines).strip() + "\n"

        with open(file_path, "w", encoding="utf-8") as file:
            file.write(cleaned_output)

        return file_path
