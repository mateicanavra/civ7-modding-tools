# Habitat Service Shape Backlog

Current burn-down categories:

- Standing guardrail: do not turn `model` into a dumping ground. If logic clusters there instead of a router/procedure, policy, DTO, or repository kind, redesign the module split/merge before adding more files.
- Standing guardrail: policy files are helpers or policy middleware; do not recreate oRPC procedure/router responsibilities outside the oRPC module/router flow.
- Router import shape: every `service/modules/*/router.ts` imports only its local `./module.js`; all policy helpers, provider access, resource calls, Effect wrappers, and DTO/schema helpers must be projected through module context or moved to service/model when truly shared.
- Router violation queue from current scan: all root module routers are clean.
- Service-level context stays limited to provisioned/shared resources; module-local procedure concepts stay in `module.ts` or module-local model policy/DTO/helper kinds.
- Promise/resource adaptation belongs outside routers. Routers author procedure logic through the module implementer and consume ready Effect-returning operations from handler context.
- Remove module-local context from `service/base.ts`; service context keeps only provisioned resources and shared service metadata.
- Let each `module.ts` project service resources into the module-specific procedure context.
- Keep routers authored as procedure logic, importing only the module implementer from `./module.js`.
- Move shared resource needs into service-level deps/middleware; keep module-specific domain concepts inside the owning module.
- Burn down `service/model` to only genuinely shared cross-module models; module-local DTO/policy/repository code belongs under the owning `service/modules/<module>/model` tree.
- Continue collapsing internal Effect service tags that only exist to shuttle Habitat-owned policy; shared policy can be projected through module context, while service-level context remains external/provisioned resources.
- Enforce router/module import shape with allow-list tooling after the source tree matches the rule.
- Validate through typecheck, tests, Nx boundaries, service module shape, Grit pattern validation, and boundary taxonomy before each local Graphite commit.
- Follow-up: native `grit check` over the six router files exceeded the useful feedback budget even after the wiring pattern fixtures passed; current-tree Grit execution needs the same duration architecture repair as TypeScript.

Completed burn-downs:

- `check` and `classify` routers now satisfy the local-module-only import rule.
- `fix`, `graph`, `hook`, and `verify` routers now satisfy the local-module-only import rule.
- `habitat_orpc_service_wiring` is now a true router import allow-list pattern: any router import not from the local module path is a violation.
- Pure helper functions `epochMillisToIsoString` and `workspaceGraphTargetNames` were removed from `HabitatServiceDeps`; modules import them from their owning platform/provider modules.
- Hook output reporting now uses the shared `HabitatReporterService` resource; `HookRuntime` no longer carries the reporter callback.
- Hook timing now uses Effect `Clock`; `HookRuntime` no longer carries a custom clock callback.
- Hook filesystem access now uses the shared platform resource surface; `HookRuntime` no longer carries path-existence or file-hash callbacks.
- Hook trace/provenance collection has been deleted from the service runtime path; hook focused tests now validate behavior without repo snapshot bookkeeping.
- Hook resource policy now enters through the validated `hook.run` action input; `HabitatServiceDeps` no longer contains a generic `hookRuntime` option bag.
- Verify module wiring now has an explicit effect-oRPC implementer type boundary so package typecheck no longer trips over serialized router inference.
- Fix transactions require the provisioned Grit provider instead of carrying a provider-missing fallback path; provider runtime requirements are recorded in the module operation type instead of being hidden.
- Graph router internal error mapping now uses contract-listed effect-oRPC errors; router source carries no TODO notes for this path.
- Shared `service/model/*` domains now reject loose unmanaged files; policy code must be named and classified by kind.
- Shared `service/model/*/policy` files now use explicit policy/rule suffixes instead of generic `*.ts` and `*.mjs` names.
- Fix module pattern/apply internals now use explicit `model/dto`, `model/policy`, and `model/repositories` kinds; the old nested `patterns/` and `transactions/` pseudo-domains are removed.
- Classify diff target handling now lives in a named policy artifact; the module no longer has a loose `model/helpers` bucket.
- Check public DTO/request/render/summary policy now lives under `service/model/check`; the check module itself is reduced to contract/module/router ownership.
- Diagnostic contracts now live under `service/model/diagnostics`, host/protected-surface policy lives under `service/model/host`, and Grit providers no longer import check module internals.
- Check report DTOs, request language, renderers, summaries, staged source-scope policy, and disposition helpers now live under `service/model/check`; hook, verify, CLI, and tests no longer deep-import check structural schema/render/request internals.
- Classify and verify JSON result languages now live under public `service/model/classify` and `service/model/verify` surfaces; CLI commands and service contracts no longer import module-private result DTO files.
- Structural check, baseline authority, and source-check policy now live under `service/model/check/policy`; check, hook, verify, runtime layers, Nx plugin inference, and tests no longer import check module-private policy internals.
- Workspace graph reads now enter classify through the Nx provider resource; `HabitatServiceDeps` no longer carries the classify-only `workspaceProjects` test seam.
- Platform filesystem/temp/path/repo-root helpers now enter the service through one `HabitatPlatform` resource; `HabitatServiceDeps` no longer carries raw platform helper functions.
- Hook module procedure context now carries the `HabitatPlatform` resource directly instead of exploded `hashFile`, `pathExists`, and `repoRoot` fields.
- Structural check policy no longer enters through `HabitatServiceDeps` or live service-context construction; check, hook, and verify modules resolve the shared Effect policy layer at execution while tests provision fakes as layers.
- Source-check rule execution no longer has an internal Effect service tag or runtime layer; structural execution calls the owned source-rule policy directly.
- Baseline authority no longer has an internal Effect service tag or runtime layer; structural check/report/expansion policy calls baseline policy operations directly.
- Verify base, post-state, and Nx affected policies now receive module-projected provider resources instead of reading provider tags from the Effect runtime.
