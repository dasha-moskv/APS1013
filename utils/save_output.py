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

        with open(file_path, "w", encoding="utf-8") as file:
            file.write("".join(self.output))

        return file_path
