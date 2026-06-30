# D13 Code/Vendor Topology Investigation

Fresh D13 investigator pass from worktree
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
on branch `codex/d13-scaffolding-refusal-packet`.

## Evidence Read

- Required skills read in full: Domain Design, Information Design, Solution Design, TypeScript Refactoring, and the requested TypeScript refactoring references.
- Repo/OpenSpec routers read: root `AGENTS.md`, remediation frame, remediation context, packet index, source D13 packet, live D13 OpenSpec packet, and G-HOST packet enough to classify the host dependency.
- Code/tests read: `tools/habitat-harness/generators.json`, project generator schema/implementation/tests, pattern generator schema/implementation/registration/tests, Pattern Authority Manifest validator/tests, command/export surfaces, Habitat generator docs, `.habitat/grit.yaml`, and `biome.json`.
- Vendor docs consulted:
  - Nx local generators and schema properties: https://nx.dev/docs/extending-nx/local-generators
  - Nx generator file creation and dry-run mechanics: https://nx.dev/docs/extending-nx/creating-files
  - Nx generator file modification cautions: https://nx.dev/docs/extending-nx/modifying-files
  - Grit authoring/testing/configuration: https://docs.grit.io/guides/authoring, https://docs.grit.io/guides/testing, https://docs.grit.io/guides/config
  - Biome CLI/configuration: https://biomejs.dev/reference/cli/, https://biomejs.dev/reference/configuration/

Commands run:

| Command | Result | D13 meaning |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | exit 0, 37 tests passed | Current generator and manifest tests pass. |
| `bun run habitat generate --help` | exit 2, `Command generate not found.` | Live D13 validation gate is invalid. |
| `bun run nx g @internal/habitat-harness:project habitat-scratch --kind=plugin --dry-run --no-interactive` | exit 0, dry-run CREATE list, no writes | Supported project command path is real. |
| `bun run nx g @internal/habitat-harness:project unsupported-scratch --kind=mod --dry-run --no-interactive` | exit 1, Habitat runtime refusal | Schema admits `mod`; generator refuses before writes. |
| `bun run nx g @internal/habitat-harness:project unsupported-scratch --kind=host-specific --dry-run --no-interactive` | exit 1, Nx schema enum rejection | This does not exercise Habitat refusal code. |
| `bun run nx g @internal/habitat-harness:pattern grit-d13-scratch --dry-run --no-interactive` | exit 0, candidate dry-run CREATE list | Candidate generation path is real and non-active. |
| `bun run nx g @internal/habitat-harness:pattern grit-d13-scratch --lifecycle=registered-advisory --dry-run --no-interactive` | exit 1, requires `--manifestPath` | Registered promotion refusal path is real. |
| `git status --short` | clean before scratch write | No source/package/generated files were changed by probes. |

## 1. Current Code Topology Map For D13 Surfaces

### Nx generator registration

`tools/habitat-harness/package.json` exposes the package generator manifest through `"generators": "./generators.json"` and includes generator source in package files (`tools/habitat-harness/package.json:11`, `:13-23`). `tools/habitat-harness/generators.json:5-15` registers exactly two generators:

- `project`: factory `./src/generators/project/generator.cjs#projectGenerator`, schema `./src/generators/project/schema.json`, description "Scaffold a Habitat-conformant workspace project for supported uniform kinds."
- `pattern`: factory `./src/generators/pattern/generator.cjs#patternGenerator`, schema `./src/generators/pattern/schema.json`, description "Scaffold a Habitat Grit pattern and matching rule-pack entry."

There is no Habitat oclif `generate` command. Current oclif commands under `tools/habitat-harness/src/commands` are `check`, `classify`, `fix`, `graph`, `hook`, and `verify`; the live command probe confirms `bun run habitat generate --help` fails.

### Project generator

Project generator support is narrower than its schema:

- Runtime support is only `plugin`, `foundation`, and `app` in `PROJECT_KIND_CONTRACTS` (`tools/habitat-harness/src/generators/project/generator.cjs:4-20`) and `SUPPORTED_KINDS` (`:22`).
- Runtime refusal happens in `normalizeOptions` after stripping an optional `kind:` prefix (`:51-57`).
- Runtime root/package checks refuse mismatched roots and package names before writes (`:59-76`).
- Non-empty root and package-name collision checks also happen before writes (`:32-42`).
- Writes are fixed to `package.json`, `tsconfig.json`, `src/index.ts`, `test/index.test.ts`, and `README.md` under the computed canonical root (`:44-48`).

Current no-unsupported-write assessment:

- Supported `plugin`, `foundation`, and `app` write only under `packages/plugins/plugin-<name>`, `packages/<name>`, and `apps/<name>` respectively (`generator.cjs:4-19`).
- `directory` is normalized, but it must equal the expected root before writes (`:63-70`), so it is not currently an arbitrary write escape.
- `packageName` must equal the expected name before writes (`:72-76`).
- `name` is slugified and cannot be empty (`:146-154`).

Hidden coupling:

- The schema advertises `adapter`, `control`, `engine`, `mod`, `sdk`, and `tooling` as enum choices (`tools/habitat-harness/src/generators/project/schema.json:18-37`) even though runtime refuses them. This may be an intentional "schema-accepted refusal" design, but D13 must state that explicitly or remove unsupported choices from the schema.
- Package names still use the repo's current `@civ7` scope for generated packages (`generator.cjs:8`, `:13`, `:18`). D13 should treat this as current repo convention evidence, not a generic Habitat target semantic.

### Pattern generator and Pattern Governance

Candidate lifecycle:

- Default lifecycle is `candidate` (`tools/habitat-harness/src/generators/pattern/schema.json:24-29`; `generator.cjs:32`).
- Candidate generation refuses active pattern, active rule, active baseline, existing candidate pattern, and existing candidate manifest before candidate writes (`generator.cjs:5`, `:12-20`, `:76-91`).
- Candidate writes are fixed under `tools/habitat-harness/src/rules/pattern-authority/candidates` (`:93-99`), specifically one markdown pattern draft and one candidate manifest JSON (`:22-23`).
- Candidate manifest explicitly says `registration.accepted: false` and lists required registration inputs (`:101-130`).

Registered lifecycle:

- `registered-advisory` and `registered-enforced` route into `promoteRegisteredPattern` (`generator.cjs:7-10`, `:59-74`).
- Promotion requires `--manifestPath` (`registration.cjs:35-37`), validates a Pattern Authority Manifest with matching rule reference (`:39-62`), validates baseline contract and introduction manifest (`:64-65`, `:148-224`), refuses collisions (`:67-85`), then writes active `.habitat/patterns/active/checks/<pattern>.md` and updates `tools/habitat-harness/src/rules/rules.json` (`:87-95`).
- Hook scope is admitted only through manifest/invocation agreement (`registration.cjs:49-50`, `:122`; manifest validator checks at `manifest.ts:597-645`, `:741-756`).

Pattern Authority Manifest:

- Candidate and registered manifests are a discriminated union by lifecycle (`manifest.ts:5`, `:67-126`).
- The validator rejects Grit frontmatter/prose as Habitat authority (`manifest.ts:250-257`, `:936-940`) and Nx generator options as authority (`:258-265`, `:942-954`).
- Placeholder fragments include generated scaffold language (`:188-202`) and are rejected in base/registered fields (`:336-339`, `:388-418`, `:888-903`).

Hidden coupling:

- `generators.json` still describes the pattern generator as "Scaffold a Habitat Grit pattern and matching rule-pack entry" (`tools/habitat-harness/generators.json:11-15`). That is stale for candidate default behavior and ambiguous for D13 because candidate generation deliberately does not write a rule-pack entry.
- D13 source says Pattern Governance owns registration, not candidate file writing (`docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:19-23`), but current `patternGenerator` owns both candidate file writing and registered promotion code. D13 must either keep registered promotion in D8-owned protected paths or state the exact D13/D8 split.

### Docs and command-facing surfaces

Existing durable docs already state:

- Habitat exposes exactly two Nx generators (`tools/habitat-harness/docs/CAPABILITIES.md:189-193`).
- Project generator supports only foundation/plugin/app and refuses non-uniform kinds, mismatched roots/package names, non-empty roots, and collisions (`CAPABILITIES.md:194-218`).
- Pattern candidate output is non-active and registered lifecycle requires manifest/baseline governance (`CAPABILITIES.md:219-238`).
- Scenario docs list supported project scaffolding and unsupported MapGen recipe/domain/stage/step authoring (`tools/habitat-harness/docs/SCENARIOS.md:95-120`, `:260-277`).
- `AUTHORING-NEXT.md` frames MapGen authoring as future work and requires an executable vertical slice before accepting authoring generator claims (`tools/habitat-harness/docs/AUTHORING-NEXT.md:24-35`, `:60-71`, `:91-109`).

These docs are better grounded than the current D13 OpenSpec scaffold. Later D13 implementation should update them only when the generator/refusal contract actually changes.

## 2. Official Vendor Constraints And D13 Design Impact

### Nx

Nx generator mechanics matter because D13 is not free to invent a parallel Habitat generator command unless it is explicitly added as a command surface.

- Nx local generators are invoked through `nx generate <plugin>:<generator> ...`; the plugin package name is the command namespace. That maps directly to this repo's `@internal/habitat-harness` package name.
- Nx `schema.json` describes available options, validation, and defaults. Standard JSON Schema fields such as `enum`, `default`, `description`, and Nx-specific `$default` directly affect CLI validation, prompting, and Nx Console rendering.
- Nx generators manipulate an abstract tree and can create, update, move, or delete files. The dry-run flag previews changes without applying them.
- Nx's own docs warn that modifying existing files is harder than creating files; JSON updates are safer than string replacement, and AST-aware changes are safer for TypeScript.

D13 implications:

- Generator schemas are public/durable surfaces and need D0 rows before changes.
- If unsupported kinds stay in the schema enum, D13 must treat "schema-admitted but runtime-refused" as an intentional public refusal surface with tests.
- If `host-specific` is supposed to prove a host refusal, it must either be schema-admitted deliberately or replaced by a schema-admitted unsupported kind such as `mod`; otherwise Nx rejects it before Habitat code runs.
- Dry-run proofs must use `bun run nx g ... --dry-run --no-interactive` from the repo root, not `habitat generate`.

### Grit

Official Grit docs recommend authoring patterns in `.md` files under `.grit/patterns`; Markdown pattern files combine documentation, GritQL, and source examples. Grit uses the file name as the pattern name, the first heading as title, the first non-heading paragraph as description, and the first fenced code block as the GritQL body. Grit configuration lives in `.habitat/grit.yaml`; by default, `.grit/patterns` patterns are imported, and explicit `patterns` entries can import other files.

D13 implications:

- Candidate artifacts under `tools/habitat-harness/src/rules/pattern-authority/candidates` are intentionally not active Grit patterns by official import mechanics and current `.habitat/grit.yaml` (`patterns: []`).
- Active registration writes under `.habitat/patterns/active/checks` are not "just scaffolding"; they enter the Grit pattern loading surface and therefore belong behind Pattern Authority/D8 gates.
- Grit frontmatter, Markdown prose, and generated pattern files must remain proof/example material, not Habitat authority. The manifest validator already encodes this.

### Biome

Biome's official CLI exposes `check`/`ci` as formatter, linter, and import-sorting gates. Repo `biome.json` excludes generated/protected zones such as `dist`, `mod`, `.nx`, `.civ7/outputs`, `mods/mod-swooper-maps/src/maps/generated`, `packages/civ7-types/generated`, and `packages/civ7-map-policy/src/civ7-tables.gen.ts` (`biome.json:8-26`).

D13 implications:

- Biome can be a formatting/hygiene validation gate after source edits, but it does not prove generator refusal semantics.
- D13 must not hand-edit generated outputs or treat Biome exclusions as permission to write protected/generated paths.

## 3. Public/Durable Surfaces Needing D0 Compatibility Rows

D0 currently defines the required matrix artifact and row schema, but `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` does not exist in this worktree. The D0 spec requires later packets to stop before changing a generator surface without a D0 row (`openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md:22-27`). D0 design requires generator/migration rows for name, schema, factory, and refusal surface (`openspec/changes/deep-habitat-d0-command-surface-inventory/design.md:233-234`, `:280-283`).

D13 should require at least these D0 row categories before implementation:

| Surface | Plane/facet | Current source |
| --- | --- | --- |
| `@internal/habitat-harness:project` generator name | generator/name | `tools/habitat-harness/generators.json:6-10` |
| Project generator schema | generator/schema | `tools/habitat-harness/src/generators/project/schema.json` |
| Project generator factory | generator/factory | `tools/habitat-harness/src/generators/project/generator.cjs` |
| Project unsupported-kind refusal | generator/refusal | `project/generator.cjs:51-57`; tests `project-generator.test.ts:90-99` |
| Project mismatched root/package/collision refusals | generator/refusal | `project/generator.cjs:32-42`, `:66-76`; tests `:101-158` |
| `@internal/habitat-harness:pattern` generator name | generator/name | `generators.json:11-15` |
| Pattern generator schema/lifecycle options | generator/schema | `pattern/schema.json:24-44` |
| Pattern candidate factory writes | generator/factory/refusal | `pattern/generator.cjs:3-24`, `:76-99` |
| Pattern registered promotion/refusal | generator/factory/refusal | `pattern/registration.cjs:32-103`; tests `pattern-generator.test.ts:57-237` |
| Pattern Authority Manifest validator exports | package-export and generator governance dependency | `tools/habitat-harness/src/index.ts:117-133`; `manifest.ts` |
| Generator public docs/examples | docs-example | `CAPABILITIES.md:189-238`, `SCENARIOS.md:95-153`, `README.md:101-131` |
| Root script/Nx command invocation examples | root-script/docs-example | root `package.json:65-67`, docs examples using `nx g` |
| Nonexistent `habitat generate` help gate | cli/docs-example/refused | D13 packet currently names it; command probe fails |

Compatibility handling likely needed:

- Preserve or version `@internal/habitat-harness:project` and `@internal/habitat-harness:pattern` command names.
- Refuse unsupported project kinds explicitly.
- Document-only for docs examples that merely demonstrate current command forms.
- Generated-only for Nx/Nx Console derived help or dry-run output if inventoried.

## 4. Proposed Write Set / Protected Paths For Later Implementation

This investigation edited only this scratch file. Later D13 implementation should use a narrow write set.

Proposed D13 write set:

- `tools/habitat-harness/src/generators/project/schema.json`
- `tools/habitat-harness/src/generators/project/generator.cjs`
- `tools/habitat-harness/test/generators/project-generator.test.ts`
- `tools/habitat-harness/src/generators/pattern/schema.json`
- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/registration.cjs` only if D13 explicitly owns command-facing refusal text around registered lifecycle; otherwise leave to D8.
- `tools/habitat-harness/test/generators/pattern-generator.test.ts`
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts` only for D13/D8 boundary tests about Nx options not being authority.
- `tools/habitat-harness/generators.json` only if descriptions change to remove stale "matching rule-pack entry" language.
- `tools/habitat-harness/docs/CAPABILITIES.md`
- `tools/habitat-harness/docs/SCENARIOS.md`
- `tools/habitat-harness/README.md`
- `tools/habitat-harness/docs/AUTHORING-NEXT.md` only for authoring refusal clarification, not new authoring design.
- D13 OpenSpec/workstream files and D0 matrix rows only in the owning D13/D0 implementation phase.

Protected paths unless a later accepted owner expands scope:

- `.habitat/patterns/active/checks/**` except through registered promotion tests or D8 implementation.
- `tools/habitat-harness/src/rules/rules.json` except through registered promotion tests or D8 implementation.
- `tools/habitat-harness/baselines/**` except through D5/D8 baseline authority.
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` unless D8 explicitly requests a manifest contract change.
- `mods/**`, `packages/civ7-*`, `packages/mapgen-*`, and MapGen authoring topology paths; D13 is generic Habitat.
- Generated artifacts: `dist/**`, `mod/**`, `tools/habitat-harness/oclif.manifest.json`, `.nx/**`, `.civ7/outputs/**`, `mods/mod-swooper-maps/src/maps/generated/**`, `packages/civ7-types/generated/**`, `packages/civ7-map-policy/src/civ7-tables.gen.ts`.
- Lockfiles and package dependency manifests unless D13 explicitly adds/removes a dependency, which current evidence does not require.
- Packet index except through the remediation owner after D13 review acceptance.

## 5. Validation Gates Tied To Actual Code Paths And Vendor Mechanics

Replace the current D13 gate set with falsifying gates that hit the actual Nx surfaces:

| Gate | Expected result | Proves | Non-claim |
| --- | --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | exit 0 | Unit coverage for project refusals, pattern candidate/registered separation, and manifest authority checks. | Does not prove live Nx CLI schema behavior unless paired with dry-runs. |
| `bun run nx g @internal/habitat-harness:project habitat-scratch --kind=plugin --dry-run --no-interactive` | exit 0, CREATE list, dry-run note | Nx can resolve generator and supported project writes are previewed without mutation. | Does not prove generated project builds unless live-generation discovery test runs. |
| `bun run nx g @internal/habitat-harness:project unsupported-scratch --kind=mod --dry-run --no-interactive` | nonzero with Habitat runtime refusal | A schema-admitted unsupported kind reaches Habitat refusal before writes. | Does not prove host-policy refusal. |
| `bun run nx g @internal/habitat-harness:project unsupported-scratch --kind=host-specific --dry-run --no-interactive` | current expected nonzero Nx schema rejection | Current source packet bad case does not exercise Habitat refusal. Keep only as schema-rejection evidence unless D13 adds this enum deliberately. | Does not prove D13 refusal DTO/message. |
| `bun run nx g @internal/habitat-harness:pattern grit-d13-scratch --dry-run --no-interactive` | exit 0, candidate paths under `pattern-authority/candidates` | Candidate generation path is non-active and does not write `.grit`, `rules.json`, or baseline. | Does not prove rule registration. |
| `bun run nx g @internal/habitat-harness:pattern grit-d13-scratch --lifecycle=registered-advisory --dry-run --no-interactive` | nonzero requires `--manifestPath` | Registered lifecycle refuses without manifest before writes. | Does not prove accepted manifest promotion. |
| Accepted-manifest registered promotion fixture in `pattern-generator.test.ts` | exit 0 in unit tests | D8/Pattern Authority path writes active `.grit` and `rules.json` only after manifest/baseline contract. | Does not make D13 the owner of Pattern Governance. |
| `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict` | exit 0 after packet repair | OpenSpec shape. | Does not prove generator source behavior. |
| `bun run openspec:validate` | exit 0 | Cross-OpenSpec shape. | Does not prove source behavior or D0 row completeness. |
| `git diff --check` | exit 0 | Whitespace sanity. | Does not prove semantic correctness. |

Drop or replace:

- `bun run habitat generate --help` because the command does not exist.
- Any gate that relies only on `host-specific` while that value is absent from the project generator schema enum.
- Any Grit command claiming candidate patterns are active; official Grit mechanics load `.grit/patterns` and configured patterns, while candidates are outside that path.

## 6. P1/P2 Findings Against Current Packet

### P1: D13 is still a scaffold packet and cannot authorize implementation.

The packet index marks D13 as incomplete and blocking (`docs/projects/habitat-harness/openspec-remediation/packet-index.md:33`, review semantics at `:37-49`). The D13 review ledger has a P1 blocking row requiring fresh per-domino reviews before packet acceptance or source edits (`openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/review-disposition-ledger.md:10`). The D13 design says implementation needs a concrete write set and protected path list (`openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:45-53`), but the phase record only lists generic validation gates and no write set (`workstream/phase-record.md:22-28`), while tasks still say "Define supported scaffold contracts" and "Consume host policy" rather than naming the contract (`tasks.md:14-16`).

Repair: add the concrete D13 contract, D0 row requirements, write set/protected paths, and packet-specific review dispositions before any source implementation proceeds.

### P1: D13 validation references a nonexistent Habitat command.

`proposal.md:73-78`, `tasks.md:20-24`, and `workstream/phase-record.md:22-28` require `bun run habitat generate --help`. The current oclif command set has no `generate` command, and the live probe returned exit 2 with `Command generate not found.`

Repair: replace with Nx generator gates such as `bun run nx g @internal/habitat-harness:project ... --dry-run --no-interactive` and `bun run nx g @internal/habitat-harness:pattern ... --dry-run --no-interactive`.

### P1: D13 depends on G-HOST for host-specific refusal but G-HOST is still incomplete.

D13 requires G-HOST (`proposal.md:37-42`) and says it will consume host policy for host-specific generator refusals (`proposal.md:27-30`; `design.md:22-27`). The packet index marks G-HOST incomplete/blocking (`packet-index.md:28`) and says G-HOST must resolve host-policy boundaries before D13 can claim generic closure (`packet-index.md:51-61`). G-HOST itself says it gates D13 generic closure on host-policy separation (`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:25-30`, `:42-47`) and defines host-policy absence refusal only at scaffold level (`specs/habitat-harness/spec.md:11-13`).

Repair: D13 may define the generic refusal shape and the way it consumes host-policy facts, but it must not invent host-specific policy semantics or close host-specific refusal until G-HOST is accepted.

### P2: Project generator schema and runtime refusal semantics are mismatched and need an explicit D13 decision.

The schema lists unsupported non-uniform kinds as enum values (`tools/habitat-harness/src/generators/project/schema.json:18-37`), but runtime supports only `plugin`, `foundation`, and `app` (`tools/habitat-harness/src/generators/project/generator.cjs:4-22`) and refuses all other enum-admitted kinds (`:51-57`). Nx vendor docs make `schema.json` option metadata part of CLI validation/prompting, so this is a public contract mismatch unless D13 intentionally models "schema-admitted refusal" as the contract.

Repair: either narrow the enum to supported kinds and document unsupported inputs as schema rejection, or keep unsupported enum values and specify runtime refusal DTO/message compatibility rows and tests for each refused kind.

### P2: The source packet's `host-specific` dry-run bad case does not reach Habitat refusal code.

The source D13 packet requires a bad case using `--kind=host-specific` (`docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:130-134`). Current project schema does not include `host-specific` (`tools/habitat-harness/src/generators/project/schema.json:18-37`), and the live dry-run fails in Nx schema validation before generator code executes. That proves only Nx schema rejection, not D13's refusal DTO/message, owner, recovery guidance, or no-write behavior.

Repair: use schema-admitted unsupported kinds such as `mod` for current runtime-refusal proof, or deliberately add a host-specific enum/request type after G-HOST defines the host boundary.

### P2: Pattern generator description and ownership language blur candidate generation with registered enforcement.

`tools/habitat-harness/generators.json:11-15` describes `pattern` as scaffolding a Grit pattern and matching rule-pack entry. Current default candidate generation writes only candidate artifacts and explicitly does not register a rule (`tools/habitat-harness/src/generators/pattern/generator.cjs:12-24`, `:101-130`; test `pattern-generator.test.ts:20-55`). Registered promotion writes active `.grit` and `rules.json` only after manifest/baseline checks (`registration.cjs:32-103`). D13 source correctly says Pattern Governance owns registration (`D13-scaffolding-and-refusal-contracts.md:19-23`), but the live packet does not spell the D13/D8 boundary beyond generic "Separate project scaffolding from Pattern Governance candidate generation" (`openspec/.../design.md:24-26`).

Repair: update the D13 packet to require generator description cleanup and D0 rows for candidate generation, registered lifecycle refusal, and registered promotion handoff. Treat active `.grit`/`rules.json` writes as D8-owned unless D8 explicitly delegates command-facing refusal text to D13.

### P2: D13 still carries legacy validation-vocabulary debt from the source packet.

The remediation frame treats legacy validation-artifact-shaped product concepts as suspect unless a concrete Habitat workflow needs them (`docs/projects/habitat-harness/openspec-remediation-frame.md:55-80`). The source D13 packet asks for a refusal DTO with a validation category (`D13-scaffolding-and-refusal-contracts.md:60-64`) and has a validation section (`:85-99`). The live D13 design says to prefer terms like diagnostics, refusals, recovery instructions, command outcomes, and handoff records (`openspec/.../design.md:34-43`), but it does not define the actual refusal shape.

Repair: define a refusal shape with fields such as `action`, `reason`, `owner`, `recovery_instruction`, `non_claims`, and optional `command_outcome`; do not include `proof_class` unless a D0 row and D13 design explicitly preserve it for compatibility.

### P2: Remediation context branch fixture changed during investigation.

At read time, the context fixture said `$ACTIVE_REMEDIATION_BRANCH` was `codex/d12-verify-handoff-packet` (`docs/projects/habitat-harness/openspec-remediation/context.md:13-17`), but this investigation worktree is on `codex/d13-scaffolding-refusal-packet`. After this scratch file was written, the worktree showed an unrelated uncommitted change to `context.md` that appears to move the fixture toward D13. The context file instructs packet artifacts to use those variables instead of repeating local paths (`context.md:3-5`, `:268-277`).

Repair: coordinate with the remediation owner so final D13 packet artifacts cite only the accepted context fixture, not a transient stale read or another agent's uncommitted update.

## Bottom Line

D13 should be grounded as a composition packet over two real Nx generators, not as a new Habitat generator command. The safe target is:

1. Project generator: supported `plugin`/`foundation`/`app` writes and explicit pre-write refusals for all non-uniform kinds.
2. Pattern generator: candidate-only generation is D13 scaffolding; registered promotion remains Pattern Governance/D8-owned and manifest-gated.
3. Host-specific refusal: D13 consumes G-HOST declarations but does not invent host semantics.
4. Public compatibility: D13 source changes must cite D0 rows for generator names, schemas, factories, refusal surfaces, docs examples, and any generated/derived command help.

Skills used: domain-design, information-design, solution-design, typescript-refactoring, civ7-open-spec-workstream.
