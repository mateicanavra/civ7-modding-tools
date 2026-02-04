#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ManifestRow:
    src_rel: str
    status: str
    replaced_by: list[str]


_SECTION_START = "## Deprecation manifest (candidates)"
_SECTION_END = "## Scan output (untriaged)"


def _extract_backticked_paths(cell: str) -> list[str]:
    return [m.group(1).strip() for m in re.finditer(r"`([^`]+)`", cell)]


def _extract_doc_path(cell: str) -> str:
    candidates = _extract_backticked_paths(cell)
    if candidates:
        return candidates[0]
    return cell.strip().split()[0]


def _parse_manifest_rows(*, manifest_text: str) -> list[ManifestRow]:
    start = manifest_text.find(_SECTION_START)
    if start == -1:
        raise ValueError(f"Missing section header: {_SECTION_START}")
    end = manifest_text.find(_SECTION_END, start)
    if end == -1:
        raise ValueError(f"Missing section header: {_SECTION_END}")

    lines = manifest_text[start:end].splitlines()
    rows: list[ManifestRow] = []
    in_table = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if stripped.startswith("| path | status |"):
            in_table = True
            continue
        if in_table and stripped.startswith("|---|"):
            continue
        if not in_table:
            continue
        if not stripped.startswith("|"):
            continue

        # `| a | b | c | d | e |` → ["a", "b", "c", "d", "e"]
        parts = [p.strip() for p in stripped.strip("|").split("|")]
        if len(parts) < 2:
            continue

        src_rel = _extract_doc_path(parts[0])
        status = parts[1].strip()
        replaced_by = _extract_backticked_paths(parts[3]) if len(parts) >= 4 else []

        rows.append(ManifestRow(src_rel=src_rel, status=status, replaced_by=replaced_by))

    return rows


def _archive_rel_from_src_rel(src_rel: str) -> str:
    src_path = Path(src_rel)
    if src_path.parts[:1] != ("docs",):
        raise ValueError(f"Expected docs-relative source path, got: {src_rel}")
    if len(src_path.parts) >= 2 and src_path.parts[1] == "_archive":
        raise ValueError(f"Source is already under docs/_archive: {src_rel}")
    return str(Path("docs") / "_archive" / src_path.relative_to("docs"))


def _title_from_doc_text(src_text: str, fallback: str) -> str:
    for line in src_text.splitlines():
        m = re.match(r"^#\s+(.*)$", line.strip())
        if m:
            return m.group(1).strip()
    return fallback


def _router_stub(*, title: str, replaced_by: list[str], archived_as: str) -> str:
    replaced_by_items = "\n".join(
        [
            '  <item id="purpose" title="Purpose"/>',
            '  <item id="replacements" title="Canonical replacements"/>',
            '  <item id="archive" title="Legacy archive"/>',
        ]
    )
    replaced_links = "\n".join([f"- `{p}`" for p in replaced_by]) if replaced_by else "- (none listed)"
    return (
        "<toc>\n"
        f"{replaced_by_items}\n"
        "</toc>\n\n"
        f"# {title} (legacy router)\n\n"
        "## Purpose\n\n"
        "This page exists only to preserve older links.\n"
        "It is **not** canonical documentation.\n\n"
        "## Canonical replacements\n\n"
        f"{replaced_links}\n\n"
        "## Legacy archive\n\n"
        f"The previous contents of this page were moved to `{archived_as}`.\n"
    )


def _looks_like_router_stub(text: str) -> bool:
    return "This page exists only to preserve older links." in text and "(legacy router)" in text


def _move_one(*, repo_root: Path, row: ManifestRow, apply: bool) -> tuple[str, str] | None:
    if row.status != "archive":
        return None

    src_rel = row.src_rel
    archive_rel = _archive_rel_from_src_rel(src_rel)

    src_abs = repo_root / src_rel
    archive_abs = repo_root / archive_rel

    if archive_abs.exists():
        if src_abs.exists() and _looks_like_router_stub(src_abs.read_text(encoding="utf-8")):
            return None
        raise FileExistsError(f"Archive target already exists: {archive_rel}")

    if not src_abs.exists():
        raise FileNotFoundError(f"Missing source doc: {src_rel}")

    src_text = src_abs.read_text(encoding="utf-8")
    title = _title_from_doc_text(src_text, fallback=Path(src_rel).stem)
    stub = _router_stub(title=title, replaced_by=row.replaced_by, archived_as=archive_rel)

    if not apply:
        print(f"[dry-run] move {src_rel} -> {archive_rel} + stub")
        return (src_rel, archive_rel)

    archive_abs.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src_abs), str(archive_abs))
    src_abs.write_text(stub, encoding="utf-8")
    print(f"moved {src_rel} -> {archive_rel} + stub")
    return (src_rel, archive_rel)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Execute DEPRECATION-MANIFEST.md 'archive' rows by moving docs under docs/_archive/** and leaving router stubs."
    )
    parser.add_argument(
        "--manifest",
        default="docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md",
        help="Path to the deprecation manifest (repo-relative).",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Perform moves. Without this flag, runs in dry-run mode.",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[5]
    manifest_abs = repo_root / args.manifest
    manifest_text = manifest_abs.read_text(encoding="utf-8")
    rows = _parse_manifest_rows(manifest_text=manifest_text)

    moved: list[tuple[str, str]] = []
    for row in rows:
        result = _move_one(repo_root=repo_root, row=row, apply=args.apply)
        if result:
            moved.append(result)

    if not moved:
        print("No archive actions to perform.")
        return 0

    print("\nArchive actions:")
    for src_rel, archive_rel in moved:
        print(f"- {src_rel} -> {archive_rel}")
    if not args.apply:
        print("\n(dry-run) Re-run with --apply to execute.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
