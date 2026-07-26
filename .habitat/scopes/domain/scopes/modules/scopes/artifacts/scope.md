# Domain Module Artifacts Scope

Status: active working reference

Subject:
`<domain>/modules/<module>/artifacts/`

Ownership boundary:
immutable pipeline products directly owned by the semantic module that
produces their meaning. Artifacts do not live at the domain root, inside
recipes, or beside unrelated module children.

The closed directory contains:

- `index.ts`: one direct `defineArtifactCatalog` aggregate;
- one or more `*.artifact.ts` files: one weighted artifact authority each.

An artifact file owns its inline complete payload schema and optional inline
relational refinement. Shared smaller schema primitives may come from the
nearest model `atoms/`; a complete artifact schema and artifact validation stay
in the artifact owner.

Executable authority:
`.habitat/blueprints/artifact/`.
