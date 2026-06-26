# Phase Record

## Phase

- Project: Habitat Harness
- Phase: D14A authored artifact authority
- Owner: Habitat authored-artifact boundary
- Source branch: `agent-DRA-d14a-authored-artifact-authority`
- Current stack-tip review branch at record repair:
  `agent-DRA-effect-record-authority-repair`
- Started: 2026-06-19
- Repaired: 2026-06-19
- Status: source implementation submitted; adjacent workstream records repaired

## Objective

Separate checked-in Habitat authored artifacts from Habitat managing code.

## Authority

- Direct user instruction: `.habitat` is authored data only; managing code stays
  under `tools/habitat-harness`.
- Source packet:
  `openspec/changes/deep-habitat-d14a-authored-artifact-authority`.
- Public compatibility matrix:
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- Packet index:
  `docs/projects/habitat-harness/openspec-remediation/packet-index.md`.

## Scope

- Moved active rule registry, baselines, and pattern corpus authority into
  `.habitat/**`.
- Kept TypeBox schemas, loaders, generators, plugin code, commands, and package
  source under `tools/habitat-harness`.
- Moved live checkout CLI/Grit validations out of Vitest unit ownership and into
  explicit validation scripts.

## Non-Claims

- D14A does not authorize domain-specific authoring topology.
- D14A does not make `.habitat/**` executable source.
- D14A does not authorize vendor-specific artifact hierarchies under
  `.habitat/**`.
- D14A does not close D14/D15 or the Effect-first substrate refactor.

## Stack Evidence

Captured during the record-authority repair on 2026-06-19:

```text
◉  agent-DRA-effect-first-openspec-domino-plan
◯  agent-DRA-effect-first-repair-backlog
◯  agent-DRA-habitat-domain-language-cleanup
◯  agent-DRA-d15-execution-provenance-trigger
◯  agent-DRA-d14-authoring-topology-fence
◯  agent-DRA-d14a-authored-artifact-authority
...
◯  main
```

Worktree status before repair implementation:

```text
## agent-DRA-effect-first-openspec-domino-plan...origin/agent-DRA-effect-first-openspec-domino-plan
nothing to commit, working tree clean
```

## Verification

The source layer recorded these completed gates in `tasks.md`:

- focused Habitat tests;
- typecheck/build;
- OpenSpec validation;
- final scans for old authored-data paths and live-test regressions.

Fresh current-stack rerun during record-authority repair:

| Command | Result | Proof class | Boundary |
| --- | --- | --- | --- |
| `bun run --cwd tools/habitat-harness check` | pass | TypeScript typecheck | Proves the current Habitat package typechecks; does not prove command runtime behavior. |
| `bun run --cwd tools/habitat-harness build` | pass | TypeScript build | Proves build output can be produced; generated output remains read-only for this repair. |
| `bun run --cwd tools/habitat-harness validate:cli-smoke` | pass | Current-tree command smoke | Proves the explicit CLI smoke script passes after live-checkout tests moved out of Vitest. |
| `bun run --cwd tools/habitat-harness validate:grit-patterns` | pass; 36 testable patterns reported | Native tool behavior | Proves native Grit pattern corpus validation, not current-tree cleanliness or apply safety. |
| `bun run openspec -- validate deep-habitat-d14a-authored-artifact-authority --strict` | pass | Spec validation | Proves D14A OpenSpec shape only. |

The record-authority repair reruns OpenSpec and diff gates in
`deep-habitat-effect-record-authority-repair`; those gates prove record shape
and cleanliness, not D14A source behavior.
