#!/usr/bin/env python3
"""Validate and optionally package the bundled frontend-craft skill."""

import argparse
import hashlib
import json
import os
import re
import sys
import zipfile
from pathlib import Path

SKILL_RELATIVE = Path("skills/frontend-craft")
SOURCE_SHA256 = "61b440e0382256affa387eaaa1c57be3cfedd84f001364b931178fc84da0fb7d"
FIXTURE_VERSION = 11
FIXTURE_CASE_COUNT = 31
ALLOWED_DIRS = {"references", "assets", "scripts", "tests", "modules"}
ALLOWED_SUFFIXES = {".md", ".py", ".json"}
LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")
HEADING_RE = re.compile(r"^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$", re.MULTILINE)


def validate_skill(project_root):
    root = Path(project_root).resolve()
    skill = root / SKILL_RELATIVE
    errors = []
    if (root / "skills").is_symlink() or skill.is_symlink():
        return ["symlink is not allowed in the skill path"]
    if not skill.is_dir():
        return [f"missing skill directory: {SKILL_RELATIVE}"]

    files = _skill_files(skill, errors)
    _validate_skill_manifest(skill, errors)
    _validate_original_source(skill, errors)
    _validate_markdown_links(skill, files, errors)
    _validate_fixture(skill, errors)
    return errors


def _skill_files(skill, errors):
    files = []
    for current, directories, names in os.walk(skill, followlinks=False):
        current_path = Path(current)
        for directory in list(directories):
            path = current_path / directory
            if path.is_symlink():
                errors.append(f"symlink is not allowed: {path.relative_to(skill)}")
                directories.remove(directory)
                continue
            if not _allowed_directory(skill, path):
                errors.append(f"unexpected directory: {path.relative_to(skill)}")
                directories.remove(directory)
        for name in names:
            path = current_path / name
            relative = path.relative_to(skill)
            if path.is_symlink():
                errors.append(f"symlink is not allowed: {relative}")
                continue
            try:
                path.resolve(strict=True).relative_to(skill.resolve())
            except (OSError, ValueError):
                errors.append(f"path escapes skill root or is unreadable: {relative}")
                continue
            if not _allowed_file(relative):
                errors.append(f"unexpected skill file: {relative}")
                continue
            files.append(path)
    return sorted(files)


def _allowed_directory(skill, path):
    relative = path.relative_to(skill)
    if len(relative.parts) == 1:
        return relative.name in ALLOWED_DIRS
    return len(relative.parts) == 2 and relative.parts[0] == "modules"


def _allowed_file(relative):
    if relative == Path("SKILL.md"):
        return True
    if relative.suffix.lower() not in ALLOWED_SUFFIXES:
        return False
    if len(relative.parts) == 2:
        return relative.parts[0] in ALLOWED_DIRS - {"modules"}
    return len(relative.parts) == 3 and relative.parts[0] == "modules"


def _validate_skill_manifest(skill, errors):
    manifest = skill / "SKILL.md"
    try:
        content = manifest.read_text(encoding="utf-8")
    except OSError:
        errors.append("missing or unreadable skills/frontend-craft/SKILL.md")
        return
    if not re.match(r"\A---\r?\n(?:(?!\r?\n---).)*?^name:\s*frontend-craft\s*$", content, re.MULTILINE | re.DOTALL):
        errors.append("SKILL.md frontmatter must declare name: frontend-craft")


def _validate_original_source(skill, errors):
    source = skill / "references/noel-playbook-source.md"
    try:
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
    except OSError:
        errors.append("missing or unreadable original Noel source")
        return
    if digest != SOURCE_SHA256:
        errors.append(f"original Noel source SHA-256 mismatch: {digest}")


def _validate_markdown_links(skill, files, errors):
    markdown = [path for path in files if path.suffix.lower() == ".md"]
    source = skill / "references/noel-playbook-source.md"
    for document in markdown:
        if document == source:
            continue
        try:
            content = document.read_text(encoding="utf-8")
        except OSError:
            errors.append(f"unreadable Markdown file: {document.relative_to(skill)}")
            continue
        for match in LINK_RE.finditer(content):
            target = match.group(1).strip().split(maxsplit=1)[0].strip("<>")
            if not target or target.startswith(("http://", "https://", "mailto:", "tel:", "data:")):
                continue
            path_part, separator, anchor = target.partition("#")
            path_part = path_part.partition("?")[0]
            target_path = (document.parent / path_part).resolve() if path_part else document.resolve()
            try:
                target_path.relative_to(skill.resolve())
            except ValueError:
                errors.append(f"Markdown link escapes skill root: {document.relative_to(skill)} -> {target}")
                continue
            if not target_path.is_file():
                errors.append(f"broken Markdown link: {document.relative_to(skill)} -> {target}")
                continue
            if separator and anchor and target_path.suffix.lower() == ".md":
                if not _has_anchor(target_path, anchor):
                    errors.append(f"broken Markdown anchor: {document.relative_to(skill)} -> {target}")


def _has_anchor(document, anchor):
    try:
        headings = HEADING_RE.findall(document.read_text(encoding="utf-8"))
    except OSError:
        return False
    seen = set()
    for heading in headings:
        base = _slug(heading)
        slug = base
        suffix = 1
        while slug in seen:
            slug = f"{base}-{suffix}"
            suffix += 1
        seen.add(slug)
        if slug == anchor:
            return True
    return False


def _slug(heading):
    text = re.sub(r"[`*_~]", "", heading).lower()
    text = re.sub(r"[^\w\-\s]", "", text, flags=re.UNICODE)
    return re.sub(r"\s+", "-", text.strip())


def _validate_fixture(skill, errors):
    fixture = skill / "assets/evaluation-cases.json"
    try:
        data = json.loads(fixture.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid evaluation fixture JSON: {exc}")
        return
    if not isinstance(data, dict) or data.get("version") != FIXTURE_VERSION:
        errors.append(f"evaluation fixture must be version {FIXTURE_VERSION}")
        return
    cases = data.get("cases")
    if not isinstance(cases, list) or len(cases) != FIXTURE_CASE_COUNT:
        errors.append(f"evaluation fixture must contain {FIXTURE_CASE_COUNT} cases")
        return
    ids = [case.get("id") for case in cases if isinstance(case, dict)]
    valid_ids = [value for value in ids if isinstance(value, str) and value.strip()]
    if len(ids) != len(cases):
        errors.append("evaluation fixture cases must be objects")
    if len(set(valid_ids)) != len(valid_ids):
        errors.append("evaluation fixture case ids must be unique")
    for index, case in enumerate(cases):
        if not isinstance(case, dict):
            continue
        if not isinstance(case.get("id"), str) or not case["id"].strip():
            errors.append(f"evaluation fixture case {index} has invalid id")
        for key in ("prompt",):
            if not isinstance(case.get(key), str) or not case[key].strip():
                errors.append(f"evaluation fixture case {index} has invalid {key}")
        for key in ("must", "must_not"):
            value = case.get(key)
            if not isinstance(value, list) or not value or any(not isinstance(item, str) or not item.strip() for item in value):
                errors.append(f"evaluation fixture case {index} has invalid {key}")


def package_skill(project_root, destination):
    errors = validate_skill(project_root)
    if errors:
        raise ValueError("; ".join(errors))
    root = Path(project_root).resolve()
    skill = root / SKILL_RELATIVE
    output = Path(destination).resolve()
    try:
        output.relative_to(skill.resolve())
    except ValueError:
        pass
    else:
        raise ValueError("package output must be outside the skill directory")
    files = [path for path in _skill_files(skill, []) if _allowed_file(path.relative_to(skill))]
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "x", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, Path("frontend-craft") / path.relative_to(skill))
    with zipfile.ZipFile(output, "r") as archive:
        if archive.testzip() is not None:
            output.unlink(missing_ok=True)
            raise OSError("package CRC verification failed")
        for path in files:
            member = str(Path("frontend-craft") / path.relative_to(skill))
            if archive.read(member) != path.read_bytes():
                output.unlink(missing_ok=True)
                raise OSError(f"package byte verification failed: {member}")
    return output


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", metavar="ZIP_PATH", help="create a new ZIP after validation")
    args = parser.parse_args(argv)
    project_root = Path(__file__).resolve().parents[1]
    errors = validate_skill(project_root)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    if args.package:
        try:
            output = package_skill(project_root, args.package)
        except (OSError, ValueError) as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 1
        print(f"Verified package: {output}")
    else:
        print("Skill validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
