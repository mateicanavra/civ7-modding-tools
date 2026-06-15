# Design — Harness Scaffold

## Package layout (spec draft §4.3, trimmed to this slice)

```text
tools/habitat-harness/
  package.json            # @internal/habitat-harness, private, kind:tooling tag
  src/
    index.ts
    plugin.ts             # Nx createNodesV2 target inference from rule pack
    bin/habitat.ts        # Bun-run CLI entrypoint
    rules/
      architecture.ts     # rule pack: defineHarnessRules({...})
      messages.ts         # agent-readable failure messages + remediation text
    lib/
      graph.ts paths.ts tags.ts spawn.ts diagnostics.ts git.ts baseline.ts
    executors/            # added per-slice as tools land (empty dirs not committed)
  baselines/<rule-id>.json
```

## Rule-pack record (invariant record from spec draft §7.2)

Each rule in `architecture.ts` carries:
`id`, `ownerTool` (`wrapped-script` | `wrapped-eslint` | `wrapped-test` |
later: `nx-boundaries` | `grit-check` | `grit-apply` | `biome` | `file-layer` |
`habitat-native`), `scope`, `forbids`, `why`, `detect` (command), `remediate`
(command or null), `message` (agent-readable), `exceptionPath`
(baseline ref or `none`).

## Ratchet semantics

- Baseline file: sorted JSON array of stable violation keys
  (`ruleId + path + fingerprint`), committed.
- `habitat check`: violation not in baseline → FAIL (new debt). In baseline →
  reported as `baselined`, non-failing.
- Baseline self-check rule (CI-visible mechanism): baseline files live at
  `tools/habitat-harness/baselines/<rule-id>.json`; the self-check compares
  baselines against the merge-base version and REJECTS any added entry UNLESS
  the same change also registers that entry's `ruleId` as a NEW rule in the
  rule pack — i.e. the ruleId does not exist at merge-base, cross-referenced
  from the rule-pack diff. The local `--expand-baseline` CLI flag remains as
  the local authoring gate for rule-introduction slices (recorded in the phase
  record), but CI enforcement derives from the rule-pack cross-reference,
  never from the flag.
- Locked rule: empty baseline → any violation fails; the rule pack marks
  `locked: true` so messaging changes from "burn down" to "violation".
- Prior art honored: `docs/.doc-ambiguity-lint-baseline.json` (existing
  baseline mechanism) and `lint-adapter-boundary.sh`'s allowlist migrate into
  this machinery in later slices, not here. A wrapped rule may reference a
  legacy allowlist file (e.g. adapter-boundary's 6-file allowlist) as its
  transitional exception source until its porting slice migrates the allowlist
  into a `baselines/<rule-id>.json`; the spec's baseline requirement is
  satisfied by that referenced allowlist in the interim.

## Wrapping strategy (zero-semantics-change)

Wrapped rules execute the existing implementation via `spawn` (argument
arrays), parse its output (or exit code where output is unstructured), and
re-emit normalized JSON diagnostics. Where a script reports only pass/fail,
the wrapped rule emits a single coarse diagnostic — granularity improves when
the rule is ported to its owning tool (later slices), never by editing the
script.

`habitat verify` = check + (post-H1) `bunx nx affected -t build,check,test` —
composition defined in the rule pack, not hardcoded. `habitat fix` with zero
fixable rules registered prints "no fixable rules registered" and exits 0.
`habitat verify` defaults its affected base to the merge-base with `main`
(overridable via `--base`).

## Nx plugin

`createNodesV2` infers a `habitat:check` target for projects matched by rule
scopes, options-driven (`{ checkTargetName }` per spec draft §5.2). No
`createDependencies` in this slice (no edges Nx cannot already infer).
