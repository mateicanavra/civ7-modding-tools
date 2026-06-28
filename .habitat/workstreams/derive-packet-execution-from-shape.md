# Workstream: Derive Packet Execution From Shape

## Source Plan

The following plan is the implementation oracle for this branch.

# Workstream: Derive Packet Execution From Shape

## Frame
**In:** `.habitat` packet leaves, `tools/habitat` registry loading, check execution, rule selection, hooks, Nx target generation, and packet authoring generators.

**Foreground:** remove duplicate execution classification from authored metadata. A packet's executable shape should determine how Habitat runs it.

**Exterior:** no ontology/classification redesign, no `pathCoverage`/`scanRoots` rename, no attempt to derive scan coverage from admitted authority, and no broad compatibility layer around the old model.

**Hard Core:** `rule.json` describes policy/routing facts; sibling role files describe execution shape; Habitat derives execution.

**Falsifier:** if live packets cannot be made unambiguous from shape without adding an equally broad replacement discriminator, this work stops and the packet shape needs reframing.

## Vocabulary
Use "runner" only for the top-level execution owner:

- `grit`: runs `pattern.md`.
- `habitat`: runs Habitat-native packet forms: `structure.toml`, `check.*`, file-layer guards, and any local script wrapper.
- `nx`: runs `graphTarget`.

Do not use `command-check`, `structure-check`, `file-layer`, or `format-check` as runner names. Those may survive only as internal Habitat modes during migration, not as authored metadata or public selector concepts.

## Interfaces
Authored `rule.json` input should no longer accept:

- `ownerTool`
- `detect`
- registry-level `scope`

Derived normalized packet record:

```ts
type PacketRunner =
  | { name: "grit"; patternPath: string; applyPatternPath?: string; patternName: string }
  | { name: "habitat"; mode: "structure"; structurePath: string }
  | { name: "habitat"; mode: "script"; scriptPath: string; runtime: "bun" | "node" | "bash" }
  | { name: "habitat"; mode: "file-layer"; guard: "generated-zone" | "forbidden-file-name" | "host-surface" }
  | { name: "nx"; target: { project: string; target: string } };
```

Canonical selector surface:

```bash
habitat check --runner grit
habitat check --runner habitat
habitat check --runner nx
```

`--tool` should not remain canonical. If retained temporarily, it must be a deprecated alias that immediately normalizes to `runner`.

## Execution Phases
1. **Write Workstream Record**
   - On new child branch, write this plan verbatim before implementation.
   - Record corpus counts, expected runner derivation rules, exclusions, and closure scans.

2. **Characterization First**
   - Add tests that derive runner from all live packets while `ownerTool` still exists.
   - Prove parity with current behavior.
   - Identify ambiguous packets before changing schema.

3. **Normalize Ambiguous Shapes**
   - Any packet with both `pattern.md` and `check.*` must be split or have the non-runner file moved to support material.
   - The 3 command rules without `check.*` get packet-local wrappers.
   - Formatting becomes Habitat script mode or Nx target mode, not `format-check`.

4. **Cut The Model**
   - Change registry loading to produce `PacketRunner`.
   - Remove authored `ownerTool`, `detect`, and `scope`.
   - Replace execution dispatch, reports, selectors, hooks, and Nx target generation with derived runner facts.

5. **Mechanical Corpus Migration**
   - Strip deleted fields from every live `rule.json`.
   - Keep `pathCoverage` and `scanRoots` unchanged.
   - Update docs/generators/tests to use runner vocabulary.

6. **Review Gate**
   - Run adversarial review for: hidden `ownerTool` preservation, shim ladders, ambiguous packet shapes, and selector drift.
   - Do not close with compatibility residue unless explicitly documented as deprecated and bounded.

## Validation
- `git diff --check`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame/tools/habitat check`
- Focused tests for registry derivation, selection, command execution, Grit, Habitat structure/script modes, file-layer guards, Nx targets, hooks, and generators.
- Runtime proof:
  - `bun run habitat -- check --runner grit --json`
  - `bun run habitat -- check --runner habitat --json`
  - `bun run habitat -- check --runner nx --json`
  - `bun run habitat -- check --json`
- Closure scans:
  - no authored `ownerTool`, `detect`, or registry `scope`
  - no canonical `--tool`
  - no ambiguous `pattern.md` + `check.*` packets
  - no unintended `pathCoverage`/`scanRoots` changes

## Assumptions
- `ownerProject` and `lane` stay authored.
- `structure.toml` internal `scopes` stay; only registry prose `scope` is removed.
- This is a whole migration slice, not a partial compatibility phase.

Skills used: framing-design, solution-design, systematic-workstream, review-code-quality, refactor-typescript.

## Corpus Snapshot

- Total live `.habitat/**/rule.json` packets: 124.
- Current authored `ownerTool` counts:
  - `grit-check`: 79
  - `command-check`: 30
  - `structure-check`: 8
  - `file-layer`: 5
  - `format-check`: 1
  - `nx`: 1
- Current packet role shapes:
  - `pattern.md` (+ optional `apply.pattern.md`) with `baseline.json`: 79
  - `check.mjs` with `baseline.json`: 9
  - `check.ts` with `baseline.json`: 16
  - `structure.toml` with `baseline.json`: 8
  - file-layer guard metadata with `baseline.json`: 5
  - `graphTarget` with `baseline.json`: 1
  - command packets missing `check.*`: 3
  - ambiguous `pattern.md` + `check.mjs` packets: 2
  - formatter packet with no executable role file: 1

## Derivation Rules

- `pattern.md` derives runner `grit`. `apply.pattern.md` is only valid beside `pattern.md`.
- `structure.toml` derives runner `habitat`, mode `structure`.
- Exactly one `check.ts`, `check.mjs`, or `check.sh` derives runner `habitat`, mode `script`, with runtime `bun`, `node`, or `bash`.
- File-layer guard facets derive runner `habitat`, mode `file-layer`, with a narrow guard value.
- `graphTarget` derives runner `nx`.
- A live packet must not expose more than one runner shape.
- Authored `rule.json` must not declare `ownerTool`, `detect`, or registry-level `scope`.

## Known Normalization Rows

- Move the two command packet `pattern.md` support files out of the executable role namespace.
- Add local `check.sh` wrappers for the three command packets that currently depend on authored `detect`.
- Convert the formatter packet to a packet-local Habitat script or Nx target shape.

## Closure Scans

- `rg '"ownerTool"|"detect"|^\\s*"scope"' .habitat --glob rule.json` returns no active authored rows.
- `rg -- '--tool' tools/habitat .habitat package.json` returns no canonical selector rows.
- `find .habitat -path '*/check/*/pattern.md'` has no packet directory that also contains `check.ts`, `check.mjs`, or `check.sh`.
- `git diff -- .habitat | rg 'pathCoverage|scanRoots'` is reviewed to confirm names and behavior were intentionally left unchanged.
