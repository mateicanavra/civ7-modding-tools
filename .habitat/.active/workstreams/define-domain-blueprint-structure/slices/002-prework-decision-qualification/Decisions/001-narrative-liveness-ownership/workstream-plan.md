# Narrative Liveness And Ownership Workstream Plan

Status: decision packet, sealed by execution

This packet runs prework item 1 from the `002-prework-decision-qualification`
slice. The decision is:

```text
determine which mods/mod-swooper-maps/src/domain/narrative/** paths and
symbols are live, which owner controls the live material, and which unused
material can be deleted.
```

The domain blueprint applies by kind to every selected domain root. This packet
therefore treats `domain/narrative/**` as current source evidence for liveness
and ownership, while the blueprint law remains generative over domain kind.

## Objective

Produce a row-level decision for every narrative-domain path and connected
collar path:

- delete with consumer proof;
- qualified for Domino 001 with an exact destination;
- recipe/stage-owned with an exact owner path;
- domain-owned with existing governing scope or file law;
- future Gameplay story design context where current source is deleted and no
  current destination exists.

The output feeds Domino 001 by removing guesswork before source-moving work
begins.

## Authority Order

1. direct user decisions in this thread;
2. active prework frame and scope/decision-book files;
3. Civ7 architecture/product authority and ADRs;
4. source code, imports, callers, tests, generated/runtime evidence;
5. Narsil, KNIP, `rg`, and Git history as evidence.

Current source location is evidence. Owner placement comes from authority plus
consumer proof.

## Evidence Policy

The packet uses graph-tracing and corpus-building rails:

- `rg` and file reads enumerate current rows, exports, imports, and collars;
- Narsil symbol/reference/call tools corroborate liveness and reachability;
- KNIP reports dead-code suspicion and is interpreted through repo-specific
  entry surfaces;
- architecture docs decide ownership when source liveness is known.

KNIP is supporting evidence because this repo has no KNIP config and Habitat
rule manifests are outside KNIP's default entry model. Narsil is graph evidence
and remains bounded to symbol/reference/call tools; hybrid search is outside
this packet.

## Team Lanes

The steward owns synthesis, write-back, and final row decisions.

| Lane | Artifact | Output contract |
| --- | --- | --- |
| Authority Mapper | `corpus/architecture-authority.md` | Controlling owner criteria, source docs, and implications for narrative/story, placement, recipe/stage, domain, adapter, and deletion. |
| Source Corpus Mapper | `corpus/narrative-source-inventory.md` | Every narrative file and connected collar row with exports, imports, external callers, and initial evidence tags. |
| Narsil Graph Tracer | `evidence/narsil-graph.md` | Symbol/reference/call evidence for narrative exports and graph reachability. |
| Dead-Code Auditor | `evidence/knip-dead-code.md` | KNIP command, raw relevant findings, and limits. |
| Owner Classifier | `synthesis/disposition-table.md` | One disposition per path or symbol, including owner, action, evidence strength, and governing authority. |
| Fresh reviewers | `reviews/review-findings.md` | Findings on destination invention, missed collars, weak liveness proof, and process drift. |

## Search Geometry

The work fans out in parallel, then converges:

```text
authority docs
source inventory          -> owner classification -> fresh review -> decision summary
Narsil graph evidence
KNIP dead-code evidence
```

The packet includes three collars beyond the narrative folder:

- public barrels: `mods/mod-swooper-maps/src/domain/index.ts` and
  `mods/mod-swooper-maps/src/domain/config.ts`;
- recipe/stage wiring: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  and current standard stage sources;
- test callers: `mods/mod-swooper-maps/test/story/**`.

Unrelated Civ7 runtime narrative UI code is a separate package concern and is
recorded only as a name-collision collar, not as MapGen narrative-domain
liveness.

## Closure Criteria

This decision closes when:

- every file under `mods/mod-swooper-maps/src/domain/narrative/**` has a row in
  `synthesis/disposition-table.md`;
- each connected collar path has a row;
- every row has one of the accepted outcomes listed in Objective;
- Narsil and KNIP evidence are recorded with limits;
- review findings are accepted, rejected with evidence, or converted into
  packet edits;
- the final user-facing summary states what can be deleted, what has live
  consumers, what moves under existing owner law, and which story concepts have
  no current destination because the current implementation is deleted.

## Write Boundary

This packet writes only active Habitat authority material under:

```text
.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/001-narrative-liveness-ownership/
```

Source migration, deletion, enforcement packets, and runtime code changes are
handled by execution slices, not by this decision packet.
