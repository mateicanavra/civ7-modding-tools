<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="topics" title="Explanation topics"/>
</toc>

# MapGen explanation

## Purpose

Explanation pages help you understand the system: architecture, rationale, and mental models.

Explanation pages should link down to reference/policies — not the other way around.

## Audience

- Developers onboarding to MapGen architecture.
- Authors/tooling maintainers who need to understand “why”.

## Explanation topics

Canonical explanation pages:

- System architecture + ownership boundaries: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- Pipeline model (mental model): `docs/system/libs/mapgen/explanation/PIPELINE-MODEL.md`
- Truth vs projection (rationale): `docs/system/libs/mapgen/explanation/TRUTH-VS-PROJECTION.md`
- Pipeline compilation (why split compile phases): `docs/system/libs/mapgen/explanation/PIPELINE-COMPILATION.md`
- Domain modeling + boundaries: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- Determinism + reproducibility: `docs/system/libs/mapgen/explanation/DETERMINISM.md`

Potential future explanation pages (only if they add clarity beyond policy/reference):
- Mutation model (artifacts vs fields/buffers) — if needed beyond policy/reference
- Narrative status (target contract + current wiring status) — if this warrants its own page
- Studio as a reference consumer (not architecture authority) — may be folded into Studio docs
