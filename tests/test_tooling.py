import importlib.util
import json
import shutil
import zipfile
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_script(name):
    path = ROOT / "scripts" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def copy_skill(temporary):
    project = Path(temporary)
    source = ROOT / "skills/frontend-craft"
    shutil.copytree(source, project / "skills/frontend-craft")
    return project


class VerifyTests(unittest.TestCase):
    def test_bundled_skill_passes_verification(self):
        verify = load_script("verify")
        self.assertEqual(verify.validate_skill(ROOT), [])

    def test_invalid_unhashable_fixture_id_is_reported(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            fixture_path = project / "skills/frontend-craft/assets/evaluation-cases.json"
            fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
            fixture["cases"][0]["id"] = ["not", "a", "string"]
            fixture_path.write_text(json.dumps(fixture), encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("invalid id" in error for error in errors), errors)

    def test_broken_markdown_target_and_anchor_are_rejected(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            manifest = project / "skills/frontend-craft/SKILL.md"
            manifest.write_text(manifest.read_text() + "\n[missing](references/missing.md#nowhere)\n", encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("broken Markdown link" in error for error in errors), errors)

    def test_broken_anchor_to_existing_markdown_is_rejected(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            manifest = project / "skills/frontend-craft/SKILL.md"
            manifest.write_text(manifest.read_text() + "\n[missing section](references/product-craft-foundation.md#not-a-section)\n", encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("broken Markdown anchor" in error for error in errors), errors)

    def test_duplicate_fixture_ids_are_rejected(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            fixture_path = project / "skills/frontend-craft/assets/evaluation-cases.json"
            fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
            fixture["cases"][1]["id"] = fixture["cases"][0]["id"]
            fixture_path.write_text(json.dumps(fixture), encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("ids must be unique" in error for error in errors), errors)

    def test_fixture_schema_and_version_are_enforced(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            fixture_path = project / "skills/frontend-craft/assets/evaluation-cases.json"
            fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
            fixture["cases"][0]["must"] = "not a list"
            fixture_path.write_text(json.dumps(fixture), encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("invalid must" in error for error in errors), errors)

    def test_fixture_version_is_enforced(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            fixture_path = project / "skills/frontend-craft/assets/evaluation-cases.json"
            fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
            fixture["version"] = 8
            fixture_path.write_text(json.dumps(fixture), encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("version 9" in error for error in errors), errors)

    def test_original_source_hash_is_pinned(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            source = project / "skills/frontend-craft/references/noel-playbook-source.md"
            source.write_text(source.read_text() + "\nmodified\n", encoding="utf-8")
            errors = verify.validate_skill(project)
        self.assertTrue(any("SHA-256 mismatch" in error for error in errors), errors)

    def test_symlinks_and_runtime_files_are_rejected(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            skill = project / "skills/frontend-craft"
            (skill / "scripts/runtime.pyc").write_bytes(b"cache")
            (skill / "references/linked.md").symlink_to(skill / "SKILL.md")
            errors = verify.validate_skill(project)
        self.assertTrue(any("symlink is not allowed" in error for error in errors), errors)
        self.assertTrue(any("unexpected skill file" in error for error in errors), errors)

    def test_symlinked_skill_root_is_rejected(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            skills = project / "skills"
            skills.mkdir()
            (skills / "frontend-craft").symlink_to(ROOT / "skills/frontend-craft", target_is_directory=True)
            errors = verify.validate_skill(project)
        self.assertTrue(any("symlink is not allowed" in error for error in errors), errors)

    def test_package_is_byte_verified_crc_valid_and_does_not_overwrite(self):
        verify = load_script("verify")
        with tempfile.TemporaryDirectory() as temporary:
            project = copy_skill(temporary)
            output = project / "dist/frontend-craft.skill"
            result = verify.package_skill(project, output)
            with zipfile.ZipFile(result) as archive:
                self.assertIsNone(archive.testzip())
                members = set(archive.namelist())
                self.assertIn("frontend-craft/references/noel-playbook-source.md", members)
                self.assertFalse(any(name.endswith(".pyc") for name in members))
                source = project / "skills/frontend-craft/references/noel-playbook-source.md"
                self.assertEqual(archive.read("frontend-craft/references/noel-playbook-source.md"), source.read_bytes())
            with self.assertRaises(FileExistsError):
                verify.package_skill(project, output)
            with self.assertRaisesRegex(ValueError, "outside the skill directory"):
                verify.package_skill(project, project / "skills/frontend-craft/nested.skill")


class DoctorTests(unittest.TestCase):
    def test_doctor_reports_unverified_capabilities_as_unknown(self):
        doctor = load_script("doctor")
        report = doctor.build_report()
        capabilities = {item["name"]: item for item in report["capabilities"]}
        self.assertEqual(report["schema_version"], 1)
        for name in ("HF MCP", "connected", "permitted", "quota", "success"):
            self.assertEqual(capabilities[name]["status"], "unknown")

    def test_python_tool_uses_python_fallback_when_python3_is_absent(self):
        doctor = load_script("doctor")
        with patch.object(doctor.shutil, "which", side_effect=lambda name: "/usr/bin/python" if name == "python" else None):
            python_tool = next(item for item in doctor.build_report()["tools"] if item["name"] == "Python")
        self.assertEqual(python_tool["status"], "available")
        self.assertEqual(python_tool["executable"], "python")

    def test_doctor_cli_emits_json_and_separates_availability(self):
        result = subprocess.run(
            [sys.executable, "-I", "-B", str(ROOT / "scripts/doctor.py")],
            check=True,
            capture_output=True,
            text=True,
            cwd=ROOT,
        )
        report = json.loads(result.stdout)
        self.assertEqual(report["status"], "inventory_only")
        self.assertTrue(all(tool["status"] in {"available", "missing"} for tool in report["tools"]))
        self.assertIn("does not establish MCP connectivity", report["status_semantics"])


if __name__ == "__main__":
    unittest.main()
