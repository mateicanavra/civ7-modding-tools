# Habitat Domain Design Packet

## Purpose

Habitat is a repo-local structural toolkit for humans and agents maintaining a
codebase. Its current product value is not "generate everything"; it is to
reduce ambiguity before and during code changes by answering:

- what owns this path or diff;
- which structural rules apply;
- what proof is required before handoff;
- which local feedback can run early;
- which structural repair is approved and safe enough to apply;
- which generated or protected zones must not be edited directly;
- which scaffolds are supported and which requests must be refused.

The target product outcome is a structural operating surface that lets agents
move through repositories with less guesswork and lets humans turn recurring
structural intent into governed patterns and, later, authoring workflows.

## Current Capability Boundary

Current supported Habitat surface:

- `classify`: path/diff orientation with owners, tags, rules, targets, and
  unavailable target facts.
- `check`: structural enforcement with selector integrity, normalized
  diagnostics, baselines, and baseline-integrity.
- `verify`: handoff proof with Habitat check summary, Nx affected facts,
  post-state, bounded streams, and explicit non-claims.
- graph integration: Nx project/target facts and inferred repo-wide Habitat
  targets.
- hooks: pre-commit/pre-push local feedback with staged checks, formatting
  ergonomics, resource state, and local-proof boundary.
- Grit diagnostics: validated scan roots, parser failure handling, normalized
  findings, and adapter non-claims.
- guarded apply: limited approved structural transformation with dry-run,
  changed-path approval, rollback, Biome handoff, and proof.
- baselines: explicit empty/debt files and shrink-only ratchet enforcement.
- generators: narrow project scaffolding for app/foundation/plugin and Pattern
  Authority candidate/registration workflows.

Current explicit gap:

- Habitat is not yet a complete MapGen authoring toolkit for domain, op, stage,
  step, recipe, contract, default, schema, registry, or Studio artifact
  creation. That is future Authoring Topology work and must remain separate
  from current structural substrate claims.

## Candidate Domain Model

| Context | Product Responsibility |
| --- | --- |
| Orientation and Routing | Tell agents where a path or diff belongs and what targets/rules matter. |
| Structural Enforcement | Run structural rules and return normalized diagnostics. |
| Baseline Authority | Own explicit debt state and shrink-only ratchet rules. |
| Workspace Graph Integration | Provide Nx-backed project and target truth to Habitat consumers. |
| Diagnostic Pattern Catalog | Acquire and project Grit-backed structural findings. |
| Pattern Governance | Admit, register, and govern structural patterns with authority evidence. |
| Transformation Transaction | Apply only approved structural rewrites with transaction proof. |
| Local Feedback | Make pre-commit/pre-push workflows ergonomic without claiming CI authority. |
| Generated/Protected Zone Authority | Guard generated or externally regenerated content. |
| Scaffolding | Create narrow uniform project shells and refuse domain-owned shapes. |
| Authoring Topology | Future product layer for codebase/domain structure generation. |
| Proof Contract | State what Habitat proves, observed, skipped, and does not claim. |

These contexts are described in detail in `context-map.md`.

## User Scenarios

Habitat supports a practical chain:

1. An agent classifies a path or diff before editing.
2. The agent runs the targets and Habitat checks that classification exposes.
3. The DRA owner runs verify to produce handoff proof and non-claims.
4. Local hooks catch staged issues earlier without replacing CI.
5. A known structural rewrite may run through guarded apply.
6. Uniform project scaffolding or Pattern Authority workflows can create
   supported artifacts.
7. Unsupported authoring requests are refused or framed for future Authoring
   Topology investigation.

The full scenario corpus is `scenario-corpus.md`; flow traces are
`flow-map-ledger.md`.

## How Habitat Reduces Ambiguity

Habitat reduces ambiguity for agents by converting implicit repository
knowledge into explicit contracts:

- paths become owners, tags, rules, and targets;
- selectors become known, wrong-namespace, unknown, or empty-intersection facts;
- diagnostics become normalized reports;
- baseline debt becomes explicit contract state;
- proof artifacts separate claims from non-claims;
- local hooks say when they are only local feedback;
- generators refuse unsupported shapes instead of silently guessing;
- Pattern Authority separates human intent, source authority, fixtures, proof,
  baselines, hook scope, and apply safety.

The important design move is not a new wrapper around existing commands. It is
making authority and proof visible enough that humans and agents can choose the
right next action.

## Human Pattern Authoring Direction

The desired future direction is for humans to describe recurring structural
patterns and for Habitat to help convert those descriptions into governed,
agent-usable mechanisms:

- examples and counterexamples;
- source authority;
- scan roots and exclusions;
- false-positive model;
- check versus apply versus generator disposition;
- baseline contract;
- hook-scope decision;
- proof class and non-claims.

The current Pattern Authority manifests are the closest working precedent, but
they are not yet a complete human authoring workflow. Future work should extend
Pattern Governance and Authoring Topology without weakening the existing
admission gates.

## Why Current Code Is Not The Domain Model

Current code is a reliable evidence source for behavior, but not a reliable
source for target boundaries:

- `command-engine.ts` mixes orientation, enforcement, baselines, proof, graph,
  classify, and fix entry routing.
- Grit diagnostic acquisition, Pattern Authority, and guarded apply have
  different authorities despite sharing tool vocabulary.
- Hooks coordinate several checks but own only local feedback.
- Project scaffolding and pattern governance are both generators technically,
  but they answer different product questions.

The domain model must follow scenario responsibility, authority, proof class,
language, and change pattern. `current-code-critique.md` records the full
critique.

## Falsifier Review

The candidate frame survives the current falsifier set:

- It explains all seed scenarios better than current technical layout.
- It assigns one target owner per invariant.
- It preserves proof classes and non-claims.
- It keeps current structural substrate separate from future authoring.
- It treats refusals as first-class product outputs.

The review is recorded in `falsifier-tests.md` and
`review-disposition-ledger.md`. The review was lane-based self-review because
no callable multi-agent spawn tool was available in this session.

## Handoff To Implementation Planning

Implementation work should not begin by moving files. It should begin by
choosing one authority and one scenario chain:

- improve Orientation and Routing examples and command output;
- strengthen Structural Enforcement selector language;
- clarify Proof Contract storage and retention;
- separate Pattern Governance from Grit acquisition in docs or code;
- design the first Authoring Topology slice after a MapGen convention
  investigation.

Any implementation slice must cite the scenario rows, authority row, evidence
rows, and falsifier it serves. Refactor, generator implementation, Grit changes,
apply changes, hook changes, and baseline mutation remain out of scope for this
packet.
