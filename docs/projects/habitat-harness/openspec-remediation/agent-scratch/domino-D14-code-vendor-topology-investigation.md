# D14 Code/Vendor Topology Investigation

Status: investigation/review input only. This document does not update the packet
index, does not close the D14 review lane, and does not authorize source edits.

Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
Branch: `codex/d14-authoring-topology-fence-packet`
Change root: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence`

## Executive Finding

D14 is not acceptable yet for design/specification acceptance.

The current D14 OpenSpec packet states the correct high-level product boundary:
no MapGen authoring implementation, no generic Habitat coupling to Civ authoring
concepts, and D13 must consume D14's early fence language. But the packet still
does not name the real source topology that owns the behavior it depends on.
That leaves a later implementer to decide which command/generator/classify path
owns authoring-topology refusal and which paths may be touched. Under the stated
stop condition, D14 must stay blocking.

The packet currently validates as OpenSpec, but that is only a shape check:

```text
bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict
=> exit 0, Change 'deep-habitat-d14-authoring-topology-fence' is valid
```

## Current-State Inventory

### D14 Source Packet

The source packet says D14's job is a fence, not implementation:

- Make future Authoring Topology explicit and prevent Phase 3 from implementing
  MapGen domain/op/stage/step/recipe generation as part of the structural
  substrate.
- Define unsupported authoring actions, future acceptance criteria, required
  investigation and acceptance gates, refusal output, and downstream deferral.
- Connect unsupported requests to D13 refusal shape.
- Non-claims: D14 does not implement Authoring Topology, does not prove MapGen
  product behavior, and does not create generators.

Local evidence:

- `docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:5`
- `docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:34`
- `docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:60`
- `docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:88`
- `docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:116`

### Current D14 OpenSpec Packet

The D14 OpenSpec scaffold captures the boundary but remains under-specified for
source topology:

- It says the expected Habitat implementation write set is named in `design.md`,
  but the current design does not actually enumerate that write set.
- It requires a concrete write set and protected path list before
  implementation, but still leaves that as future work.
- Its validation section names `bun run habitat classify
  mods/mod-swooper-maps/src/recipes/standard` as the only Habitat-specific gate.

Local evidence:

- `openspec/changes/deep-habitat-d14-authoring-topology-fence/proposal.md:50`
- `openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:47`
- `openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:9`
- `openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:20`

### D13 Contract D14 Depends On

D13 is the real command/generator/refusal owner D14 must feed. D13 defines:

- Authoring Topology requests as recipe/domain/op/stage/step/contract/default/
  schema/registry/Studio topology requests.
- D13 decision: refuse before writes using D14 early-fence language when
  available.
- Required refusal fields: blocked action, request class, closed reason,
  owning authority, recovery instruction, retry condition, empty write set, and
  non-claims.
- D13 write set and protected paths for later source implementation.
- Later D13 validation gates that actually exercise project/pattern generators
  and refusal behavior.

Local evidence:

- `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:100`
- `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:111`
- `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:175`
- `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:181`
- `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:205`
- `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:254`

### Habitat Command Surface

Actual Habitat CLI commands are:

```text
check
classify
fix
graph
help
hook
verify
```

`habitat generate` is not real:

```text
bun run habitat generate --help
=> exit 2, Error: Command generate not found.
```

The source code confirms `classify` reports project ownership, tags, scoped
rules, resolved targets, and unavailable targets. It does not call generator
code or exercise D13 refusal behavior.

Local evidence:

- `tools/habitat-harness/src/commands/classify.ts`
- `tools/habitat-harness/src/lib/command-engine.ts:822`
- `tools/habitat-harness/src/lib/command-engine.ts:846`
- `tools/habitat-harness/src/lib/command-engine.ts:913`
- `tools/habitat-harness/src/lib/command-engine.ts:939`

### Generator Surfaces

Habitat exposes exactly two Nx generators:

- `@internal/habitat-harness:project`
- `@internal/habitat-harness:pattern`

The project generator supports only `plugin`, `foundation`, and `app` at runtime,
while its schema still admits `adapter`, `control`, `engine`, `mod`, `sdk`,
`tooling`, and `kind:*` aliases. Unsupported kinds currently fail before writes
through a thrown `Error`, not through the full structured D13 refusal envelope.

Local evidence:

- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/src/generators/project/schema.json:15`
- `tools/habitat-harness/src/generators/project/generator.cjs:4`
- `tools/habitat-harness/src/generators/project/generator.cjs:32`
- `tools/habitat-harness/src/generators/project/generator.cjs:51`

The pattern generator writes candidate artifacts only for `candidate`, routes
registered lifecycles through manifest/baseline validation, and refuses
registered generation without `--manifestPath`.

Local evidence:

- `tools/habitat-harness/src/generators/pattern/schema.json`
- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/registration.cjs`
- `tools/habitat-harness/test/generators/pattern-generator.test.ts`
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`

### Authoring Docs Surface

Current docs already draw the desired D14 fence:

- `tools/habitat-harness/docs/SCENARIOS.md` lists supported project/pattern
  scaffolds and explicitly says MapGen recipe/domain/op/stage/step generation is
  not supported.
- `tools/habitat-harness/docs/AUTHORING-NEXT.md` describes the future authoring
  vertical slice and requires generated-diff, classify, owning package checks,
  tests, and recipe result gates.
- `tools/habitat-harness/docs/CAPABILITIES.md` states Habitat is not yet a broad
  MapGen authoring toolkit.

These docs are legitimate D14 write surfaces for fence wording and future
trigger clarification. They are not evidence that authoring commands already
exist.

## Command Evidence

### Current D14 Classify Gate

Command:

```text
bun run habitat classify mods/mod-swooper-maps/src/recipes/standard
```

Observed result: exit 0. It returns:

- `project: "mod-swooper-maps"`
- `tags: ["npm:private", "kind:mod"]`
- many in-scope structural rules, mostly workspace gates or unresolved Grit
  metadata for the broad directory
- required targets:
  - `nx run mod-swooper-maps:check`
  - `nx run mod-swooper-maps:test`
  - `bun run lint`

Interpretation: this command is real, but it is a weak D14 acceptance gate. It
proves orientation for an existing recipe directory. It does not prove that a
MapGen authoring request is refused, that D13 emits structured refusal fields,
that no MapGen authoring files are written, or that D14's early-fence language is
consumable by D13.

Recommendation: keep classify examples as explanatory orientation evidence, but
do not use this command as the primary D14 gate. If D14 needs a classify gate,
use a generated-diff or future-trigger docs example with explicit non-support
wording, matching the D14 source packet. The source packet's docs classify
example is closer to the actual D14 purpose than the current recipe-directory
classify gate.

### Real Generator/Test Gates

Commands run:

```text
bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts
=> exit 0, 3 files passed, 37 tests passed

bun run nx g @internal/habitat-harness:project d14-plugin-smoke --kind=plugin --dry-run --no-interactive
=> exit 0, CREATE packages/plugins/plugin-d14-plugin-smoke/...; NOTE dryRun means no changes were made

bun run nx g @internal/habitat-harness:project d14-mod-refusal --kind=mod --dry-run --no-interactive
=> exit 1, supports only uniform kinds: plugin, foundation, app; refusing "mod"

bun run nx g @internal/habitat-harness:pattern grit-d14-candidate --lifecycle=candidate --openspecChangeId=deep-habitat-d14-authoring-topology-fence --dry-run --no-interactive
=> exit 0, candidate pattern and manifest paths only; NOTE dryRun means no changes were made

bun run nx g @internal/habitat-harness:pattern grit-d14-advisory --lifecycle=registered-advisory --dry-run --no-interactive
=> exit 1, requires --manifestPath
```

These gates are better D14/D13 evidence because they hit the actual generator
surface. They still prove current behavior only. The unsupported `kind=mod` and
registered-pattern failures are unstructured thrown errors today, so D14 should
not claim the structured refusal envelope is implemented.

### Worktree Cleanliness

After the no-write/dry-run commands:

```text
git status --short --branch
=> ## codex/d14-authoring-topology-fence-packet
```

No generated files were persisted by dry-runs.

## Write Set For Later Implementation

D14 itself should remain a packet/docs/refusal-language lane. A later source
implementation should not add an Authoring Topology generator under D14. The
legitimate D14-adjacent write set is:

- `openspec/changes/deep-habitat-d14-authoring-topology-fence/**`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`, only
  after review status legitimately changes
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D14-*.md`
  review artifacts
- `tools/habitat-harness/docs/AUTHORING-NEXT.md`, only for future-trigger and
  acceptance-criteria clarification
- `tools/habitat-harness/docs/SCENARIOS.md`, only for unsupported authoring
  examples/refusal guidance
- `tools/habitat-harness/docs/CAPABILITIES.md`, only for current capability
  truth and non-support wording
- `tools/habitat-harness/README.md`, only if public command examples need the
  same current/future distinction

If source behavior changes are needed to make D13 refusals consume D14 language,
they belong to the D13 generator/refusal write set, not to a new D14 authoring
implementation:

- `tools/habitat-harness/src/generators/project/schema.json`
- `tools/habitat-harness/src/generators/project/generator.cjs`
- `tools/habitat-harness/test/generators/project-generator.test.ts`
- `tools/habitat-harness/src/generators/pattern/schema.json`
- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/registration.cjs`, only for
  command-facing refusal projection without weakening D8 validation
- `tools/habitat-harness/test/generators/pattern-generator.test.ts`
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`, only
  for D13/D8 boundary fixtures
- `tools/habitat-harness/generators.json`, if D0 compatibility rows authorize
  public description/help correction

D14 should explicitly say that D13 owns implementation of the generic refusal
shape and generator parsing, while D14 owns only the authoring-specific blocked
action inventory, owner/recovery wording, future acceptance criteria, and
deferral trigger.

## Protected Paths

D14 must protect these paths unless another accepted owner explicitly opens
them:

- `mods/mod-swooper-maps/src/domain/**`
- `mods/mod-swooper-maps/src/recipes/**`
- `mods/mod-swooper-maps/src/maps/generated/**`
- `packages/mapgen-core/**`
- `packages/civ7-*`
- `packages/mapgen-*`
- `.grit/patterns/habitat/checks/**`, except through D8-governed registered
  promotion work
- `tools/habitat-harness/src/rules/rules.json`, except through D8-governed
  registered promotion work
- `tools/habitat-harness/baselines/**`, except through D5/D8 authority
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`, unless D8
  requests a manifest contract change
- generated artifacts and tool outputs: `dist/**`, `mod/**`, `.nx/**`,
  `tools/habitat-harness/oclif.manifest.json`, lockfiles, `.civ7/outputs/**`,
  `packages/civ7-types/generated/**`, and
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`
- unrelated OpenSpec packets except dependency/status rows explicitly named by
  the owning remediation process

## Vendor/Native Notes

Nx is the real generator surface here; Habitat has no `generate` subcommand.
Official Nx docs support using `nx g`/`nx generate` for generators and
`--dry-run` for previewing changes without applying them:

- [Nx creating files with a generator](https://nx.dev/docs/extending-nx/creating-files)
  says to use `-d`/`--dry-run` to see changes without applying them.
- [Nx extending with plugins](https://nx.dev/docs/extending-nx/intro) shows
  testing a custom generator in dry-run mode and then removing `--dry-run` to
  actually run it.

Local command evidence matches the vendor behavior: supported project and
candidate pattern dry-runs listed `CREATE` paths and ended with `NOTE: The
"dryRun" flag means no changes were made.`

No Grit or Biome vendor behavior is needed for D14 acceptance. D14 can name
Grit/Biome as protected/downstream check surfaces, but this packet does not
touch Grit pattern semantics or Biome behavior.

## Findings

### P1: D14 Can Still Authorize Source Work Without Naming The Owning Code Path

The packet says implementation needs a concrete write set and protected paths,
but it never supplies them. It also says the expected Habitat implementation
write set is in `design.md`, which is currently false. The current tasks ask an
executor to record the write set later.

Why this blocks: D14's stop condition says the packet must not become an
implementation packet without a concrete refusal need. Without naming D13's
generator/refusal ownership, a later source agent could invent an authoring
generator, edit MapGen topology, or create new Habitat machinery while claiming
to implement D14.

Repair: add a D14 design section that explicitly separates:

- D14-owned docs/OpenSpec/fence wording;
- D13-owned generator/refusal implementation paths;
- D4-owned classify/orientation behavior;
- D12-owned verify/handoff behavior;
- protected MapGen/native/generated/rule-pack paths.

### P1: The Validation Gate Does Not Falsify The D14 Risk

`bun run habitat classify mods/mod-swooper-maps/src/recipes/standard` is real,
but it only orients an existing recipe directory. It does not test an authoring
request, refusal language, no-write behavior, or generator behavior.

Why this blocks: D14's core risk is "supported structural scaffolding/classification gets
mistaken for MapGen authoring support." A classify pass over existing MapGen
code can make that confusion worse if treated as acceptance authority.

Repair: replace the primary D14 gate with generator/refusal gates owned by D13:

- targeted generator tests for project/pattern no-write refusals;
- Nx generator dry-runs for supported project and candidate pattern paths;
- nonzero dry-runs for unsupported `mod`/authoring-shaped requests;
- an injected bad-case test or fixture that asks for recipe/domain/op/stage/step
  topology and expects D14-owned refusal language with empty write set;
- OpenSpec validation and clean-worktree checks.

Classify should remain an explanatory non-support example or future generated
diff orientation gate, not the acceptance oracle.

### P2: D14 Does Not Define The Unsupported Authoring Action Inventory

The source packet requires explicit unsupported authoring actions. The D13
design lists recipe/domain/op/stage/step/contract/default/schema/registry/Studio
requests, but D14 currently does not import that as its own blocked-action
inventory.

Why this matters: D13 cannot implement authoring-specific refusal wording
without D14-owned blocked actions. If D13 fills this in locally, D14 authority is
recreated in the wrong packet.

Repair: add a D14-owned inventory covering at least:

- generate a MapGen recipe;
- generate a MapGen domain;
- generate a domain operation;
- generate a recipe stage;
- generate a recipe step;
- create/update step contract/default/schema bundles;
- update recipe stage order or domain operation registries;
- update Studio recipe artifacts.

Each row should include refused action, owning future authority, recovery
instruction, retry condition, write set empty, and non-claim.

### P2: D14 Does Not Tie Future Acceptance Criteria To Existing Authoring Docs

`tools/habitat-harness/docs/AUTHORING-NEXT.md` already has a concrete future
vertical slice and generator acceptance contract. D14 currently says "record
trigger conditions" but does not bind to those criteria.

Why this matters: vague future triggers let implementation agents start with
generic generator machinery instead of a MapGen topology investigation and
end-to-end acceptance loop.

Repair: cite the existing authoring docs and require future authoring work to
start from current MapGen conventions plus generated-diff, classify, package
check/test, and recipe compilation result. D14 should keep that as future
acceptance criteria, not current implementation scope.

### P2: Current Refusal Behavior Is No-Write But Not The Structured D13 Envelope

Current generator failures are thrown errors. The project generator refuses
unsupported `kind=mod` before writes; pattern registered generation refuses
without `--manifestPath`. That is useful present behavior, but it does not meet
D13's full refusal contract.

Why this matters: D14 should not state or imply that command-facing D14-owned
refusals are implemented. It can only specify the early-fence language D13 must
consume.

Repair: D14 should require D13 implementation tests to assert the structured
fields after D13 is implemented. Before that, D14 should phrase current evidence
as "present no-write thrown-error behavior," not accepted refusal-envelope
behavior.

### P3: The Packet Should Avoid Absolute Current-Worktree Paths In Durable Body Text

The current D14 proposal authority section embeds the active worktree absolute
paths. The packet index says path variables live in remediation context and
source-prep paths are provenance only.

Repair: use repo-relative paths or `$REMEDIATION_DIR`/`$PHASE2_PACKET_DIR`
variables in durable packet text, especially for executable command context.
Scratch artifacts may include absolute paths for evidence provenance.

## Acceptance Recommendation

Do not advance D14 yet. The correct status remains:

```text
incomplete packet; global constraints applied; per-domino adversarial gate BLOCKING
```

D14 can become acceptable for design/specification after it:

1. Names D14's actual write set as docs/OpenSpec/fence language only.
2. Names D13's generator/refusal write set as the only legitimate future source
   implementation path for authoring-topology refusals.
3. Protects MapGen topology, generated outputs, active rule-pack, baselines, and
   unrelated packets.
4. Replaces the current recipe-directory classify gate with falsifying D13/Nx
   generator/refusal gates and keeps classify as orientation/non-support
   evidence only.
5. Defines the blocked authoring action inventory, future acceptance criteria,
   owner/recovery wording, and no-write/non-claim examples D13 can consume.

Skills used: domain-design, information-design, solution-design,
civ7-open-spec-workstream, typescript-refactoring.
