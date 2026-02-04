# Units and Scaling (Pipeline-Realism)

This document defines the **normative units, normalization, and scaling conventions** for the maximal Foundation evolutionary physics engine.

The intent is “dimensionless but meaningful”: numbers must be interpretable, comparable across runs/configs, and safe to threshold against other fields (e.g., `stress > strength`).

## Value Classes (What a Number Means)

1. **Physical units** (explicit units; rare but allowed)
   - Example: topography meters in `artifact:morphology.topography`.
2. **Normalized dimensionless** (preferred for physics drivers)
   - Unsigned: `[0, 1]` with semantic anchors for `0` and `1`.
   - Signed: `[-1, 1]` with semantic anchors for `-1 / 0 / +1`.
3. **Quantized normalized**
   - `u8` in `[0..255]`, `i8` in `[-127..127]`, representing normalized values.
   - Must define encode/decode and anchor meaning.

## Interpretability Rules (Required)

For every normalized field, the schema and catalog MUST specify:

- Domain: `[0, 1]` or `[-1, 1]`
- Anchors:
  - Unsigned: what `0` means and what `1` means.
  - Signed: what `-1 / 0 / +1` mean (or at minimum, sign + zero meaning).
- Cross-run comparability:
  - default: **comparable across runs/configs**
  - forbidden for truth artifacts: per-run min/max scaling (unless explicitly marked diagnostics)
- Threshold safety:
  - if a field participates in comparisons, both sides must share the same normalization meaning and anchors.

## Spatial Units (Tile vs Mesh)

### Tile space

- Length = `width * height`
- Coordinate space is declared by viz `spaceId` (e.g., `tile.hexOddR`).

### Mesh space

- Length = `cellCount`
- Neighbor relations described by the mesh CSR adjacency.

### Mesh-distance units (normative)

When a parameter is “in mesh distance units” (e.g., mantle source radii), it MUST be defined in a way that is stable across mesh resolution.

Normative convention:

- Define a normalized mesh distance where `1.0` represents a fixed fraction of the globe scale (implementation-defined, but stable per map size).
- Radii like `0.18` must be interpretable as “basin-scale” rather than “N cells.”

The chosen normalization must be documented once in:

- `docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md` (as part of the schema meaning)
- and referenced from each parameter table (mantle source radius, diffusion corridor widths, etc.).

## Normalization Conventions (Do This, Not That)

### Truth artifacts must not be per-run normalized

- Truth artifacts MUST NOT renormalize based on observed min/max in a run.
- If min/max scaling is helpful for display, it must be done at visualization time (`VizValueSpec`) or emitted as a diagnostics product.

### Prefer explicit normalization constants

If a field is described as bounded (`[0,1]`, `[-1,1]`), the producer MUST:

- use explicit normalization constants (e.g., `stressNorm`, `velocityNorm`, `divergenceNorm`),
- clamp at the publication boundary,
- and document the constant’s meaning.

## Canonical Field Meanings (Key Artifacts)

This section defines the anchor meaning for critical Foundation fields.

### `artifact:foundation.mantlePotential` (D02r)

- `potential` (f32, length = `cellCount`): signed normalized in `[-1, 1]`
  - `+1`: strong upwelling source potential
  - `-1`: strong downwelling source potential
  - `0`: neutral

### `artifact:foundation.mantleForcing` (D02r)

These fields must be threshold-safe and comparable across runs:

- `stress01`: unsigned normalized in `[0, 1]`
  - `1`: at/above the normalized stress scale (not “max observed in this run”)
- `forcingU01`, `forcingV01`: signed normalized in `[-1, 1]`
- `forcingMag01`: unsigned normalized in `[0, 1]`
- `divergence01`: signed normalized in `[-1, 1]`
- `curl01`: signed normalized in `[-1, 1]`

### `artifact:foundation.crust` (D05r)

Canonical crust state should be documented similarly (examples; adjust to the authoritative D05r spec):

- maturity: unsigned normalized `[0,1]` (0 = basaltic lid; 1 = mature differentiated/cratonic)
- thickness: unsigned normalized `[0,1]` (anchors defined by model)
- strength: unsigned normalized `[0,1]` (0 = very weak; 1 = resists normalized mantle stress)

### Quantized projections (tile)

When projecting truth fields to tiles, quantization MUST:

- preserve the declared anchor meanings, and
- be reversible to the declared normalized domain (up to quantization error).

Example `u8` encoding:

```txt
encode01_u8(x01) = round(clamp01(x01) * 255)
decode01_u8(xu8) = xu8 / 255
```

Signed `i8` encoding:

```txt
encode11_i8(x11) = round(clamp(-1,1,x11) * 127)
decode11_i8(xi8) = xi8 / 127
```

## Non-Negotiable Traps

- Do not treat truth artifacts as “display fields.” They are computation contracts.
- Do not normalize truth by run stats (breaks thresholds).
- Do not publish vectors without declaring their normalization/basis.
- Do not use quantized projections for downstream math if a f32 truth artifact exists.

