#!/usr/bin/env python3

from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class LegacyDoc:
    src_rel: str
    archive_rel: str
    stub: str


def _stub(*, title: str, replaced_by: list[str], archived_as: str) -> str:
    replaced_by_items = "\n".join(
        [
            '  <item id="purpose" title="Purpose"/>',
            '  <item id="replacements" title="Canonical replacements"/>',
            '  <item id="archive" title="Legacy archive"/>',
        ]
    )
    replaced_links = "\n".join([f"- `{p}`" for p in replaced_by])
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


def main() -> int:
    repo_root = Path(__file__).resolve().parents[5]
    docs: list[LegacyDoc] = [
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/architecture.md",
            archive_rel="docs/system/libs/mapgen/_archive/architecture.md",
            stub=_stub(
                title="MapGen architecture (domains layering + causality)",
                replaced_by=[
                    "docs/system/libs/mapgen/explanation/ARCHITECTURE.md",
                    "docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md",
                    "docs/system/libs/mapgen/reference/domains/DOMAINS.md",
                ],
                archived_as="docs/system/libs/mapgen/_archive/architecture.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/foundation.md",
            archive_rel="docs/system/libs/mapgen/_archive/foundation.md",
            stub=_stub(
                title="Foundation",
                replaced_by=["docs/system/libs/mapgen/reference/domains/FOUNDATION.md"],
                archived_as="docs/system/libs/mapgen/_archive/foundation.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/morphology.md",
            archive_rel="docs/system/libs/mapgen/_archive/morphology.md",
            stub=_stub(
                title="Morphology",
                replaced_by=["docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md"],
                archived_as="docs/system/libs/mapgen/_archive/morphology.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/hydrology.md",
            archive_rel="docs/system/libs/mapgen/_archive/hydrology.md",
            stub=_stub(
                title="Hydrology",
                replaced_by=["docs/system/libs/mapgen/reference/domains/HYDROLOGY.md"],
                archived_as="docs/system/libs/mapgen/_archive/hydrology.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/ecology.md",
            archive_rel="docs/system/libs/mapgen/_archive/ecology.md",
            stub=_stub(
                title="Ecology",
                replaced_by=["docs/system/libs/mapgen/reference/domains/ECOLOGY.md"],
                archived_as="docs/system/libs/mapgen/_archive/ecology.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/narrative.md",
            archive_rel="docs/system/libs/mapgen/_archive/narrative.md",
            stub=_stub(
                title="Narrative",
                replaced_by=["docs/system/libs/mapgen/reference/domains/NARRATIVE.md"],
                archived_as="docs/system/libs/mapgen/_archive/narrative.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/placement.md",
            archive_rel="docs/system/libs/mapgen/_archive/placement.md",
            stub=_stub(
                title="Placement",
                replaced_by=["docs/system/libs/mapgen/reference/domains/PLACEMENT.md"],
                archived_as="docs/system/libs/mapgen/_archive/placement.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/hydrology-api.md",
            archive_rel="docs/system/libs/mapgen/_archive/hydrology-api.md",
            stub=_stub(
                title="Hydrology API",
                replaced_by=[
                    "docs/system/libs/mapgen/reference/domains/HYDROLOGY.md",
                    "docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md",
                ],
                archived_as="docs/system/libs/mapgen/_archive/hydrology-api.md",
            ),
        ),
        LegacyDoc(
            src_rel="docs/system/libs/mapgen/realism-knobs-and-presets.md",
            archive_rel="docs/system/libs/mapgen/_archive/realism-knobs-and-presets.md",
            stub=_stub(
                title="Realism knobs and presets",
                replaced_by=[
                    "docs/system/libs/mapgen/how-to/tune-realism-knobs.md",
                    "docs/system/libs/mapgen/tutorials/tune-a-preset-and-knobs.md",
                ],
                archived_as="docs/system/libs/mapgen/_archive/realism-knobs-and-presets.md",
            ),
        ),
    ]

    changed: list[tuple[str, str]] = []
    for doc in docs:
        src = repo_root / doc.src_rel
        archive = repo_root / doc.archive_rel

        if not src.exists():
            raise FileNotFoundError(f"Missing source doc: {doc.src_rel}")
        if archive.exists():
            raise FileExistsError(f"Archive target already exists: {doc.archive_rel}")

        archive.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(archive))
        src.write_text(doc.stub, encoding="utf-8")
        changed.append((doc.src_rel, doc.archive_rel))

    print("Moved legacy MapGen root docs into _archive and replaced with routers:")
    for src_rel, archive_rel in changed:
        print(f"- {src_rel} -> {archive_rel}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
