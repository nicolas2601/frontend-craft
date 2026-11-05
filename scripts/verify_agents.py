#!/usr/bin/env python3
"""Validate the frontend-craft specialist subagent definitions."""

import re
import sys
from pathlib import Path

EXPECTED_AGENTS = (
    "fc-reference-scout",
    "fc-ux-architect",
    "fc-art-director",
    "fc-ui-system-designer",
    "fc-component-sourcer",
    "fc-asset-artist",
    "fc-frontend-builder",
    "fc-motion-whimsy",
    "fc-a11y-auditor",
    "fc-finish-gate-reviewer",
)
READ_ONLY_AGENTS = {"fc-a11y-auditor", "fc-finish-gate-reviewer"}
WRITE_TOOLS = {"write", "edit", "multiedit", "notebookedit"}
UPSTREAM_COMMIT = "b37b5bb33b78f2c1d6567d98e25ca818e3259219"
EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF☀-➿️]")
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
FIELD_RE = re.compile(r"^([A-Za-z][\w-]*):[ \t]*(.*)$", re.MULTILINE)


def _frontmatter(text):
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None
    return {key: value.strip() for key, value in FIELD_RE.findall(match.group(1))}


def _validate_agent(path, name):
    text = path.read_text(encoding="utf-8")
    errors = []
    fields = _frontmatter(text)
    if fields is None:
        return [f"{name}: missing frontmatter"]
    if fields.get("name") != name:
        errors.append(f"{name}: frontmatter name must equal the file name")
    if not fields.get("description"):
        errors.append(f"{name}: description is required")
    if EMOJI_RE.search(text):
        errors.append(f"{name}: emoji are not allowed")
    if "STATUS:" not in text or "EVIDENCE:" not in text:
        errors.append(f"{name}: must define the STATUS/EVIDENCE return contract")
    tools = {tool.strip().lower() for tool in fields.get("tools", "").split(",") if tool.strip()}
    if name in READ_ONLY_AGENTS and tools & WRITE_TOOLS:
        errors.append(f"{name}: reviewers must not hold write tools")
    return errors


def validate_agents(project_root):
    root = Path(project_root).resolve()
    folder = root / "agents" / "frontend-craft"
    errors = []
    for name in EXPECTED_AGENTS:
        path = folder / f"{name}.md"
        if path.is_symlink() or not path.is_file():
            errors.append(f"{name}: missing agent definition")
            continue
        errors.extend(_validate_agent(path, name))
    extras = sorted(p.name for p in folder.glob("*.md") if p.stem not in EXPECTED_AGENTS) if folder.is_dir() else []
    errors.extend(f"unexpected agent file: {name}" for name in extras)
    roster = root / "skills" / "frontend-craft" / "references" / "agent-roster.md"
    roster_text = roster.read_text(encoding="utf-8") if roster.is_file() else ""
    errors.extend(f"roster does not name {name}" for name in EXPECTED_AGENTS if name not in roster_text)
    notice = root / "agents" / "NOTICE.md"
    notice_text = notice.read_text(encoding="utf-8") if notice.is_file() else ""
    if "MIT" not in notice_text or UPSTREAM_COMMIT not in notice_text:
        errors.append("NOTICE.md must carry the MIT notice and the pinned upstream commit")
    return errors


def main():
    errors = validate_agents(Path(__file__).resolve().parents[1])
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    if not errors:
        print("Agent validation passed.")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
