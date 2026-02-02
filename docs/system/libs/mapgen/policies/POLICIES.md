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

Planned canonical policies (written in later slices):

- Imports (stable entrypoints; forbid workspace-only aliases)
- Schemas and validation (compiler-owned)
- Dependency IDs and registries (registered-only; fail-fast)
- Artifact mutation posture (write-once + buffer-handle exception)
- Config compilation vs plan compilation (responsibility split)
- Truth vs projection (what is canonical vs derived)
- Module shape (ops/rules/strategies boundaries)

