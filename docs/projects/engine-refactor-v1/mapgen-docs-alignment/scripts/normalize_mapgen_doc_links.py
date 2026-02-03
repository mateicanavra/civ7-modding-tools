#!/usr/bin/env python3

from __future__ import annotations

import argparse
import difflib
import re
from dataclasses import dataclass
from pathlib import Path


_MAPGEN_DOCS_PREFIX = "docs/system/libs/mapgen/"
_CODE_SPAN_PATH_RE = re.compile(rf"`({_MAPGEN_DOCS_PREFIX}[^`\n]+?\.md)`")
_FENCE_RE = re.compile(r"^\s*```")
_H1_H2_RE = re.compile(r"^\s*#{1,2}\s+")
_GT_ANCHORS_H2 = "## Ground truth anchors"
_INLINE_GT_ANCHORS_RE = re.compile(r"\*\*Ground truth anchors\*\*", re.IGNORECASE)


@dataclass(frozen=True)
class FileResult:
    path: Path
    changed: bool
    replacements: int


def _find_repo_root(start: Path) -> Path:
    for parent in [start, *start.parents]:
        if (parent / ".git").exists():
            return parent
    raise RuntimeError(f"Could not find repo root from: {start}")


def _to_docs_site_href(label_path: str) -> str:
    # `docs/system/libs/mapgen/foo.md` -> `/system/libs/mapgen/foo.md`
    if not label_path.startswith("docs/"):
        raise ValueError(f"Expected docs-rooted path, got: {label_path}")
    return "/" + label_path[len("docs/") :]


def _is_already_link_wrapped(text: str, match_start: int, match_end: int) -> bool:
    if match_start <= 0:
        return False
    if text[match_start - 1] != "[":
        return False
    return text[match_end :].startswith("](")


def _normalize_text(*, text: str) -> tuple[str, int]:
    lines = text.splitlines(keepends=True)

    in_fence = False
    in_gt_anchors_section = False
    in_inline_gt_anchors_block = False

    total_replacements = 0
    out: list[str] = []

    for line in lines:
        if _FENCE_RE.match(line):
            in_fence = not in_fence
            out.append(line)
            continue

        if not in_fence and line.rstrip("\n").strip() == _GT_ANCHORS_H2:
            in_gt_anchors_section = True
            in_inline_gt_anchors_block = False
            out.append(line)
            continue

        # Exit the `## Ground truth anchors` section on the next H1/H2 heading.
        if (
            in_gt_anchors_section
            and _H1_H2_RE.match(line)
            and line.rstrip("\n").strip() != _GT_ANCHORS_H2
        ):
            in_gt_anchors_section = False

        # Inline “Ground truth anchors” blocks (not H2 headings) are treated as evidence; skip until blank line.
        if not in_fence and not in_gt_anchors_section and _INLINE_GT_ANCHORS_RE.search(line):
            in_inline_gt_anchors_block = True
            out.append(line)
            continue

        if in_inline_gt_anchors_block and (line.strip() == "" or _H1_H2_RE.match(line)):
            in_inline_gt_anchors_block = False

        if in_fence or in_gt_anchors_section or in_inline_gt_anchors_block:
            out.append(line)
            continue

        def repl(m: re.Match[str]) -> str:
            nonlocal total_replacements
            if _is_already_link_wrapped(line, m.start(), m.end()):
                return m.group(0)
            label_path = m.group(1)
            href = _to_docs_site_href(label_path)
            total_replacements += 1
            return f"[`{label_path}`]({href})"

        out.append(_CODE_SPAN_PATH_RE.sub(repl, line))

    return ("".join(out), total_replacements)


def _diff(*, before: str, after: str, rel_path: str) -> str:
    before_lines = before.splitlines()
    after_lines = after.splitlines()
    diff_lines = difflib.unified_diff(
        before_lines,
        after_lines,
        fromfile=f"a/{rel_path}",
        tofile=f"b/{rel_path}",
        lineterm="",
    )
    return "\n".join(diff_lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Normalize MapGen canonical docs intra-links while keeping literal repo paths as visible text.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes in-place (default is dry-run).",
    )
    parser.add_argument(
        "--diff",
        action="store_true",
        help="Print per-file unified diffs for changed files (default: on for dry-run; off for --apply).",
    )
    parser.add_argument(
        "--root",
        type=str,
        default="",
        help="Repo root override (default: auto-detect from this script location).",
    )
    args = parser.parse_args()

    script_path = Path(__file__).resolve()
    repo_root = Path(args.root).resolve() if args.root else _find_repo_root(script_path)

    docs_root = repo_root / "docs" / "system" / "libs" / "mapgen"
    if not docs_root.exists():
        raise RuntimeError(f"Expected MapGen docs root at: {docs_root}")

    show_diff = args.diff if args.diff else (not args.apply)

    results: list[FileResult] = []
    changed_files = 0
    total_replacements = 0

    for path in sorted(docs_root.rglob("*.md")):
        # Do not churn archived / historical pages.
        rel_from_docs_root = path.relative_to(docs_root)
        if rel_from_docs_root.parts and rel_from_docs_root.parts[0] == "_archive":
            continue

        before = path.read_text(encoding="utf-8")
        after, replacements = _normalize_text(text=before)
        changed = after != before

        results.append(FileResult(path=path, changed=changed, replacements=replacements))

        if not changed:
            continue

        changed_files += 1
        total_replacements += replacements

        rel_path = str(path.relative_to(repo_root))
        if show_diff:
            print(_diff(before=before, after=after, rel_path=rel_path))

        if args.apply:
            path.write_text(after, encoding="utf-8")

    print("\nSummary:")
    print(f"- Files scanned: {len(results)}")
    print(f"- Files changed: {changed_files}")
    print(f"- Replacements:  {total_replacements}")
    print(f"- Mode:          {'apply' if args.apply else 'dry-run'}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
