#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path


DEFAULT_DOC_ROOT = "docs/system/libs/mapgen"
DEFAULT_EXCLUDE_DIRS = {"_archive", "adrs", "research"}

BACKTICK_RE = re.compile(r"`([^`]+)`")
H1_RE = re.compile(r"^#\s+(.+?)\s*$")
ANCHORS_H2_RE = re.compile(r"^##\s+Ground truth anchors\s*$", re.IGNORECASE)
HEADING_RE = re.compile(r"^#{1,6}\s+")

LEGACY_ROUTER_RE = re.compile(r"\(legacy router\)", re.IGNORECASE)

# Heuristic: backticked tokens that look like repo-relative file paths.
FILE_EXT_RE = re.compile(
    r"\.(?:md|ts|tsx|js|mjs|cjs|json|ya?ml|sh|py|txt|css|html|svg|png|jpg|jpeg|gif)$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Finding:
    severity: str  # "error" | "warning"
    file: Path
    message: str


def find_repo_root(start: Path) -> Path:
    start = start.resolve()
    for candidate in (start, *start.parents):
        if (candidate / ".git").exists():
            return candidate
    raise RuntimeError("Could not locate repo root (no .git found in parents).")


def first_nonempty_line(lines: list[str]) -> str | None:
    for line in lines:
        if line.strip():
            return line
    return None


def iter_markdown_files(doc_root: Path, exclude_dirs: set[str]) -> list[Path]:
    files: list[Path] = []
    for path in doc_root.rglob("*.md"):
        if any(part in exclude_dirs for part in path.parts):
            continue
        files.append(path)
    return sorted(files)


def normalize_path_token(token: str) -> str | None:
    token = token.strip()
    if not token or token.startswith(("http://", "https://")):
        return None
    if token.startswith(("#", "./#", "../#")):
        return None

    # Strip common line/fragment decorations.
    token = re.sub(r"#L\d+(?:C\d+)?$", "", token)
    token = re.sub(r":\d+(?::\d+)?$", "", token)

    # Only treat as file path if it looks like one.
    if "/" not in token:
        return None
    if " " in token or "\t" in token:
        return None
    if not FILE_EXT_RE.search(token):
        return None

    return token


def extract_backticked_file_paths(lines: list[str]) -> list[str]:
    out: list[str] = []
    for line in lines:
        for m in BACKTICK_RE.finditer(line):
            normalized = normalize_path_token(m.group(1))
            if normalized:
                out.append(normalized)
    return out


def is_legacy_router(text: str) -> bool:
    # Prefer the title check, but fall back to any mention (routers are short).
    m = H1_RE.search(text)
    if m and LEGACY_ROUTER_RE.search(m.group(1)):
        return True
    return bool(LEGACY_ROUTER_RE.search(text))


def anchors_section_lines(lines: list[str]) -> list[str] | None:
    start_idx: int | None = None
    for idx, line in enumerate(lines):
        if ANCHORS_H2_RE.match(line.strip()):
            start_idx = idx + 1
            break
    if start_idx is None:
        return None

    section: list[str] = []
    for line in lines[start_idx:]:
        if HEADING_RE.match(line):
            break
        section.append(line)
    return section


def check_file(
    *,
    file_path: Path,
    repo_root: Path,
    forbid_workspace_aliases: bool,
    strict_terms: bool,
) -> list[Finding]:
    findings: list[Finding] = []
    rel = file_path.relative_to(repo_root)

    text = file_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    first_line = first_nonempty_line(lines)
    if first_line is None or not first_line.strip().startswith("<toc>"):
        findings.append(
            Finding(
                severity="error",
                file=rel,
                message="Missing mini XML <toc> at top (first non-empty line must start with '<toc>').",
            )
        )

    if forbid_workspace_aliases and "@mapgen/" in text:
        findings.append(
            Finding(
                severity="error",
                file=rel,
                message="Found workspace-only alias '@mapgen/*' in canonical docs; prefer published entrypoints (see policies).",
            )
        )
    elif "@mapgen/" in text:
        findings.append(
            Finding(
                severity="warning",
                file=rel,
                message="Found '@mapgen/*' mention; prefer published entrypoints unless explicitly discussed as a drift/policy exception.",
            )
        )

    if file_path.name.upper() != "GLOSSARY.MD":
        # Light heuristic: discourage local term re-definition patterns.
        term_def_re = re.compile(r"^\s*-\s+\*\*`[^`]+`\*\*:", re.IGNORECASE)
        if any(term_def_re.match(line) for line in lines):
            findings.append(
                Finding(
                    severity="error" if strict_terms else "warning",
                    file=rel,
                    message="Local term definition detected (use reference/GLOSSARY.md as the single source of truth).",
                )
            )

    if is_legacy_router(text):
        # Routers don't require a Ground truth anchors section, but their replacement pointers must exist.
        file_tokens = extract_backticked_file_paths(lines)
        for token in sorted(set(file_tokens)):
            target = Path(token)
            if not target.is_absolute():
                target = repo_root / target
            if not target.exists():
                findings.append(
                    Finding(
                        severity="error",
                        file=rel,
                        message=f"Broken router target: `{token}` does not exist.",
                    )
                )
        return findings

    section = anchors_section_lines(lines)
    if section is None:
        findings.append(
            Finding(
                severity="error",
                file=rel,
                message="Missing '## Ground truth anchors' section (required for canonical MapGen docs).",
            )
        )
        return findings

    anchor_tokens = extract_backticked_file_paths(section)
    if not anchor_tokens:
        findings.append(
            Finding(
                severity="warning",
                file=rel,
                message="No file path anchors found under 'Ground truth anchors' section.",
            )
        )
        return findings

    for token in sorted(set(anchor_tokens)):
        target = Path(token)
        if not target.is_absolute():
            target = repo_root / target
        if not target.exists():
            findings.append(
                Finding(
                    severity="error",
                    file=rel,
                    message=f"Missing anchor target: `{token}` does not exist.",
                )
            )

    return findings


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Validate canonical MapGen docs: require mini XML <toc>, require 'Ground truth anchors' sections, "
            "and ensure anchored file paths exist (excluding _archive/ and optional research/adrs)."
        )
    )
    parser.add_argument(
        "--root",
        default=DEFAULT_DOC_ROOT,
        help=f"Docs root to scan (default: {DEFAULT_DOC_ROOT})",
    )
    parser.add_argument(
        "--include-research",
        action="store_true",
        help="Include docs under research/ in checks (excluded by default).",
    )
    parser.add_argument(
        "--include-adrs",
        action="store_true",
        help="Include docs under adrs/ in checks (excluded by default).",
    )
    parser.add_argument(
        "--forbid-workspace-aliases",
        action="store_true",
        help="Treat '@mapgen/*' mentions as errors (otherwise warnings).",
    )
    parser.add_argument(
        "--strict-terms",
        action="store_true",
        help="Treat local term definitions as errors (otherwise warnings).",
    )

    args = parser.parse_args(argv)

    repo_root = find_repo_root(Path(__file__))
    doc_root = repo_root / args.root
    if not doc_root.exists():
        print(f"ERROR: docs root does not exist: {doc_root}", file=sys.stderr)
        return 2

    exclude_dirs = set(DEFAULT_EXCLUDE_DIRS)
    if args.include_research:
        exclude_dirs.discard("research")
    if args.include_adrs:
        exclude_dirs.discard("adrs")

    md_files = iter_markdown_files(doc_root, exclude_dirs=exclude_dirs)
    findings: list[Finding] = []
    for file_path in md_files:
        findings.extend(
            check_file(
                file_path=file_path,
                repo_root=repo_root,
                forbid_workspace_aliases=args.forbid_workspace_aliases,
                strict_terms=args.strict_terms,
            )
        )

    errors = [f for f in findings if f.severity == "error"]
    warnings = [f for f in findings if f.severity == "warning"]

    if findings:
        for f in errors:
            print(f"ERROR {f.file}: {f.message}", file=sys.stderr)
        for f in warnings:
            print(f"WARN  {f.file}: {f.message}", file=sys.stderr)

    if errors:
        print(f"\nFAILED: {len(errors)} errors, {len(warnings)} warnings", file=sys.stderr)
        return 1

    if warnings:
        print(f"\nOK (with warnings): {len(warnings)} warnings", file=sys.stderr)
        return 0

    print("OK: MapGen docs hardening checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

