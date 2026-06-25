# D8 Final Code / Vendor Topology Rereview

Status: ACCEPTED FOR DESIGN/SPECIFICATION ONLY

No unresolved P1/P2 code, vendor, public-surface, write-path, protected-path,
stale-output, or validation-gate blockers remain in the repaired D8 Pattern
Governance packet. This acceptance is limited to design/specification review.
It does not authorize source refactor implementation, does not mark D8
implementation-complete, and does not override the packet's source blockers for
D0, D1, D2, D5, D6, D7, D10/G-HOST, D9, D11, and D13 inputs.

## Scope

Reviewed:

- `openspec/changes/deep-habitat-d8-pattern-governance/**`.
- D8 first-wave and final scratch records under
  `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-*.md`.
- Current Pattern Authority, generator, registry, Grit, baseline, command,
  hook, apply, plugin, and public-doc topology:
  - `tools/habitat/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat/src/generators/pattern/generator.cjs`
  - `tools/habitat/src/generators/pattern/registration.cjs`
  - `tools/habitat/src/generators/pattern/schema.json`
  - `tools/habitat/generators.json`
  - `tools/habitat/src/rules/architecture.ts`
  - `tools/habitat/src/rules/rules.json`
  - `tools/habitat/src/plugin.js`
  - `tools/habitat/src/lib/grit.ts`
  - `tools/habitat/src/lib/baseline.ts`
  - `tools/habitat/src/lib/command-engine.ts`
  - `tools/habitat/src/lib/hooks.ts`
  - `tools/habitat/src/lib/grit-apply.ts`
  - `.habitat/patterns/active/checks/**`
  - `.habitat/patterns/active/apply/**`
  - `tools/habitat/baselines/**`
  - `tools/habitat/README.md`
  - `tools/habitat/docs/CAPABILITIES.md`
  - `tools/habitat/docs/SCENARIOS.md`

Skill anchors read before review:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
- `.agents/skills/civ7-systematic-workstream/SKILL.md`

Official vendor docs consulted where vendor behavior matters:

- Grit CLI Reference: https://docs.grit.io/cli/reference
- Grit Authoring Guide: https://docs.grit.io/guides/authoring
- Biome CLI Reference: https://biomejs.dev/reference/cli/
- Nx Local Generators: https://nx.dev/docs/extending-nx/local-generators
- Nx Project Graph Plugins: https://nx.dev/docs/extending-nx/project-graph-plugins

## Review Result

The repaired packet now maps actual topology well enough for a later
implementation agent to proceed without deciding topology, vendor ownership,
public surfaces, write paths, protected paths, stale outputs, or validation
gates while editing source.

The key repair is that current source is explicitly treated as present-state
evidence, not target authority. `proposal.md:11` says the current source has
useful Pattern Authority behavior but the D8 packet must decide the target
domain model before source implementation resumes. `design.md:15` then
characterizes the real source topology: three current lifecycle strings,
candidate generation, registered promotion, active rules without
`manifestPath`, and incomplete test coverage. That matches current source:

- `manifest.ts:5` exposes only `candidate`, `registered-advisory`, and
  `registered-enforced`.
- `manifest.ts:176` returns a broad validation result with a whole manifest and
  `authorityAccepted`.
- `generator.cjs:7` branches registered promotion from candidate generation by
  string lifecycle.
- `registration.cjs:87` writes active Grit check files and `rules.json` after
  manifest and baseline checks.
- `architecture.ts:16` keeps `manifestPath`, `gritPattern`, `hookScope`, and
  other rule fields optional on a broad `HarnessRule`.
- `plugin.js:213` maps all `grit-check` rules to the canonical Grit catalog
  target without Pattern Authority lifecycle discrimination.

The packet no longer asks source implementation to infer target behavior from
those facts. `design.md:83` defines the target state family; `design.md:99`
classifies current terms as compatibility projections or adjacent-owner facts;
`design.md:168` gives the target discriminated state model; and `tasks.md:38`
turns that into an implementation sequence.

## Topology Assessment

### Source Topology

Accepted. The packet maps the current Pattern Authority and generator topology
accurately enough for design/specification acceptance.

Current disk inventory observed during rereview:

- 52 Habitat rules in `tools/habitat/src/rules/rules.json`.
- 32 `ownerTool: "grit-check"` rules, 31 enforced and one advisory.
- 31 `grit-check` rules with `hookScope: "pre-commit"`.
- 0 active rules with `manifestPath`.
- 32 check patterns under `.habitat/patterns/active/checks`.
- 3 apply patterns under `.habitat/patterns/active/apply`.
- 0 committed candidate files under
  `tools/habitat/src/rules/pattern-authority/candidates`.
- 0 committed registered Pattern Authority JSON manifests under
  `tools/habitat/src/rules/pattern-authority/*.json`.

The repaired packet accounts for the most important topology risk: existing
active Grit rules without `manifestPath` are compatibility facts, not complete
D8 admissions. That is stated in `design.md:30`, `proposal.md:130`, and
`design.md:281`.

### Vendor Ownership

Accepted. `design.md:65` maps vendor ownership cleanly:

- Grit owns GritQL syntax, Markdown pattern conventions, native pattern samples,
  `grit check`, and `grit apply`.
- Biome owns formatter, linter, import sorting, and `biome ci` behavior.
- Nx owns generator mechanics, schema/default handling, project graph plugins,
  inferred tasks, and task execution.

This matches official docs: Grit documents separate `check`, `apply`, and
`patterns test` commands, and its authoring guide defines Markdown pattern
file/frontmatter conventions; Biome's CLI distinguishes safe write flags from
CI/read-only use; Nx local generator docs make `schema.json` and generator
entrypoints the generator option surface, and Nx project graph plugins own graph
and inferred-task mechanics. The D8 packet correctly keeps Habitat admission
outside these vendor-owned semantics.

### Public Surfaces

Accepted. `proposal.md:96` lists the D8-adjacent public/durable surfaces:
pattern generator schema/options/messages/output, candidate and registered
manifest JSON, validation issue names, package exports, `rules.json`, active
Grit paths, baseline references, command output, docs, examples, and guidance.
`proposal.md:98` blocks source implementation until concrete D0 rows exist for
touched surfaces, and `tasks.md:10`/`tasks.md:12` make D0/D1 checks explicit
pre-source tasks.

The current `tools/habitat/generators.json:14` description still says
the pattern generator creates a Grit pattern and matching rule-pack entry,
while candidate generation is candidate-only. That is not a D8 P1/P2 blocker
because the repaired packet already treats generator public wording as a
D0/D13-gated surface before source changes. It should remain visible during
implementation as a P3 public-guidance cleanup if that surface is touched.

### Write Set And Protected Paths

Accepted. `design.md:200` names the later source write set and the conditional
rule-registry/Grit write paths. `design.md:232` protects baselines, existing
Grit checks, apply patterns, Grit config, command engine, hooks, Grit adapter,
Grit apply, baseline library, plugin/Nx graph config, product roots, generated
artifacts, lockfiles, `.civ7`, and vendor caches.

The write set now prevents the earlier implementation hazard where D8 could
silently mutate D5 baselines, D6 Grit acquisition/projection, D7 command
engine/reporting, D9 apply transactions, D11 hooks, D3/Nx graph, or product
source while claiming Pattern Governance work.

### Stale Outputs And Guidance

Accepted with P3 residuals. Current docs have stale counts:
`tools/habitat/docs/CAPABILITIES.md:81` says 51 registered rules,
`CAPABILITIES.md:86` says 31 `grit-check` rules, and
`CAPABILITIES.md:131` says 31 check patterns. Current disk has 52 rules, 32
`grit-check` rules, and 32 check patterns. The repaired downstream ledger
handles this correctly: `downstream-realignment-ledger.md:22` says docs/examples
update only for public guidance changes and stale current counts are not D8
topology authority.

This is acceptable for design/specification acceptance because the stale counts
are not used as D8 admission truth, the packet blocks public guidance changes
behind D0 rows, and implementation validation must characterize current
registry/catalog state before semantic migration (`tasks.md:25`).

### Validation Gates

Accepted. The packet separates design-time gates from later implementation
gates:

- `design.md:251` and `phase-record.md:54` define design-time OpenSpec,
  wording, final rereview, and diff-hygiene gates with non-claims.
- `design.md:263`, `phase-record.md:64`, and `tasks.md:101` define later
  implementation gates for manifest/generator tests, D8 state/projection tests,
  diagnostic-without-apply tests, projection-only consumers, D5
  `baseline-integrity`, native Grit sample tests for touched files, classify
  observations, and stack/worktree hygiene.

Commands run from
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`:

| Gate | Result | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` | Passed: `Change 'deep-habitat-d8-pattern-governance' is valid`. | OpenSpec shape only. |
| `bun run openspec:validate` | Passed: 249 items passed, 0 failed. | Full OpenSpec corpus shape only. |
| `git diff --check` | Passed with no output. | Diff hygiene only. |
| Complete-standard wording audit | No active reduced-standard guidance found in the repaired D8 packet, D8 scratch, or packet index beyond the canonical D13 packet title/slug classified by the closure record as exact traceability text rather than D8 guidance. | Historical scratch remains negative-control input. |

## Residual P3 Notes

- P3: `tools/habitat/docs/CAPABILITIES.md` has stale registry and Grit
  counts. D8 handles this as non-authority; update only through the public-docs
  owner path if implementation changes user guidance.
- P3: `tools/habitat/generators.json:14` describes the pattern generator
  as creating a matching rule-pack entry. Candidate generation is
  candidate-only in current source. If later D8/D13 implementation touches the
  pattern generator public surface, include this description in the D0/D13
  compatibility/write-set decision.
- P3: The D8 packet's vendor boundary is correct, but implementation records
  should cite the exact official vendor doc URLs used for any vendor-behavior
  claim, especially Grit `check` versus `apply`, Biome write/CI semantics, and
  Nx generator/schema behavior.

## Final Finding

No unresolved P1/P2 code/vendor topology blockers remain against the repaired
D8 disk state. D8 is accepted for design/specification only from this
code/vendor topology lane. Source implementation remains blocked behind the
packet's stated public-surface, projection, protected-path, downstream-owner,
and validation prerequisites.

Skills used: domain-design, information-design, solution-design,
testing-design, civ7-open-spec-workstream, civ7-habitat-dra-workstream,
civ7-systematic-workstream.
