<toc>
  <item id="scope" title="Scope"/>
  <item id="automated" title="Automated checks"/>
  <item id="punchlist" title="Punchlist (required fixes)"/>
</toc>

# Hardening: claims + anchors audit

## Scope

This audit targets **canonical** MapGen docs only:
- include: `docs/system/libs/mapgen/**`
- exclude: `docs/system/libs/mapgen/_archive/**`

Archive docs may retain stale anchors; canonical docs must not.

## Automated checks

### Anchored code/doc path check (non-archive)

Result: **0 missing anchored file paths** in canonical MapGen docs (non-archive).

### “Status” drift check

Result: no canonical pages are labeled `Status: Proposed/Draft/TBD`.

## Punchlist (required fixes)

1) Fix incorrect path-root variable in the execution plan (project doc):
   - `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DOC-SPINE-IMPLEMENTATION-PROPOSAL.md`
   - Issue: `$MAPGEN_STUDIO` points at a non-existent `packages/mapgen-studio` root; Studio lives under `apps/mapgen-studio`.

