# Niche Lane Shaping Frame

Status: normative method frame for shaping child lanes before sorting rules

Built: 2026-06-29

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for agents deciding whether a parent niche
`rules/` lane needs child lane shaping before rule movement.

## Frame Identity

Frame name: Niche Lane Shaping

For situation: a parent Habitat niche contains direct `rules/` rows whose
shared parent is too broad, but the rows do not yet prove a new blueprint,
capability, or projection surface.

Mode: frame-discovery

Object-path: problem

## Scope And Provenance

In scope:

- Parent niche `rules/` lanes that visibly mix several semantic concerns.
- Candidate child niche or holding lanes needed before deeper sorting can be
  truthful.
- Physical movement of packets from a parent lane into the smallest honest
  child lane, sibling context, or `_remainder`.
- Explicit no-move retention when a row truly remains parent niche authority.
- The next pipeline parent-lane slice:
  `.habitat/civ7/mapgen/pipeline/rules/**`.

Out of scope:

- Creating new affirmed blueprints, capabilities, admission records, or final
  projection surfaces.
- Sorting every row into final ontology before the lanes exist.
- Broad corpus classification across unrelated authority families.
- Cleanup-first rewriting, splitting, consolidation, or retirement.
- Treating child lane names as constructible kinds.
- Running this as a normal autonomous-loop slice. This frame may authorize
  new child holding lanes only when the current domino explicitly selects it.

Source pointers:

- Direct user decision: shape the pipeline lanes into honest child holding
  lanes before deeper sorting.
- `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, niche, capability, and
  instance concepts.
- `.habitat/AUTHORITY-TREE-SHAPE.md` for current lane semantics.
- `.habitat/AUTHORITY-SLICE-FRAME.md` for bounded kind-family slice work.
- `.habitat/AUTHORITY-REMAINDER-SLICE-FRAME.md` for contextual remainder
  sorting.
- `.habitat/AUTHORITY-AUTONOMOUS-DOMINO-LOOP.md` for repeatable physical
  movement discipline and stop conditions.
- `.habitat/dominoes.md` for current sequence and receipts.
- Current manifests under `.habitat/**/rule.json` as evidence, not ontology.

## WHAT

This frame treats the parent niche `rules/` lane as the unit of analysis and
makes lane truth the primary signal. The work is not to discover every final
kind hidden in the rules. The work is to ask whether the parent lane is too
broad to carry its rows honestly, shape only the child lanes that are needed
now, and then move each packet into the smallest honest visible lane. A child
lane is a holding jurisdiction, not a blueprint claim. Within a child
jurisdiction, `rules/` still means intentional child authority; reviewed but
unresolved rows belong in that child jurisdiction's `_remainder/`.

## WHY

The previous kind and remainder slices succeeded because they changed the tree
before asking the next question. A parent `rules/` junk drawer blocks that same
ratchet: every row looks like parent authority until the parent lane is split
into honest child jurisdictions. Shaping the niche lanes first reduces state
space without prematurely admitting new ontology. The rejected alternative is a
full classification pass over all rows, which would produce hidden labels
without changing the authority surface and would flatten dependency order.

## Construction History

Structural alternative considered: promote the observed clusters directly into
new blueprints or capabilities.

Why rejected or demoted: the clusters may be real authority surfaces, but they
do not yet prove constructible kinds with the confidence of `recipe`,
`recipe-stage`, `recipe-step`, `domain`, or `domain-operation`. Promoting them
now would confuse a holding lane with accepted ontology.

Structural alternative considered: sort all parent-lane rows directly into
existing blueprints, current niche `rules/`, or `_remainder`.

Why rejected or demoted: several rows cut across existing blueprints and
contexts. Without shaping child lanes first, a future agent would have to infer
whether a row stayed in parent `rules/` intentionally or merely because no
honest holding lane existed.

## Selection Commitments

In:

- One parent niche lane at a time.
- Candidate child lanes that are needed to make that parent lane honest.
- Rule packet movement that preserves rule identity and behavior.
- Receipts that explain why each row moved, stayed, or deferred.

Foreground:

- Smallest honest lane over final ontology.
- Physical tree truth over hidden classification.
- Holding lanes as transitional jurisdictions, not blueprint/capability
  claims.
- Whole-rule ownership over partial-fit movement.
- Stop conditions when the next move requires new authority design.

Exterior:

- Global `_blueprints/` candidate campaigns outside the selected parent niche.
- New top-level `blueprints/` promotion.
- New capability, instance admission, or projection models.
- Behavior-changing cleanup.
- Naming polish that does not reduce semantic ambiguity.

## Hard Core And Protective Belt

Hard core:

1. A parent niche `rules/` lane should contain only rows that truly belong to
   that parent niche.
2. If direct parent rows mix distinct concerns, shape child holding lanes
   before pretending the rows are parent authority or final ontology.
3. Child holding lanes are current jurisdictions, not constructible blueprint
   claims.
4. Every primary row must receive a physical disposition: moved to a child
   lane, moved to an existing authority lane, moved to `_remainder`, retained
   as parent authority, explicitly excluded, or falsified.
5. The branch must end with visible tree state, not only a classification
   note.

Protective belt:

- A child lane may later become a niche, be dissolved, or feed a blueprint,
  capability, projection, import-law, or cleanup slice.
- A transitional holding lane means a child jurisdiction with `_remainder/`
  for reviewed unresolved rows. It does not make child `rules/` a staging lane.
- A row may remain in parent `rules/` if its whole meaning really governs the
  parent niche.
- A row may move outside the selected parent niche when the smallest honest
  lane already exists elsewhere.
- `_remainder/` remains visual debt for reviewed-but-not-final rows.
- Lane names should be natural enough to guide movement, but they are not the
  final ontology.

## Reframe Conditions

Reframe if the selected parent rows mostly require new blueprint, capability,
projection, or execution-surface authority before they can be placed in honest
lanes. In that case, write the narrower surface frame first instead of making a
holding-lane branch carry ontology it cannot prove.

Also reframe if the only available child lane name is capability-shaped,
projection-shaped, import-law-shaped, runner-shaped, operation-kind-shaped,
cleanup-only, or defect-token-shaped and the row does not prove intentional
child context authority. Those rows should move to the smallest honest
`_remainder/` or trigger a narrower surface frame.

## Method

Use this method when a parent niche lane is acting as a semantic junk drawer.

1. Read the governing source-order docs from `.habitat/dominoes.md`.
2. List every direct row under the selected parent `rules/` lane.
3. Inspect manifests and runner artifacts for the row-level concerns.
4. Inspect only the source needed to determine whether concerns are parent
   authority, child context, existing blueprint authority, or deferred pressure.
5. Name candidate child lanes before moving files.
6. For each candidate lane, state whether it is:
   - honest child niche/context authority;
   - child `_remainder/` visual debt;
   - or a falsified lane that should not be created.
7. Create only lanes used by the current slice.
8. Physically move packets, preserving `rule.json.id` and updating
   `placement`, `runner.files`, and `supportFiles.baseline`.
9. Record a disposition receipt that matches the final tree.
10. Run focused proof for moved rows and stale-reference scans.
11. Review for over-claimed ontology, parent-lane leftovers, and hidden
    classification state.

## Decision Criteria

Move to an existing blueprint when the whole rule already belongs to an
affirmed constructible kind.

Move to a child niche/context `rules/` lane when the whole rule intentionally
governs that child jurisdiction and another valid sibling could differ.

Move to a child `_remainder/` lane when the row has been reviewed but is not
final authority: missing positive kind governance, future projection/import-law
surface, cleanup/split/consolidation/retirement pressure, or mixed ownership.

Retain in parent `rules/` only when the row truly governs the parent niche as a
whole.

Do not create a child lane for a label that appears only as a defect token,
runner mode, file type, stale folder name, or current packet slug.

Reject child `rules/` lanes whose proposed names are only:

- reusable behavior that looks like a capability;
- projection, import-law, package-graph, build, or runner surfaces;
- cleanup or migration phases;
- operation kinds such as check/fix/generate;
- defect tokens or retired labels;
- current packet slugs.

These may still be valid child jurisdictions for `_remainder/` if they are the
smallest honest place to park reviewed debt, but they are not intentional
`rules/` authority without source proof.

## Receipt And Proof Contract

Every lane-shaping slice must record a disposition receipt with at least these
columns:

| Column | Meaning |
| --- | --- |
| `rule id` | Stable `rule.json.id`. |
| `start path` | Packet path at the beginning of the slice. |
| `bucket` | Existing blueprint, parent authority, child authority, child `_remainder`, external surface pressure, cleanup/split/retirement, explicit exclusion, or falsified. |
| `target path` | Final packet path or retained parent path. |
| `source evidence` | Manifest, runner artifact, or source files used to decide. |
| `whole-rule reason` | One sentence explaining why the whole row fits or does not fit the target. |
| `proof run` | Selected-rule proof, path proof, stale-reference scan, or no-move review proof. |
| `next trigger` | For `_remainder`, what future surface or event should revisit it. |

Minimum proof for an implementation slice:

```bash
git diff --check
bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/tools/habitat check
bun tools/habitat/bin/dev.ts check --rule <moved-or-retained-primary-rule-id> --json
```

Also run a manifest path proof for moved packets. Use this shape after
replacing the `movedRuleIds` list:

```bash
node - <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const repo = "/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame";
const movedRuleIds = [
  "<moved-rule-id>"
];
const manifests = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name === "rule.json") manifests.push(full);
  }
}
walk(path.join(repo, ".habitat"));
let failed = false;
for (const manifestPath of manifests) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!movedRuleIds.includes(manifest.id)) continue;
  const refs = [
    ...Object.values(manifest.runner?.files ?? {}),
    manifest.supportFiles?.baseline,
  ].filter(Boolean);
  for (const ref of refs) {
    const absolute = path.join(repo, ref);
    if (!fs.existsSync(absolute)) {
      failed = true;
      console.error(`${manifest.id}: missing ${ref}`);
    }
  }
}
if (failed) process.exit(1);
NODE
```

Run a parent-lane residue scan and compare it to the receipt's explicit
retained-parent rows:

```bash
find /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat/civ7/mapgen/pipeline/rules \
  -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort
```

If rows moved out of the parent lane, run a stale-reference scan using a regex
of moved rule IDs:

```bash
rg -n "\\.habitat/civ7/mapgen/pipeline/rules/(<moved-rule-id>|<another-moved-rule-id>)" \
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/.habitat \
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/tools \
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/docs \
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/packages \
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/mods
```

## First Application Result: Pipeline Parent Lane

The seed target for this method was:

```text
.habitat/civ7/mapgen/pipeline/rules/**
```

Domino 35 completed that seed application. The parent lane is now empty, and
the row groups proved these child lanes:

- `civ7/mapgen/pipeline/runtime/rules` for narrow runtime/compile separation
  rules whose whole predicate governs runtime implementation source.
- `civ7/mapgen/pipeline/runtime/_remainder` for broader deterministic
  generation and runtime/config pressure that is reviewed but not precise
  enough for stable runtime authority.
- `civ7/mapgen/pipeline/contracts/rules` for contract/public-source-surface
  rules that intentionally span recipe-step and domain-operation contracts.
  This is a source-surface jurisdiction, not a resurrection of physical
  category directories.
- `civ7/mapgen/pipeline/cutover/_remainder` for migration/cutover cleanup
  pressure.
- `civ7/mapgen/pipeline/config/_remainder` for reviewed map/recipe config
  cleanup pressure that does not yet have a stable config authority surface.

Reusable lesson: if a proposed child `rules/` lane is named from a source
surface such as runtime or contracts, the receipt must say which source surface
earns that jurisdiction. If the row is broad, mixed, or cleanup-shaped, park it
in the smallest honest `_remainder/` lane instead of making the child lane look
more settled than it is.

The starting lane hypothesis was not a disposition. It earned authority only
after row evidence and review. See `.habitat/dominoes.md` Domino 35 for the
current receipt.

## Review Expectations

Use bounded review agents after drafting a slice plan and after movement.

- Ontology reviewer: challenge lane names, reject blueprint/capability
  smuggling, and check whole-rule ownership.
- Implementation reviewer: check moved paths, manifest references, stale
  parent-lane references, and behavior proof.

Review findings must be fixed or explicitly dispositioned before closure.
