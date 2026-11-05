import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("verify_agents", ROOT / "scripts" / "verify_agents.py")
verify_agents = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify_agents)

READ_ONLY = {"fc-a11y-auditor", "fc-finish-gate-reviewer"}


def agent_text(name, tools=None, extra=""):
    tools_line = f"tools: {tools}\n" if tools else ""
    return (
        f"---\nname: {name}\ndescription: Use for {name}.\n{tools_line}---\n\n"
        f"# {name}\n\nReturn `STATUS: COMPLETE` then `EVIDENCE:`.\n{extra}"
    )


def build_project(root, skip=None, overrides=None):
    folder = Path(root) / "agents" / "frontend-craft"
    folder.mkdir(parents=True)
    for name in verify_agents.EXPECTED_AGENTS:
        if name == skip:
            continue
        text = (overrides or {}).get(name) or agent_text(name, "Read, Grep, Glob" if name in READ_ONLY else None)
        (folder / f"{name}.md").write_text(text, encoding="utf-8")
    (Path(root) / "agents" / "NOTICE.md").write_text(
        "MIT License\n\nb37b5bb33b78f2c1d6567d98e25ca818e3259219\n", encoding="utf-8"
    )
    skill = Path(root) / "skills" / "frontend-craft" / "references"
    skill.mkdir(parents=True)
    (skill / "agent-roster.md").write_text(" ".join(verify_agents.EXPECTED_AGENTS), encoding="utf-8")
    return Path(root)


class AgentTests(unittest.TestCase):
    def test_complete_roster_passes(self):
        with tempfile.TemporaryDirectory() as temporary:
            self.assertEqual(verify_agents.validate_agents(build_project(temporary)), [])

    def test_missing_agent_is_reported(self):
        with tempfile.TemporaryDirectory() as temporary:
            errors = verify_agents.validate_agents(build_project(temporary, skip="fc-art-director"))
        self.assertTrue(any("fc-art-director" in error for error in errors), errors)

    def test_name_must_match_file_and_description_is_required(self):
        with tempfile.TemporaryDirectory() as temporary:
            bad = "---\nname: other\n---\n\nSTATUS:\n"
            errors = verify_agents.validate_agents(build_project(temporary, overrides={"fc-ux-architect": bad}))
        self.assertTrue(any("name" in error for error in errors), errors)
        self.assertTrue(any("description" in error for error in errors), errors)

    def test_reviewers_cannot_hold_write_tools(self):
        with tempfile.TemporaryDirectory() as temporary:
            bad = agent_text("fc-finish-gate-reviewer", "Read, Write")
            errors = verify_agents.validate_agents(build_project(temporary, overrides={"fc-finish-gate-reviewer": bad}))
        self.assertTrue(any("write" in error.lower() for error in errors), errors)

    def test_emoji_and_missing_return_contract_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            bad = agent_text("fc-motion-whimsy", extra="\U0001F3A8\n").replace("STATUS: COMPLETE", "done")
            errors = verify_agents.validate_agents(build_project(temporary, overrides={"fc-motion-whimsy": bad}))
        self.assertTrue(any("emoji" in error for error in errors), errors)
        self.assertTrue(any("STATUS" in error for error in errors), errors)

    def test_roster_must_name_every_agent_and_notice_must_pin_upstream(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = build_project(temporary)
            (project / "skills/frontend-craft/references/agent-roster.md").write_text("fc-art-director", encoding="utf-8")
            (project / "agents/NOTICE.md").write_text("no license", encoding="utf-8")
            errors = verify_agents.validate_agents(project)
        self.assertTrue(any("roster" in error for error in errors), errors)
        self.assertTrue(any("NOTICE" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
