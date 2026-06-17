# Habitat Domain Mapping Investigation Brief

## Brief Identity

- Brief title: Habitat Toolkit domain mapping investigation.
- Prepared by: DRA Habitat domain mapping owner.
- Prepared at: 2026-06-17.
- Frame source / pointer:
  `tools/habitat-harness/docs/DOMAIN-MAPPING.md`.
- Intended execution rail: rail-neutral brief consumed by codebase deep dives,
  document reconciliation, and scenario corpus work.
- Status: ready for execution after harness validation.

## 1. Readiness

- Inquiry status: not needed; user objective and prework frame are explicit.
- Frame status: committed for this investigation.
- Upstream fallback used, if any: none.
- If upstream work is still needed, stop and do it before execution: not
  applicable unless `DOMAIN-MAPPING.md` is contradicted by stronger authority.

## 2. Frame Carried Forward

- WHAT: map Habitat as a repo-local structural toolkit and future authoring
  product domain through scenarios, authority, language, proof, and outcomes.
- WHY: Habitat has enough reference documentation to distinguish current
  substrate capability from desired authoring capability, but current code
  composition still reflects recovery-era placement.
- In scope: Habitat reference docs, current code/tests/commands, supported and
  unsupported scenarios, product outcomes, authority ownership, proof classes,
  and substrate-versus-authoring boundaries.
- Foreground: scenario flows, ubiquitous language, one owner per invariant,
  proof contracts, and current-code critique.
- Exterior: refactoring, generator implementation, final domain declaration,
  broad MapGen redesign, hook-as-authority claims, and stale closure claims as
  proof.
- Hard core: current code is evidence not authority; scenarios lead; one owner
  per invariant; substrate and authoring are distinct; proof classes stay
  explicit.
- Assumptions committed: `DOMAIN-MAPPING.md` is the active investigation frame;
  code/tests/commands can disprove behavior claims but do not define target
  domain boundaries by themselves.
- Structural alternative considered: document Habitat by current directories
  and modules.
- Falsifier / reframe trigger: candidate boundaries fail if they explain
  scenario flows no better than current technical layout.

## 3. Investigation Objective

- Objective: produce a reviewed Habitat domain design packet that explains the
  product/domain, supported and refused scenarios, tooling leverage, ambiguity
  reduction for agents, human pattern authoring, and downstream implementation
  slice entry points.
- Downstream decision or action this supports: decide which Habitat bounded
  contexts, authority owners, proof contracts, and authoring surfaces should
  guide future refactor or generator work.
- Investigation type: doc-vs-code reconciliation plus codebase deep dive plus
  corpus-building.
- Non-goals: implementation, refactor, generator work, final model before
  review, and MapGen product redesign.
- Required confidence level: verified for current behavior, corroborated for
  domain claims, hypothesis-labeled for future authoring.

## 4. Question Architecture

### Primary Question

- What is the Habitat Toolkit domain, as it should be designed for humans and
  agents maintaining a repository, when mapped from scenarios rather than from
  current implementation layout?

### Secondary Questions

- Which supported scenarios define current Habitat substrate capability?
- Which desired authoring scenarios define the product gap?
- Which concepts recur across scenarios with stable meaning?
- Which authority owns each invariant, refusal, proof class, and transformation
  decision?
- Which candidate contexts explain change patterns and proof needs better than
  current modules?
- Which current code compositions are accidental, overloaded, or misleading?

### Exclusion Questions

- How should Habitat internals be refactored now?
- Which MapGen generator should be implemented now?
- Which Grit rules or apply patterns should be added now?
- How should MapGen product/runtime architecture change?

### Falsification Questions

- Can each candidate context explain classify, check, verify, fix, hook,
  generate, promote-pattern, and future authoring flows?
- Does any candidate context hide multiple owners for one invariant?
- Does any language choice preserve mechanism names where domain concepts are
  needed?
- Does any claim rely on old closure records without current evidence?

## 5. Search Geometry

- Selected geometry: scenario corpus first, graph-tracing second, hypothesis
  testing throughout.
- Why this geometry: the domain must be derived from use and proof flows, while
  current code remains important connected evidence.
- Initial terrain / sources / paths: Habitat reference docs, project frames,
  `tools/habitat-harness/src`, `tools/habitat-harness/test`, `rules.json`,
  baselines, Grit patterns, generators, hooks, Nx plugin, and selected MapGen
  topology references.
- Required breadth: all required scenarios from `DOMAIN-MAPPING.md`, including
  supported, unsupported, and desired authoring flows.
- Required depth: enough per scenario to name actor, input, command/interface,
  output, authorities, proof classes, failure modes, and implementation path.
- Stop rule: stop when every required scenario has a filled row and every
  candidate boundary has evidence, objection, and falsifier status.

## 6. Evidence Policy

- Evidence standard: verified for current behavior; corroborated for domain
  claims; plausible or speculative only for future authoring hypotheses.
- Source authority order: direct user instruction; root `AGENTS.md`; Habitat
  reference docs; Habitat project frames; current source/tests/rules/baselines;
  fresh command behavior and generated diffs; active OpenSpec records; old
  ledgers and summaries as historical discovery.
- Minimum corroboration: domain claims need at least scenario evidence plus one
  current source, test, command, or reference-doc support.
- Conflict rule: current implementation facts can disprove implemented-behavior
  claims; they cannot define target domain boundaries without scenario and
  authority analysis.
- Claim-strength labels allowed: verified current behavior, reference intent,
  architecture target, historical claim, hypothesis, explicit non-claim,
  unresolved.
- Required uncertainty markers: unknown, unverified, source conflict, outside
  Habitat authority, requires MapGen decision, requires command proof.
- What does not count as evidence: model memory, chat-only claims, stale closure
  prose without current support, and module names without scenario evidence.
- Code-vs-doc rule, if applicable: docs define intent; code/tests/commands
  prove current behavior; domain boundaries require both scenario and authority
  fit.

## 7. Rail Decision

- Selected rail: manual owner synthesis with read-only codebase deep-dive and
  doc-reconciliation lanes.
- Why this rail: the strongest evidence is local structure, current docs, and
  scenario traces.
- Rejected rails: broad web research and implementation spikes.
- Rail-bias risks: local code overfit, report-shaped output, stale-record
  capture, mechanism vocabulary capture.
- Constraints passed to the rail: preserve exteriors, fill ledgers before
  synthesis, label claims, and stop on hard-core violations.
- Adapter notes: evidence lanes report rows and objections; the DRA owner
  synthesizes the design packet.

## 8. Artifact Contract

- Required artifact: reviewed Habitat domain design packet plus supporting
  scenario, flow, authority, language, evidence, critique, and falsifier
  records.
- Intended reader/consumer: future DRA owner, implementation agents, and human
  maintainers deciding Habitat refactor/generator slices.
- Required sections: domain definition, scenarios, flows, language, authority,
  contexts, proof contracts, current-code critique, authoring product gap,
  acceptance/falsifier tests, downstream slice candidates.
- Required claim support: every meaningful claim links to docs, code, tests,
  command behavior, or an explicit hypothesis row.
- Must include: supported and refused scenarios, proof-class boundaries, one
  owner per invariant, and substrate-versus-authoring distinction.
- Must not include: implementation patches, generator code, unreviewed final
  model claims, broad MapGen redesign, or stale proof inflation.
- Durability / maintenance expectation: project-control source of truth until
  accepted design is promoted or superseded.

## 9. Stop and Reframe Conditions

- Stop if: scenario rows are incomplete, authority conflicts are unresolved,
  current behavior contradicts reference docs, or implementation work starts.
- Return to Inquiry Design if: the user changes the product outcome or intended
  audience for the domain packet.
- Return to Framing Design if: `DOMAIN-MAPPING.md` no longer explains the work
  or a stronger authority changes the hard core.
- Downgrade confidence if: a claim lacks current evidence, source classes
  conflict, or future authoring evidence is missing.
- Ask the user if: Habitat and MapGen product authority conflict in a way docs
  cannot resolve.

## 10. Handoff Notes

- Open unknowns: final scenario completeness, candidate context names,
  glossary terms, authority conflicts, and authoring acceptance tests.
- Known risks: code-layout capture, stale-record capture, broad prose without
  ledger support, and premature implementation.
- Required references: listed in `workstream-record.md` and
  `DOMAIN-MAPPING.md`.
- Exact next action: fill `scenario-corpus.md` Phase 2 rows from the reference
  docs, then trace each scenario into `flow-map-ledger.md`.

## Completion Checks

- Frame commitments are embedded or the frame pointer is durable.
- Exteriors/non-goals are explicit.
- Evidence standard and source authority are explicit.
- Selected rail constraints are explicit.
- Artifact contract says who will use the output and for what.
- Stop/reframe/user-ask conditions are explicit.
