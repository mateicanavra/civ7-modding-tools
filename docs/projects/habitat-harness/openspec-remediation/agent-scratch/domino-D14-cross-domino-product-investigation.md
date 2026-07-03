# D14 Cross-Domino Product Investigation

Reviewer lane: cross-domino/product.
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
Branch observed: `codex/d14-authoring-topology-fence-packet`.
Change root: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence`.

## Verdict

D14 is not acceptable yet from the cross-domino/product lane.

The packet has the right product intent: it keeps current Habitat as a generic structural substrate and prevents Phase 3 from implementing MapGen domain/op/stage/step/recipe generation. It also correctly states the split model: D13 owns the generic refusal envelope, while D14 owns authoring-specific blocked actions, future acceptance criteria, and recovery semantics.

The blocking problem is that the current D14 OpenSpec spec does not actually publish the D14-owned authoring language. It says only that Habitat refuses requests to "create or manage authoring topology outside current support." The source D14 packet requires an explicit unsupported action inventory, future acceptance criteria, required investigation and acceptance gates, refusal output, and deferral record. Without those specifics in D14, D13's existing authoring list or a later executor becomes the de facto source of authoring wording. That trips the stop condition: D14 can be read as relying on D13 to supply authoring wording, so D14 is not acceptable until repaired.

## Dependency Model

D4 is an example and non-claim provider only. D4's classify states and downstream handoff give D14 examples for `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, `graph-refusal`, unavailable targets, D2 unresolved routing, and authoring-looking unsupported requests. D14 may consume those examples to explain why classify is not generator support. It may not infer MapGen authoring support, target freshness, rule correctness, apply safety, or verify closure from D4.

D12 is a handoff-limit provider only. D12 gives D14 receipt states and non-claims for verify output. It explicitly says D14 may cite D12 only for verify handoff limits and receipt states, and may not infer authoring topology readiness or product behavior from a verify receipt.

D13 is the generic refusal-envelope provider. It owns request classification for structural creation commands, pre-write decisions, generic refusal shape, owner routing, recovery instructions, retry condition, and no-write result. It does not own D14 Authoring Topology design or MapGen authoring implementation. Its D14 row is correctly source-blocked behind D14 early-fence language.

D0 remains conditional public-surface authority. If D14 or D13 changes generator refusal output, JSON, help, docs examples, generator schemas, error strings, or package exports, concrete D0 rows are required before source implementation.

D2, D8, D10, and G-HOST blockers remain intact. D2 owns rule projections, not host policy or authoring. D8 owns Pattern Governance admission, not authoring topology. D10 owns generated/protected-zone decisions and must consume G-HOST for host-owned path facts. G-HOST remains incomplete and still blocks generic closure for host-specific generated/protected paths, apply gates, unsupported host shapes, and future authoring topology triggers.

D15 is not triggered by D14. The current D14 problem is missing refusal/future-authoring authority language, not an impossible local execution-provenance state.

## Findings

### P1: D14 does not publish the D14-owned authoring blocked-action inventory or future acceptance contract

The source D14 packet says the contract must define explicit unsupported authoring actions, future acceptance criteria, required investigation and acceptance gates, refusal output, and a downstream deferral record. It further says future acceptance criteria include product convention, target topology, generator dry-run/result records, classify/check command records, compile result, and product acceptance, and its stop conditions include vague future acceptance criteria.

The current D14 OpenSpec spec reduces that to one broad requirement and two scenarios:

- future authoring requests are refused unless a later accepted authority opens authoring implementation;
- a request that asks Habitat to "create or manage authoring topology outside current support" receives owner and trigger guidance;
- supported classify/check/scaffold/refusal workflows do not require MapGen concepts.

That is not enough to keep the authoring boundary closed. It does not enumerate the blocked actions already required by the source packet and adjacent docs: whole MapGen mod recipe, domain, operation, recipe stage, recipe step, step contract/default/schema bundle, recipe-stage-step wiring update, domain operation registry update, or Studio recipe artifact update. It also does not encode the future acceptance loop already stated in `tools/habitat/docs/GAPS.md` and `tools/habitat/docs/AUTHORING-NEXT.md`.

Required repair:

- Add a D14-owned blocked-action inventory to `openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md`, using D14/source-authority wording rather than D13 wording.
- Add D14-owned future acceptance criteria: current MapGen convention investigation, target topology, generator write/refusal result records, `habitat classify` command records, owning package check/test results, recipe compile or closest current recipe result, and product acceptance.
- Add refusal scenarios for at least recipe, domain, operation, stage, step, contract/default/schema, registry, and Studio artifact requests.
- Add an explicit non-claim that D14 does not implement Authoring Topology, does not prove MapGen product/runtime behavior, and does not create generators.

### P1: D14 still leaves D13 as the practical source of authoring wording

D14's design says D13 may not invent authoring refusal language locally. D13's accepted design also says D13 owns the generic refusal shape, while D14 owns authoring-specific blocked actions, future criteria, and owner language. That model is correct.

The current D14 spec, however, is less specific than D13's accepted spec. D13 currently names recipe, domain, operation, stage, step, contract, default, schema, registry, Studio, MapGen files, and no-write behavior. If D14 is accepted in its current shape, the only concrete command-facing authoring list lives in D13. That makes D13 the practical authoring-language authority despite both packets saying it must not be.

Required repair:

- Move or restate the concrete authoring blocked-action language into D14 as the owning early-fence authority.
- Keep D13's row as a consumer of D14 early-fence language, not as the source of that language.
- After D14 repair, update the D13 downstream row only to say the accepted D14 early-fence language is available to cite. Do not broaden D13 into authoring-specific ownership.

### P2: D14 control files blur refusal-only work with implementation work

The proposal says no code is authorized by the remediation packet, but also says the expected Habitat implementation write set is named in `design.md`. The design does not actually name a write set or protected paths; it only says they must exist before implementation starts. The task file then has a broad "Implementation" section with tasks to define the fence, convert unsupported authoring requests into D13 refusal criteria, and record triggers.

This does not by itself authorize MapGen authoring generation, because the proposal and design contain strong non-goals. But it is too loose for a packet whose source says "Docs/refusal-only closure unless D13 command behavior changes" and "No implementation packet for authoring topology in Phase 3."

Required repair:

- Rename or split the D14 task section so D14's current work is `Design/Refusal Fence` or `Documentation/Spec Realignment`, not generic implementation.
- If no D14 source code is authorized, say so directly in design and tasks.
- If D13 command-facing refusal implementation is later required, name the D13-owned write set there, and keep D14's source write set empty except for D14 OpenSpec/control/docs records.
- Add protected paths for `mods/**`, `packages/civ7-*`, `packages/mapgen-*`, MapGen authoring paths, generated artifacts, lockfiles, and other packet roots unless an owning packet explicitly authorizes them.

### P2: Validation gates are not falsifying for the D14 stop condition

D14's current verification gates are `habitat classify mods/mod-swooper-maps/src/recipes/standard`, strict OpenSpec validation, full OpenSpec validation, and `git diff --check`. These gates prove orientation and artifact hygiene only. They do not prove the injected bad case from the source packet: a MapGen Authoring Topology implementation request must produce a future-work refusal, not a scaffold.

Required repair:

- Add a design-time example matrix that shows the requested authoring actions and the expected refusal owner, reason, next safe action, and non-claims.
- Keep source tests later and D13-owned, but make the D14 packet name the exact D13 bad-case fixtures it expects after D14 language exists.
- Preserve the non-claim that D4/D12 examples do not prove command implementation of authoring refusals.

### P2: Current D14 state metadata is stale

The current worktree branch is `codex/d14-authoring-topology-fence-packet`, but `docs/projects/habitat-harness/openspec-remediation/context.md` still records `$ACTIVE_REMEDIATION_BRANCH` as `codex/d13-scaffolding-refusal-packet`, and the D14 phase record records `codex/deep-habitat-openspec-remediation`. The packet-index evidence policy requires current evidence to cite the active worktree and branch.

Required repair:

- Update the remediation context branch fixture to the current D14 branch before D14 acceptance evidence is recorded.
- Update the D14 phase record's branch/status fields when the workstream owner promotes this review.
- Do not update packet index status until repaired D14 final reviews and validation are aggregated.

### P3: D14's D0 dependency is reasonable but should be explained as conditional

The source D14 packet lists D4, D12, and D13 as blockers. The OpenSpec proposal adds D0. That is defensible because D14 may affect generator refusal output and docs, and D0 owns public compatibility handling. But D14 should not imply D0 is needed for docs-only refusal-fence recording.

Required repair:

- Keep D0 as a source/public-surface blocker for generator output, JSON, help, docs examples, and other public surfaces.
- State that D4/D12/D13 are the product/sequence dependencies for D14's authoring fence, while D0 is a public compatibility gate when public surfaces are touched.

## Downstream Realignment Demands

D13:

- Preserve the accepted split: D13 owns generic refusal shape only.
- After D14 repair, update the D13 downstream row from "blocked until D14 early-fence language is accepted and cited" to "consume accepted D14 early-fence language for authoring-specific refusal wording."
- Do not add D13-owned authoring-specific blocked actions, future acceptance criteria, or recovery semantics.

Packet index:

- Keep D14 blocking until this P1 repair is complete and final D14 review lanes record no unresolved P1/P2 findings.
- If D14 is later accepted, the D14 row should say accepted for design/specification only, not implementation-complete, with no Phase 3 authoring generators authorized.
- Preserve the D13 row's source blockers and do not convert D14 acceptance into D13 implementation readiness.

Deferral/future-authoring docs:

- `tools/habitat/docs/GAPS.md` and `tools/habitat/docs/AUTHORING-NEXT.md` already contain the strongest inventory and acceptance-loop language. D14 should consume that language or move the durable trigger into an explicit D14-owned deferral row.
- Add or update a deferral/future-authoring row that says current Habitat refuses MapGen recipe/domain/op/stage/step/contract/default/schema/registry/Studio artifact generation until the authoring acceptance loop exists.
- Keep future authoring acceptance tied to generator records, classify/check command records, compile results, and product acceptance.

Scenario corpus:

- Expand the unsupported scenario row from "Generate a MapGen domain/op/stage/step/recipe topology" to the full D14 blocked-action inventory, or add subrows for recipe, domain, operation, stage, step, contract/default/schema, registry, and Studio artifact update.
- Replace "Refuse or defer" with command-facing refusal plus future investigation trigger where the current command surface is involved.
- Preserve the existing non-claim that supported scaffolding is not MapGen authoring topology.

G-HOST/D10/D8/D2:

- No D14 repair should weaken these blockers.
- D14 must state that future authoring cannot use missing G-HOST declarations, D10 path allowances, D8 candidate/admission, or D2 registry projections as substitutes for authoring product authority.
- G-HOST remains incomplete and should keep its future-authoring trigger row; D14 should cite it only for host-policy boundaries, not as authoring implementation authority.

D15:

- No D15 row change is required. D14 does not identify an impossible local execution-provenance state.

## Source Blockers Preserved

- No MapGen domain/op/stage/step/recipe generator implementation is authorized.
- No new authoring domain model is authorized in Phase 3.
- D13 authoring-specific refusal source behavior remains blocked until D14 supplies accepted early-fence language.
- D4 orientation does not imply authoring support.
- D12 verify handoff does not imply product/runtime authoring readiness.
- D8 Pattern Governance does not imply authoring topology support.
- D10/G-HOST host and generated/protected-zone gates remain blocking where touched.
- D0 public compatibility rows remain required before command output, generator, JSON, help, docs-example, or export surfaces change.

## Acceptance Recommendation

Do not accept D14 yet.

Accept only after D14 itself publishes the concrete authoring blocked-action inventory, future acceptance criteria, refusal examples, deferral trigger, validation bad cases, and source/no-source boundary. The current packet is directionally correct, but not specific enough at the normative spec layer to prevent D13 or a later implementation agent from becoming the accidental authoring-language owner.

Skills used: domain-design, information-design, solution-design, ontology-design, civ7-open-spec-workstream.
