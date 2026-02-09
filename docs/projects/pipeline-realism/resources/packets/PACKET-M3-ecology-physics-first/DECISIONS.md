# Decisions (M3 Packet)

This file is intentionally small.

Format:

### <Decision title>
- **Context:** why this decision exists
- **Options:** A, B, C
- **Choice:** A/B/C
- **Rationale:** why
- **Risk:** what could break or drift

---

### Cross-family conflict model is explicit occupancy state
- **Context:** planning stages must avoid relying on projection stamping to resolve conflicts.
- **Options:** (A) immutable occupancy snapshot artifact chain, (B) publish-once mutable handle.
- **Choice:** A (immutable occupancy snapshot artifact chain).
- **Rationale:** snapshot artifacts keep ownership explicit and verifiable at stage boundaries. They preserve the "publish once" artifact posture, avoid hidden mutation channels across steps, and make determinism/cutover gating straightforward (each stage has one explicit "before/after" occupancy surface).
- **Risk:** memory footprint (multiple typed arrays). Mitigation: keep occupancy representation minimal (dense `u16` + `u8` reserved mask) and consider future compression/packing only after M3 is stable.

### Score layers representation
- **Context:** planners must consume a single score store for all features; layer ids must be stable.
- **Options:** (A) explicit keyed typed arrays per feature (Float32), (B) packed representation.
- **Choice:** A (explicit keyed typed arrays).
- **Rationale:** easiest to validate, easiest to evolve, and easiest to gate.
- **Risk:** memory footprint; mitigated by later quantization/migration if needed.

### Projection (map-ecology) remains one stage
- **Context:** minimize projection surface; invest complexity in truth stages.
- **Options:** (A) keep one stage, (B) split.
- **Choice:** A.
- **Rationale:** stable topology; easier gating.
- **Risk:** none material.

### No viz-only steps
- **Context:** steps are orchestration nodes; viz is a byproduct of the work, not a separate phase.
- **Options:** (A) "viz steps" that only publish deck.gl layers, (B) each step emits its own viz.
- **Choice:** B.
- **Rationale:** keeps causality obvious (viz comes from the same inputs/ops that produced the truth artifacts) and avoids redundant stage/step boundaries that would only exist to move data for visualization.
- **Risk:** steps may get visually noisy; mitigate by keeping viz emission conventions consistent and gated by trace/debug flags (without changing algorithm behavior).

### Biome edge refinement is integrated into biome classification
- **Context:** biome edges are part of "what the biome is," not a later optional pass.
- **Options:** (A) separate `biome-edge-refine` step/op, (B) integrated into `classifyBiomes` op.
- **Choice:** B.
- **Rationale:** reduces pipeline seams and prevents downstream scorers from consuming a pre-refine variant. If refinement needs toggles, they are compile-time knobs inside the one biomes op envelope, not a separate stage/step path.
- **Risk:** larger biomes op; acceptable because it remains a single atomic classification operation with clear inputs/outputs.
