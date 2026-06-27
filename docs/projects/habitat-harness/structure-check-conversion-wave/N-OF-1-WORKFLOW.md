# N-of-1 Mixed Command-Check Cleanup Workflow

## Purpose

This is the end-to-end operating workflow for one leading agent to clean up a
bounded Habitat authority segment, such as one domain, niche, blueprint, or
small related packet family.

The workflow is not a separate investigation project. It is the execution loop:
look, analyze, classify, change, prove, and close.

## Current Starting State

The starting corpus is partially prepared, not absent.

Use these existing inputs first:

1. `docs/projects/habitat-harness/command-check-split-systematic-wave/`
2. `docs/projects/habitat-harness/structure-check-conversion-wave/assertion-corpus.jsonl`
3. `docs/projects/habitat-harness/structure-check-conversion-wave/closure.md`
4. `docs/projects/habitat-harness/execution-surface-map/`
5. Direct current files under `.habitat/**`

The corpus is good enough to execute from, but it is not final authority by
itself. The first stage reconciles those rows against current disk so stale rows
do not drive changes.

## Agent Contract

One agent owns the whole loop for its assigned segment.

That agent may inspect multiple rules or subjects in the segment. It should not
hand off midway unless the segment crosses into a different domain owner or a
stop condition is reached.

The unit of work is an assertion, not a command script. A command script can be
deleted or shrunk only when every branch inside it has an owner.

## Stage 1: Reconcile The Segment

Inputs:

- prior corpus rows for the segment;
- current `.rule.json`, `.check.*`, `.pattern.md`, `.structure.toml`, baseline,
  and `category.md` files;
- execution-surface analytics.

Actions:

1. List every current command-check rule in the segment.
2. Join each current rule to prior corpus rows.
3. Mark each row as one of:
   - `already-converted`
   - `ready-to-classify`
   - `stale-row`
   - `new-current-row`
   - `blocked-by-missing-source`
4. Add any current command-check branch that the old corpus missed.

Exit artifact:

- a segment assertion ledger with one row per assertion.

## Stage 2: Analyze Assertions

For each assertion row, inspect the direct source. Do not infer from rule names
alone.

Required source reads:

- the `rule.json`;
- the `.check.*` script;
- adjacent `category.md`;
- adjacent `.pattern.md` or `.structure.toml`, if present;
- referenced package/source files;
- narrower companion Habitat rules if the assertion may already be owned.

Exit condition:

- the agent can describe what the assertion proves without naming the current
  implementation mechanism.

## Stage 3: Classify Ownership

Assign exactly one owner disposition per assertion:

| Owner | Use When |
| --- | --- |
| `structure-check` | Current-tree file/directory topology expressible in TOML v1: root globs, direct-child `required`/`allowed`/`forbidden`, `open`/`closed`, file/directory kind. |
| `grit-check` | Source, Markdown, import/export, call, identifier, or token shape that Grit can express as a diagnostic. |
| `existing-rule` | A narrower accepted Habitat rule already owns the assertion. |
| `nx-data` | Package JSON scripts, Nx targets, target order, workspace graph, dependency graph, or build/currentness metadata. |
| `package-local-validator` | Runtime/API behavior, evaluated config, generated-output equivalence, package semantics, or command output correctness. |
| `delete-demote` | Transitional residue, duplicate debt, stale compatibility material, or not worth enforcing. |

Structure-check exclusions are strict. Do not route source syntax, import/export
law, graph traversal, evaluated config, generated freshness, package JSON shape,
Nx target semantics, or runtime behavior into structure-check.

Exit artifact:

- each assertion row has an owner, evidence refs, confidence, and proof plan.

## Stage 4: Implement The Clear Rows

Implement rows whose owner and proof are clear.

For `structure-check`:

1. Add a sibling or split packet with `ownerTool: "structure-check"`.
2. Add `structureFile` pointing at a repo-relative `.structure.toml`.
3. Express only TOML v1 topology.
4. Add/update baseline.
5. Remove that branch from the old `.check.*` script.

For `grit-check`:

1. Add or reuse a `.pattern.md`.
2. Set `ownerTool: "grit-check"`.
3. Preserve advisory/failure semantics intentionally.
4. Remove the duplicated branch from the command script only after proof.

For `existing-rule`:

1. Run the companion rule proof.
2. Remove duplicate command logic only if coverage matches.

For `nx-data`, `package-local-validator`, and unresolved residuals:

1. Keep or narrow the command-check residual for now.
2. Record the future owner.
3. Do not pretend the assertion is structure-check or Grit.

For `delete-demote`:

1. Delete only after confirming no remaining branch depends on it.
2. Update adjacent docs and corpus rows.

Exit condition:

- no removed command-check branch lacks a replacement owner or explicit
  deletion/demotion decision.

## Stage 5: Prove The Segment

Run focused proof first:

- converted structure rule:
  `bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool structure-check --json`
- converted Grit rule:
  `bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool grit-check --json`
- residual command rule:
  `bun tools/habitat/bin/dev.ts check --rule <rule-id> --json`
- companion existing rule:
  `bun tools/habitat/bin/dev.ts check --rule <companion-rule-id> --json`

Then run aggregate proof appropriate to the segment:

- `bun tools/habitat/bin/dev.ts check --tool structure-check --json`
- `bun tools/habitat/bin/dev.ts check --tool grit-check --json`
- `bun tools/habitat/bin/dev.ts check --tool command-check --json`

Known reds may be accepted only if they are named, current, and unrelated to the
segment changes.

Exit artifact:

- proof ledger with exact commands and result labels.

## Stage 6: Close The Segment

Before committing:

1. Update adjacent `category.md` files.
2. Update `.habitat/SUBJECT-CATEGORIES.md`.
3. Update the segment assertion ledger.
4. Regenerate execution-surface analytics if surfaces changed.
5. Parse JSON/JSONL artifacts.
6. Run `git diff --check`.
7. Run nearest Habitat checks/tests/builds required by touched code.

Closure requires:

- every assertion in the segment is converted, retained with a real owner,
  deleted/demoted, or explicitly blocked;
- command scripts are not left with hidden branches removed from the ledger;
- no stale file references remain in docs or analytics;
- the worktree is committed cleanly.

## Stop Conditions

Stop the segment and record the blocker if:

- TOML v1 cannot express the topology without new structure-check semantics;
- the old command script infers authority from current source instead of an
  explicit accepted expectation;
- converting would require changing the structure-check runner;
- a supposed Grit conversion requires broad regex noise instead of a real
  structural/source pattern;
- package runtime/generated/currentness behavior is being pulled into Habitat
  authority without an accepted owner model.

## Multi-Agent Expansion

This N-of-1 workflow is the unit to give to each future lane agent.

Each agent gets one bounded segment, runs all six stages, and leaves behind its
segment ledger and proof ledger. The orchestrator only integrates completed
segments, resolves cross-segment owner conflicts, and runs aggregate proof.

The multi-agent version is therefore parallel N-of-1 execution, not a different
process.

