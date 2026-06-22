# Habitat Tooling Component Index

This directory groups Habitat-owned executable adapters and related bridge
assets by the component they enforce or support.

## Components

| Component | Contents | Source Before Move | Integration State |
| --- | --- | --- | --- |
| `boundary-taxonomy/` | Boundary taxonomy validation command adapter. | `tools/habitat-harness/scripts/validate-boundary-taxonomy.ts` | Package script updated; rule metadata still needs explicit adapter registration. |
| `cli-smoke/` | Habitat CLI smoke validation command adapter. | `tools/habitat-harness/scripts/validate-cli-smoke.ts` | Package script updated; structural rule identity still undecided. |
| `generator-schemas/` | Generator schema writer and generated Nx schema JSON bridge assets. | `tools/habitat-harness/scripts/write-generator-schemas.ts`, `tools/habitat-harness/src/generators/scaffold/*/support/schema.json` | Generator schema paths updated; writer still exists only as a command adapter. |
| `legacy-source-check/` | Retired native source-check runtime and per-rule `.mjs` modules. | `tools/habitat-harness/src/service/model/source-check/policy/source/**` | Loader paths updated; target state is conversion to Grit-backed `.habitat/patterns`. |
| `service-module-shape/` | Service tree/file-kind validation command adapter. | `tools/habitat-harness/scripts/validate-service-module-shape.ts` | Package script and target routing updated; target state is a positive pattern allowlist. |

Do not add new components here unless they are admitted by `.habitat/AUTHORITY.md`.
