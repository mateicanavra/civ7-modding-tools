# Habitat Service Shape Backlog

Current burn-down categories:

- Router import shape: every `service/modules/*/router.ts` imports only its local `./module.js`; all policy helpers, provider access, resource calls, Effect wrappers, and DTO/schema helpers must be projected through module context or moved to service/model when truly shared.
- Router violation queue from current scan: all root module routers are clean.
- Service-level context stays limited to provisioned/shared resources; module-local procedure concepts stay in `module.ts` or module-local model policy/DTO/helper kinds.
- Promise/resource adaptation belongs outside routers. Routers author procedure logic through the module implementer and consume ready Effect-returning operations from handler context.
- Remove module-local context from `service/base.ts`; service context keeps only provisioned resources and shared service metadata.
- Let each `module.ts` project service resources into the module-specific procedure context.
- Keep routers authored as procedure logic, importing only the module implementer from `./module.js`.
- Move shared resource needs into service-level deps/middleware; keep module-specific domain concepts inside the owning module.
- Enforce router/module import shape with allow-list tooling after the source tree matches the rule.
- Normalize remaining module-local `model/policy` files into named policy artifacts; the current known remainder is the fix module's pattern and transaction policy internals.
- Validate through typecheck, tests, Nx boundaries, service module shape, Grit pattern validation, and boundary taxonomy before each local Graphite commit.
- Follow-up: package-level `tsc --noEmit` still exceeds the useful local feedback budget; keep validation pressure on narrower structural validators while the check-duration architecture work continues.
- Follow-up: native `grit check` over the six router files exceeded the useful feedback budget even after the wiring pattern fixtures passed; current-tree Grit execution needs the same duration architecture repair as TypeScript.
- Follow-up: `hookRuntime` is still caller-local hook execution state on service deps; it needs a deliberate runtime/caller design because it still carries path/file callbacks, resource policy, and trace state.
- Follow-up: package-level `tsc --noEmit` still exceeds the useful local feedback budget even after the visible fix-module diagnostic was repaired; keep validation pressure on narrower structural validators while the check-duration architecture work continues.

Completed burn-downs:

- `check` and `classify` routers now satisfy the local-module-only import rule.
- `fix`, `graph`, `hook`, and `verify` routers now satisfy the local-module-only import rule.
- `habitat_orpc_service_wiring` is now a true router import allow-list pattern: any router import not from the local module path is a violation.
- Pure helper functions `epochMillisToIsoString` and `workspaceGraphTargetNames` were removed from `HabitatServiceDeps`; modules import them from their owning platform/provider modules.
- Hook output reporting now uses the shared `HabitatReporterService` resource; `HookRuntime` no longer carries the reporter callback.
- Hook timing now uses Effect `Clock`; `HookRuntime` no longer carries a custom clock callback.
- Hook filesystem access now uses the shared platform resource surface; `HookRuntime` no longer carries path-existence or file-hash callbacks.
- Fix transactions require the provisioned Grit provider instead of carrying a provider-missing fallback path; provider runtime requirements are recorded in the module operation type instead of being hidden.
- Graph router internal error mapping now uses contract-listed effect-oRPC errors; router source carries no TODO notes for this path.
- Shared `service/model/*` domains now reject loose unmanaged files; policy code must be named and classified by kind.
- Shared `service/model/*/policy` files now use explicit policy/rule suffixes instead of generic `*.ts` and `*.mjs` names.
