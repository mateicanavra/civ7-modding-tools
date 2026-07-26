## ADDED Requirements

### Requirement: Placement Canonical Docs Describe The As-Built Vertical

The canonical placement reference SHALL describe the as-built placement
vertical (`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`):
the 11-step stage in the
plan→starts→support-adjust→stamp order, op-owned decision logic with thin
stamp/reconcile materializers, `domain/resources` ownership of resource
planning (ADR-008), the deterministic typed-reconciliation regime with
enumerated declared engine reads (ADR-009), the derived semantic knob
groups (ADR-010), the validated artifact inventory, and studio viz
coverage. Cross-referenced pages (`GAMEPLAY.md`, `STANDARD-RECIPE.md`)
SHALL NOT contradict it. Canonical pages carry durable content only — no
temporal "recently changed" phrasing.

#### Scenario: Reference matches the stage contract
- **WHEN** a reader compares PLACEMENT.md's step order, effect chain, knob
  groups, and artifact inventory against
  `stages/placement/index.ts`, `tags.ts`, `placement-public-config.ts`,
  and `stages/placement/artifacts/contract/`
- **THEN** the doc agrees with the source on every named surface

### Requirement: Workstream Decisions And Deferrals Are Durably Recorded

Structural decisions of the placement-realignment workstream SHALL be recorded in `docs/system/ADR.md` (ownership: ADR-008; reconciliation +
readback posture: ADR-009; knob taxonomy: ADR-010), and every deferred work
item named by the slice evidence/decision logs SHALL have a
`docs/system/DEFERRALS.md` entry with an explicit trigger condition and a
link to its owning project context — never a vague "later".

#### Scenario: A deferral is actionable without session context
- **WHEN** a future contributor reads any DEF-004…DEF-014 entry
- **THEN** it states when to revisit (trigger), why it was deferred
  (context with project link), what the work is (scope), and what is being
  lived with (impact)

### Requirement: Closure Labels Proof Classes Honestly And Hands Off Live Milestones

The workstream record SHALL label each proof class separately with its actual achieved state (local stats, generated/build, studio dump
headless vs interactive, live game), claim nothing stronger than the
evidence, and the pending live milestones SHALL be executable from
`docs/projects/placement-realignment/MILESTONE-PROOFS.md` alone (deploy
path, probe commands, gates, evidence destinations, and follow-up update
sites).

#### Scenario: No live claim without live evidence
- **WHEN** the workstream record or any S8 doc mentions live-game behavior
- **THEN** it is labeled NOT RUN / pending Milestone A or B, with the probe
  that would prove it named in MILESTONE-PROOFS.md
