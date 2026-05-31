# Systematic Evidence Workstream Skill Design

## Frame

The skill is an operator manual for systematic, evidence-grounded problem
resolution. It is not a history of the resource-distribution run and not a
general project-management checklist.

Selected signal:

- complete domain corpus extraction;
- physical/ecological/earthlike expectation grounding;
- per-entity or per-group strategy design;
- architecture-aligned artifacts and operations;
- local statistical proof before runtime proof;
- runtime/log proof tied to exact branch, commit, command/path, and logs;
- review loops and clean Graphite closure.

Exterior:

- one-off bug fixes without a corpus;
- task-specific resource status;
- broad motivational process advice;
- stale proof claims and external Graphite/PR claims without evidence.

Falsifier:

- if a future agent cannot apply the skill to features, biomes, brushing, or
  terrain without rewriting resource-specific sections, the skill is too narrow;
- if a future agent can follow the skill while skipping corpus extraction,
  expectations, stats, runtime proof, or review, the skill is too weak.

## File Tree

```text
.agents/skills/civ7-systematic-workstream/
  SKILL.md
  assets/
    closure-checklist.md
    corpus-ledger.md
    expectation-strategy-ledger.md
    verification-and-runtime-proof.md
    workstream-record.md
  references/
    corpus-and-expectations.md
    evidence-and-proof.md
    failure-patterns.md
    method-loop.md
    team-review-lanes.md
```

## Skill Information Architecture

`SKILL.md` stays compact:

- trigger and boundary;
- purpose;
- when to use / when not to use;
- default 12-step loop;
- reference and asset maps;
- invariants and failure modes.

References hold detail:

- `method-loop.md`: phase sequence, artifacts, and Civ7/OpenSpec examples.
- `corpus-and-expectations.md`: corpus shapes, physical expectation standards,
  expected ranges, uncertainty, and examples.
- `evidence-and-proof.md`: proof classes, stale-record audits, runtime proof,
  and closure-state labels.
- `team-review-lanes.md`: framed-agent prompts, reviewer lanes, severity, and
  disposition rules.
- `failure-patterns.md`: symptom-to-repair guidance and redesign triggers.

Assets are copy-forward templates, not documentation. Future agents can paste
them into workstream packets and fill the frame, corpus, expectations,
verification, and closure records before or during a systematic pass.

## Review Lanes

- Session-method review: verifies the skill derives from transcript and durable
  records rather than memory.
- Skill-authoring review: checks trigger precision, progressive disclosure,
  no orphan files, and local skill conventions.
- Civ7/OpenSpec review: checks that the method preserves Graphite/OpenSpec
  phase discipline without hardcoding resource-only artifacts.
- Information-design review: checks navigation, hierarchy, density, and
  operator usefulness.
- Operational-risk review: checks proof boundaries, FireTuner/runtime proof
  language, stale task record risk, and closure overclaims.
- Future-use stress review: applies the skill shape to features, biomes,
  brushing, ecology, terrain, tile types, trees, and woodlands.

## Validation Plan

1. Inspect generated skill paths and cross-links.
2. Compare the draft against skill-authoring validation gates.
3. Run strict OpenSpec validation for this change and all OpenSpec records.
4. Run `git diff --check`.
5. Commit via Graphite with local commit closure only; do not claim Graphite
   submit/PR delivery.
