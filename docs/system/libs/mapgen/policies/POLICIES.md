<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="policies" title="Policy bundle"/>
</toc>

# MapGen policies

## Purpose

Policies are the guardrails that prevent MapGen docs and examples from drifting into multiple parallel architectures.

Policies are *normative* (“Allowed / Disallowed”) and must be anchored to code/spec.

## Audience

- Developers extending MapGen or writing examples.
- Documentation authors maintaining canon pages.
- AI agents needing “the rules”.

## Policy bundle

Canonical policies:

- Imports: `docs/system/libs/mapgen/policies/IMPORTS.md`
- Schemas and validation: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- Dependency IDs and registries: `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`
- Artifact mutation: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
- Config vs plan compilation: `docs/system/libs/mapgen/policies/CONFIG-VS-PLAN-COMPILATION.md`
- Truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Module shape: `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`
