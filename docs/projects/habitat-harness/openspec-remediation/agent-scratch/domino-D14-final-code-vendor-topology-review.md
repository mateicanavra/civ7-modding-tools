# D14 Final Code/Vendor Topology Rereview

Verdict: accepted for design/specification only.

No unresolved P1/P2 remain for this code/vendor topology lane. D14 remains not implementation-complete, and source implementation remains blocked behind the packet's own prerequisites: concrete D0 rows, D13 refusal-envelope source work, live D4/D12 facts where consumed, and any later accepted Authoring Topology authority.

## Review Scope

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
- Branch: `codex/d14-authoring-topology-fence-packet`
- Packet reviewed: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/**`
- Code surfaces reviewed:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/schema.json`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/project-generator.test.ts`
- Relevant D13 surfaces reviewed:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md`

Official Nx vendor authority used:

- `https://nx.dev/docs/features/generate-code`: `nx generate`/`nx g` invokes generators.
- `https://nx.dev/docs/extending-nx/intro`: official plugin docs show testing a generator with `--dry-run` and then running it by removing `--dry-run`.
- `https://nx.dev/docs/extending-nx/creating-files`: official generator docs state `-d`/`--dry-run` shows changes without applying them and preview generated file changes.
- `https://nx.dev/docs/guides/nx-console/console-generate-command`: Nx Console executes generators in `--dry-run` mode to preview results.

## Findings

### P1

None.

The repaired packet names D14 as the authoring-specific fence owner and future Authoring Topology as the implementation owner in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:17`. It closes the unsupported action inventory in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:44`, maps D13 refusal fields in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:143`, and explicitly keeps D13 as the generic refusal-envelope owner in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:23`.

The packet also blocks current MapGen source/generated writes: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:16` requires no MapGen source, registry, recipe, Studio artifact, or generated file writes for authoring requests, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:202` protects MapGen source under `mods/**` and `packages/mapgen-core/**` plus generated artifacts.

### P2

None.

The current project generator only supports uniform `plugin`, `foundation`, and `app` kinds through `PROJECT_KIND_CONTRACTS` and `SUPPORTED_KINDS` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs:4` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs:22`. It refuses non-uniform kinds before write helpers run in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs:51`, while writes start only after normalization and pre-write checks in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs:44`.

The schema still admits non-uniform names as command input in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/schema.json:18`, but D13 already treats schema-admitted unsupported kinds as refusal/compatibility surfaces rather than support in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:98`. D14 correctly preserves that distinction instead of treating schema enum values or dry-run output as authoring support.

Later command/test gates are falsifying in the D14 lane: the later D13 authoring fixture must assert blocked action, owner, recovery, retry condition, empty write set, no MapGen source/registry/generated writes, and D4/D12 non-claims in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:68`. D14 also keeps `habitat classify` as orientation/non-support context, not readiness, in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:233` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:30`.

### P3

None.

No command-surface nit rises to a P3 for this lane. The packet avoids pretending a `habitat generate` command exists, uses Nx generator dry-run language consistently with official Nx docs, distinguishes supported project dry-runs from authoring refusal fixtures, and keeps D14 acceptance explicitly design/specification-only in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:93`.

## Acceptance Basis

D14 can be accepted for design/specification only because the repaired disk state now satisfies this lane's acceptance questions:

- Real write set and protected paths are named in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:186`, with source implementation expressly unauthorized by this packet.
- D13 remains the only generic scaffold/refusal envelope owner; D14 supplies only authoring-specific facts and refusal language.
- Supported project generator behavior remains separate from authoring refusal behavior.
- Nx dry-run behavior is described as preview/no-write behavior, not as an invented Habitat command or authoring proof.
- MapGen source, registries, Studio/generated artifacts, and topology writes remain blocked until a later accepted Authoring Topology packet supplies its own topology model, write contract, D0 handling, and validation loop.

Skills used: domain-design, information-design, solution-design, typescript-refactoring.
