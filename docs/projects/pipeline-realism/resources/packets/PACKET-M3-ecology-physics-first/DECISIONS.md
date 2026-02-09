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
- **Choice:** TBD (must be locked during packet completion).
- **Rationale:**
- **Risk:** choice affects memory footprint and enforcement of artifact mutation policy.

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
