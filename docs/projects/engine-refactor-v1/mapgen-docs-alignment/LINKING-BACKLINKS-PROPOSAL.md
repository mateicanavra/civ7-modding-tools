<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="current" title="Current posture (why it looks like plain text)"/>
  <item id="recommendation" title="Recommendation"/>
  <item id="conventions" title="Proposed conventions"/>
  <item id="backlinks" title="Backlinks: do we want them?"/>
  <item id="slices" title="Implementation slices"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Proposal: links + backlinks for the MapGen canonical docs spine

## TL;DR

The current MapGen docs intentionally use **literal path references** (e.g. `docs/system/libs/mapgen/...`) because:
- they are extremely searchable (humans + AI agents),
- they survive refactors (the text still matches the repo path),
- and they avoid link-rot when pages are moved or the site routing changes.

However, navigation is genuinely worse without clickable links.

Recommendation:
- keep the literal paths as **link text**, but make them **real markdown links** using stable docs-site absolute paths (e.g. `/system/libs/mapgen/...`), and
- adopt a minimal, low-rot “Related / Up / See also” pattern instead of a full backlink graph.

## Current posture (why it looks like plain text)

In the spike, the priority was:
1) correct target-authority posture (“WHAT IS” vs “WHAT SHOULD BE”), and
2) eliminate ambiguity/drift without inventing architecture.

Using literal path references was a deliberate tactic:
- Agents can reliably “jump” to a file by exact string match.
- It’s resilient even if the docs renderer changes.

The cost: navigation in the rendered docs is weaker, and context is easier to lose.

## Recommendation

Implement link normalization as a follow-on slice:

- Convert canonical doc spine references like:
  - ``docs/system/libs/mapgen/reference/STANDARD-RECIPE.md``
  into:
  - [`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`](/system/libs/mapgen/reference/STANDARD-RECIPE.md)

This keeps:
- searchability (the literal path remains visible),
- and adds clickability (docs-site absolute link).

## Proposed conventions

### 1) Link style for internal docs

Use markdown links whose **visible text is the literal repo path**:

```
[`docs/system/libs/mapgen/MAPGEN.md`](/system/libs/mapgen/MAPGEN.md)
```

Rationale:
- visible string still helps grep/search,
- the href is stable within the docs site.

### 2) “Related” sections (lightweight backlinks)

Instead of global backlinks, add a small section to “hub” pages:

- `MAPGEN.md`: “Start here” + “Fast links”
- each index page (`REFERENCE.md`, `HOW-TO.md`, `TUTORIALS.md`, `EXPLANATION.md`): short “See also”

Avoid backlinking every leaf page to every parent; it creates high maintenance cost.

### 3) One canonical “routing” map per doc type

Prefer index pages as the navigational backbone, not ad-hoc backlinks:
- `docs/system/libs/mapgen/tutorials/TUTORIALS.md`
- `docs/system/libs/mapgen/how-to/HOW-TO.md`
- `docs/system/libs/mapgen/reference/REFERENCE.md`
- `docs/system/libs/mapgen/explanation/EXPLANATION.md`

### 4) Keep “Ground truth anchors” as plain paths

Anchors remain plain paths (not links) because they are “evidence strings” more than navigation aids.

## Backlinks: do we want them?

Recommendation: **no full backlink graph**, yes to **lightweight local backlinks**.

Why avoid full backlinks:
- They are hard to keep correct as the spine evolves.
- They can accidentally encode “this is canon” through association.
- They often become noise in agent contexts.

What we do want:
- a predictable “Up / See also” pattern on hub pages,
- and an optional `RELATED.md` per directory if navigation genuinely suffers.

## Implementation slices

If we do this, implement it as two small slices:

1) **Slice 14A — Link normalization**  
   - Update `docs/system/libs/mapgen/**` to make “Fast links” and other cross-doc pointers clickable.
   - Keep literal path strings as visible text.
   - Do not touch `docs/_sidebar.md`.

2) **Slice 14B — Lightweight “Related” sections**  
   - Add `## See also` to the hub pages only.
   - Keep leaf pages focused; no giant link farms.

Optional tooling:
- A small Python script that finds inline-code doc paths and offers a patch (non-destructive) to turn them into markdown links when safe.

## Ground truth anchors

- Canonical MapGen gateway: `docs/system/libs/mapgen/MAPGEN.md`
- Canonical doc spine policies: `docs/system/libs/mapgen/policies/POLICIES.md`
- Diátaxis routing: `docs/system/libs/mapgen/MAPGEN.md` (“Routing map (Diátaxis)”)
