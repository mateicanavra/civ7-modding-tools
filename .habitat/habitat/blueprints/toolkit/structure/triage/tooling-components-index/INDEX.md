# Habitat Toolkit Transitional Adapter Index

This subject records Habitat-owned executable adapters and related bridge assets
that were gathered during authority-tree triage. It is not a new
`.habitat/tooling/components` ontology. Generic dispatch, provider selection,
and command routing remain Toolkit implementation details under
`tools/habitat`.

Integration note: some Toolkit files still reference the previous
`.habitat/tooling/components/*` paths for generator schemas and source-check
loader modules. Those references are compatibility debt for a later Toolkit
integration slice, not evidence that this subject is the runtime resolver.

## Transitional Subjects

| Subject | Current Authority Path | Contents | Source Before Move | Integration State |
| --- | --- | --- | --- | --- |
| `generator-schemas` | `habitat/blueprints/toolkit/contract/triage/generator-schemas/` | Generator schema writer and generated Nx schema JSON bridge assets. | `tools/habitat/scripts/write-generator-schemas.ts`, `tools/habitat/src/generators/scaffold/*/support/schema.json` | Generator schema paths updated; writer still exists only as a command adapter. |
| `legacy-source-check` | `habitat/blueprints/toolkit/structure/triage/legacy-source-check/` | Retired native source-check runtime and per-rule `.mjs` modules. | `tools/habitat/src/service/model/source-check/policy/source/**` | Loader paths updated; target state is conversion to Grit-backed packet-local patterns. |

Do not add new adapter subjects here unless they are admitted by `.habitat/AUTHORITY.md`.

Admitted Toolkit checks now live under `habitat/blueprints/toolkit/<category>/check/`:

- `boundary-taxonomy`
- `cli-smoke`
- `habitat-orpc-service-wiring`
- `habitat-provider-domain-paths`
- `service-module-shape`
