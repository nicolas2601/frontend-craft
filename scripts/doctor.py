#!/usr/bin/env python3
"""Read-only inventory of frontend-craft CLI prerequisites."""

import json
import shutil

TOOLS = (
    ("Node.js", "node", "core"),
    ("Python", "python3", "core"),
    ("OpenCode", "opencode", "core"),
    ("GitHub CLI", "gh", "core"),
    ("Hugging Face CLI", "hf", "optional"),
    ("HeroUI CLI", "heroui", "optional"),
    ("21st CLI", "21st", "optional"),
    ("Context7 CLI", "ctx7", "optional"),
    ("FFmpeg", "ffmpeg", "optional"),
    ("FFprobe", "ffprobe", "optional"),
    ("Bun", "bun", "optional"),
)
UNKNOWN_CAPABILITIES = ("HF MCP", "connected", "permitted", "quota", "success")


def build_report():
    tools = []
    for name, executable, category in TOOLS:
        path = shutil.which(executable)
        if name == "Python" and path is None:
            executable = "python"
            path = shutil.which(executable)
        tools.append({
            "name": name,
            "category": category,
            "executable": executable,
            "status": "available" if path else "missing",
            "path": path,
        })
    capabilities = [
        {"name": name, "status": "unknown", "reason": "Not checked by this read-only doctor."}
        for name in UNKNOWN_CAPABILITIES
    ]
    return {
        "schema_version": 1,
        "mode": "read-only",
        "status": "inventory_only",
        "status_semantics": "Executable availability does not establish MCP connectivity, permission, quota, or successful use.",
        "tools": tools,
        "capabilities": capabilities,
    }


def main():
    print(json.dumps(build_report(), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
