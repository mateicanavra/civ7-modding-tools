# Phase Record - Deep Import Apply Proof

## Selection

Selected workstream: `habitat-grit-apply-deep-import-public-surface-proof`.

Reason: the recovery claim ledger names exactly one current apply codemod, and
the aggregate Grit proof repair already classifies it as implemented under
proof. Safe structural transformation is central to the Habitat product
outcome, so this codemod needs its own end-to-end safety contract before agents
can trust it.

## Phase Loop

### Analysis

- Re-read takeover frame, recovery claim ledger, Grit corpus ledger, aggregate
  Grit proof repair, Effect evaluation, and Effect Grit adapter packet.
- Confirmed this is an apply codemod, not a check rule.
- Confirmed native fixture proof and live dry-run evidence are separate from
  safe transformation.

### Extraction And Corpus

- Pattern: `.grit/patterns/habitat/apply/deep_import_to_public_surface.md`.
- Adapter: `tools/habitat-harness/src/lib/grit.ts`.
- Command path: `tools/habitat-harness/src/lib/command-engine.ts`.
- Source roots: `mods/*/src/recipes`, `mods/*/src/maps`.
- Export authority: domain public `/ops` module source files and package
  resolution.

### Design

- Target-export preflight is required for every candidate.
- Missing-export candidates are refusal cases, not successful rewrites.
- Dry-run no-write and applied-diff proof remain separate.
- Live write proof consumes `habitat-effect-grit-adapter` apply transaction
  services or an equivalent typed transaction substrate.
- Downstream records stay truthful until all proof classes exist.

### Review

Review lanes required:

- product/outcome;
- Grit/apply semantics;
- TypeScript/export authority;
- Effect/substrate;
- evidence/system.

### Implementation Packet Boundary

This packet is design/specification work. Implementation starts only after the
review lanes accept the packet and the transaction substrate dependency is
available for live apply proof.

## Effect Reconsideration

The user explicitly clarified that Effect should be reconsidered if it removes
manual work that structurally produces gaps. This workstream accepts that
guidance. The live apply path has exactly that shape: command provenance,
export preflight, transaction ownership, after-write gates, rollback, and final
clean-status proof are all easy to under-model with current manual code. The
packet therefore treats Effect as the preferred substrate for live apply proof,
not as a distant enhancement.

## Current Status

- Packet opened.
- Native sample and live zero-match dry-run evidence recorded.
- Review pending.
- Implementation pending accepted transaction substrate.
