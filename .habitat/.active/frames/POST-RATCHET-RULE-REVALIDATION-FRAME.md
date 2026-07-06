# Post-Ratchet Rule Revalidation Frame

Status: normative method frame

Durability: standalone method frame for revalidating Habitat rules after a
blueprint or scope ratchet has landed.

## Frame Identity

Frame name: Post-Ratchet Rule Revalidation

For situation: a bounded authority scope has just been ratcheted into positive
or stricter Habitat law. Rules in the ratchet blast radius now need cleanup
review so older guards, proxies, or split-owner checks do not remain live by
accident.

Mode: systematic method reference

Object path: problem frame for one rule after one ratchet event

Primary object: one live Habitat rule paired with one concrete ratchet event,
not a whole-corpus audit and not an implementation slice.

## Purpose

Use this frame to decide whether one rule is affected by a completed ratchet
and, if affected, what cleanup disposition the rule should receive before any
mutation occurs. The frame is method-only: it supplies the review lens,
decision order, and per-rule output. It must be paired with an instance
workstream draft that names the ratchet event, admitted surfaces, absorbing
authority, likely overlap lanes, and proof commands for that particular pass.

This frame does not contain scope-specific decision criteria. It does not
execute edits, delete rules, rewrite runners, change baselines, or classify the
entire live corpus.

## Selection Commitments

In:

- one completed ratchet event described by a paired workstream draft;
- one candidate live rule and its manifest, pattern, baseline, support files,
  ledger row, and current source evidence;
- the positive or stricter authority created by the ratchet;
- the cleanup action vocabulary already used by rule authority workstreams.

Foreground:

- whether the candidate rule is actually in the ratchet blast radius;
- whether new authority fully absorbs the old rule;
- whether concrete residual risk remains;
- whether a negative rule can be deleted, rewritten as positive authority, or
  incorporated into an existing authority surface;
- owner layer and proof class before any mutation.

Exterior:

- rules outside the paired workstream draft's admitted surfaces;
- general stale-rule review;
- cosmetic label normalization;
- implementation plans, file moves, runner migration, and baseline mutation;
- historical receipt language that has not been revalidated against current
  manifests, source, baselines, or command behavior.

## Structural Alternative Considered

Alternative:
run the standard broad rule classification frame directly after each ratchet.

Why rejected:
standard classification is useful for a whole corpus, but a post-ratchet pass
has a narrower purpose: test the specific blast radius of a newly landed
authority surface. The reusable component should therefore select by ratchet
effect first, then classify only admitted rules.

## Required Pairing Document

This frame is incomplete without a paired instance workstream draft. The draft
must provide:

- ratchet event name and closure claim;
- current closure evidence proving the ratchet authority is live;
- ratcheted authority surfaces;
- candidate source areas and explicit exclusions;
- scope-specific admission tests;
- likely overlap lanes;
- instance-specific proof commands or proof classes;
- instance boundaries and stop conditions.

If the paired draft does not name those surfaces, do not use this frame yet.
Open or repair the workstream draft first.

## Decision Method

Apply the gates in order. The paired workstream draft supplies the concrete
surface names and proof details. Current path overlap alone never admits a rule
to a post-ratchet pass; the rule's manifest, selector, pattern, baseline,
current source evidence, or command evidence must tie it to a ratcheted surface.

1. Scope gate:
   Does the rule overlap, conflict with, or fall within the ratchet blast
   radius defined by the paired workstream draft?
   If no, set `scope` to `out of scope`, leave `actionDecision` as `none`, and
   stop.
   If yes, continue.

2. Absorption gate:
   Is the rule fully absorbed by ratcheted authority at an equal or stronger
   owner layer?
   If yes, set `actionDecision` to `consolidation/dedup` and name the absorbing
   authority.
   If no, continue.

3. Residual-risk gate:
   Does the rule catch a concrete live risk that the ratcheted authority does
   not catch?
   If no, set `actionDecision` to `retirement/garbage collection`.
   If yes, continue.

4. Positive-assertion gate:
   Can the residual intent be asserted positively rather than preserved as a
   negative guard?
   If an existing positive assertion already covers the intent, set
   `actionDecision` to `consolidation/dedup`.
   If a missing or materially incomplete positive assertion is required, choose
   the exact action from `RULE-ACTION-CLASSIFICATION-FRAME.md`:
   `positive authority creation`, `closed structure inversion`, or
   `boundary inversion`. Do not record retirement until the positive assertion
   exists and has proof.

5. Split gate:
   Does the rule contain more than one live invariant with different owners,
   proof classes, or enforcement surfaces?
   If yes, and those invariants cannot be represented by one existing positive
   authority without overclaiming, set `actionDecision` to `split by owner`.
   If the apparent split consists mostly of obsolete clauses and one absorbed
   or deterministic rewrite clause, prefer the relevant consolidation,
   retirement, or inversion action, not `split by owner`.

6. Incorporation gate:
   Does a live residual clause belong inside an existing positive authority
   rule rather than as a standalone rule?
   If yes, set `actionDecision` to `consolidation/dedup` and name the target
   rule or owner surface.

7. No-action gate:
   If the rule is admitted, not absorbed, carries concrete residual risk,
   cannot be represented by existing or deterministic positive authority, and
   is already at the correct owner layer, set `actionDecision` to `no action`.

## Diagnostic Questions

Answer these before assigning any admitted action decision:

1. Absorption:
   Which ratcheted rule or owner surface, if any, makes this rule redundant?
2. Residual risk:
   What concrete violation still escapes the ratcheted authority?
3. Owner layer:
   Which layer should own the residual invariant: Habitat, `structure.toml`,
   source code, package validation, TypeScript, Biome, Nx, generated-output
   proof, or another named rail?
4. Proof shape:
   What proof class would make the disposition safe? If the required proof
   belongs to another owner layer, name that dependency instead of recording a
   Habitat cleanup disposition.
5. Vocabulary collision:
   Does the proposed wording conflict with source-domain terms? If yes, rename
   the process term before recording the result.

## Output Format Per Rule

Return exactly one compact record per reviewed rule:

```text
rule: <rule id>
scope: <admitted | out of scope>
actionDecision: <none for out of scope | one existing action decision from RULE-ACTION-CLASSIFICATION-FRAME.md>
rationale: <one sentence naming absorption, residual risk, or owner-layer reason>
evidence: <current manifest/pattern/baseline/source path or command evidence>
absorber: <absorbing rule id or owner surface | none>
oldShape: <old forbidden shape absorbed or residual shape at issue | none>
dependency: <none | required positive assertion / proof / owner decision>
proof: <one named proof class or command family needed before mutation>
falsifier: <specific condition that would invalidate this record>
```

For `consolidation/dedup` with expected old-rule deletion, `absorber`,
`oldShape`, and `proof` are mandatory. For `retirement/garbage collection`,
`oldShape` and `proof` are mandatory, while `absorber` may be `none` when the
rule is retired residue rather than absorbed by a survivor. A
deletion-oriented record without the required fields for its action decision is
not valid.

For `out of scope`, `rationale` must name the failed admission criterion or
the exterior surface that excludes the rule.

## Relationship To Existing Decision Frames

This frame is a post-ratchet overlay. It does not replace:

- `RULE-ACTION-CLASSIFICATION-FRAME.md`, which owns the action vocabulary;
- `RULE-DECISION-PACKET-FRAME.md`, which owns deep semantic decision packets;
- `RULE-REMEDIATION-SLICE-FRAME.md`, which owns implementation after decisions
  are accepted.

If this frame cannot produce a compact disposition without deep clause
analysis, route to the decision-packet frame instead of expanding this frame.

## Hard Core

1. A post-ratchet pass reviews only the ratchet blast radius named by the
   paired workstream draft.
2. Ratcheted positive or stricter authority is the primary absorption test.
3. Residual risk must be concrete and owner-layered before a rule can survive.
4. Apparent splits that are semantically obsolete lean consolidation,
   retirement, or inversion, not `split by owner`.
5. No disposition is final without current evidence and a named proof class.

## Protective Belt

- The instance workstream draft may conservatively admit a rule for review, but
  the per-rule record must still prove the scope gate.
- Historical receipts can explain prior intent, but current source, manifests,
  baselines, and commands decide current standing.
- `actionDecision` must use the existing action vocabulary exactly.

## Reframe Conditions

What would force a reframe:
if the paired workstream draft cannot name a bounded ratchet event and admitted
surfaces, this frame has no unit of analysis and must not be used.

Degeneration trigger:
if a reviewed rule requires proof outside the paired workstream draft's ratchet
surfaces, return `out of scope` with the exterior reason instead of forcing a
disposition inside this frame.

## Assumptions Committed

- The ratchet event has actually closed and current authority is live.
- The paired instance draft, not this generic frame, names the concrete source
  surfaces and proof commands.
- A negative rule is not stale merely because it is negative.
- Missing positive authority is an inversion or positive-authority action, not
  a retirement action.

## NOT HOW

This frame does not prescribe team structure, batching, file edits, branch
strategy, or implementation order. Those belong to the paired workstream draft
or a later remediation slice.
