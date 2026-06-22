# Habitat Service Shape Backlog

Current burn-down categories:

- Remove module-local context from `service/base.ts`; service context keeps only provisioned resources and shared service metadata.
- Let each `module.ts` project service resources into the module-specific procedure context.
- Keep routers authored as procedure logic, importing only the module implementer from `./module.js`.
- Move shared resource needs into service-level deps/middleware; keep module-specific domain concepts inside the owning module.
- Enforce router/module import shape with allow-list tooling after the source tree matches the rule.
- Validate through typecheck, tests, Nx boundaries, service module shape, Grit pattern validation, and boundary taxonomy before each local Graphite commit.

Completed burn-downs:

- Graph router internal error mapping now uses contract-listed effect-oRPC errors; router source carries no TODO notes for this path.
- Shared `service/model/*` domains now reject loose unmanaged files; policy code must be named and classified by kind.
