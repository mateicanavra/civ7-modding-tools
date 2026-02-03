# Decision Packet: Adopt Dual History Outputs (Eulerian Eras + Lagrangian Provenance)

## Question

Should D04 be rewritten to require **dual history outputs**: Eulerian era-resolved tectonic fields **and** mandatory Lagrangian provenance, with fixed compute/memory bounds and a Morphology-first contract?

## Context (pointers only)

- Docs: `docs/projects/pipeline-realism/resources/spec/proposal-comparison-foundation-evolutionary-refactor.md` (D04 backlog entry)
- Docs: `docs/projects/pipeline-realism/resources/spec/synthesis-d01-d02-d04.md` (current D04 summary)
- Docs: `docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md` (Lagrangian framing)
- Docs: `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md` (Eulerian framing)
- Docs: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (current artifacts + `eraCount` guard)
- Code: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (`FoundationTectonicHistorySchema`)
- Code: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts` (`computeTectonicHistory`, `buildEraFields`)
- Code: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`eraCount !== 3` guard)

## Why this is ambiguous

- Proposal C treats history as **Lagrangian material tracking** (provenance-first), while Proposal D treats history as **Eulerian era-resolved fields** (field-first).
- The current contract already publishes `artifact:foundation.tectonicHistory`, but Morphology does not consume it and validation hard-codes `eraCount === 3`.
- D04 needs to resolve whether provenance is mandatory and whether history is a single artifact or dual outputs.

## Why it matters

- Blocks/unblocks: a fixed compute envelope for evolution history (CPU + memory per era).
- Blocks/unblocks: a Morphology-first contract that includes **both** event history (Eulerian) and material lineage (Lagrangian).
- Downstream contracts affected: `artifact:foundation.tectonicHistory`.
- Downstream contracts affected: new provenance artifact (see SPEC section).

## Simplest greenfield answer

Publish **two mandatory truth artifacts**: (1) Eulerian era fields and rollups, and (2) Lagrangian provenance derived from bounded advection of per-cell tracers, both keyed by the same `eraCount` and mesh topology.

## Why we might not yet simplify

- Dual outputs are more work than a single representation and require a strict compute budget and invariant checks to stay deterministic.
- Downstream consumers (Morphology first) must be updated to rely on both outputs, which increases surface area.

## Options

1) **Option A**: Eulerian-only history. Description: only era-resolved fields + rollups. Pros: lowest complexity; closest to current contract shape. Cons: no required provenance; cannot express material lineage or age-based morphology reliably.
2) **Option B**: Lagrangian-only history. Description: only provenance/parcel tracking; no era fields. Pros: rich lineage; answers “where did this crust come from.” Cons: breaks current contract and removes the field API used for boundary-driven shaping.
3) **Option C**: Dual output (Eulerian eras + Lagrangian provenance). Description: publish both, with fixed era counts and bounded advection steps. Pros: retains field API, adds required provenance, supports Morphology now and future provenance-driven logic. Cons: higher memory and validation complexity; must set explicit budget invariants.

## Proposed default

- Recommended: **Option C (Dual output)**.
- Rationale: preserves the current Eulerian contract while making provenance mandatory and explicit. Enables Morphology to use era fields for boundary-driven shaping **and** provenance for age/lineage-driven tuning. Fits within a bounded, deterministic compute envelope (fixed `eraCount` targets + fixed advection steps).

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md`
- [ ] Migration slice created/updated at: none (decision-only; migration defined in D0x slice)
- [ ] Follow-ups tracked: none needed
