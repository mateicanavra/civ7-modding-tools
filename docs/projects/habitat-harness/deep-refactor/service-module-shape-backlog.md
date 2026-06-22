# Habitat Service Module Shape Backlog

Status: active refactor backlog.

Habitat service modules follow the collect-style service shape: a module root
contains `contract.ts`, `module.ts`, and `router.ts` or `router/`. Additional
logic may live in `model/`, but only as concrete managed sub-kinds such as
`model/dto/`, `model/policy/`, `model/errors/`, `model/repositories/`, or
`model/helpers/`; loose implementation files, vague support buckets, and
Markdown notes do not belong under
`tools/habitat-harness/src/service/modules/**`.

## Router Pattern Follow-Up

For larger modules, use a `router/` directory with `[subrouter].router.ts`
files composed by `router/index.ts` into a single exported module router
object. Apply this across modules when it reduces router import pressure, and
rethink any module that reaches into another module to do its work.

The next full domino after the module-shape burn-down is the router pattern:
routers should be built through the module implementer using oRPC procedure
routers with service logic authored directly in EffectORPC procedure bodies.
Do not create standalone wrapper functions that bypass oRPC or EffectORPC.

## Procedure Shape Follow-Up

Service procedures must stop pretending to be CLI inputs. Procedure contracts
should expose direct service actions a caller needs, not flags, arg arrays, or
CLI command vocabulary. The CLI owns parsing user flags and compiling them into
service-client calls; module routers own normal action procedures.

## Generator Ownership Follow-Up

If a generator is domain-specific authoring input, it belongs under `.habitat/`
as managed Habitat input, not under toolkit source. If it is core Habitat
toolkit logic, it must be a named Habitat service capability or a named Nx
generator support surface with explicit file-kind rules.

## Active Slice: Module-Local Model Boundaries

Nx must treat a service module and its module-local `model/` tree as one module
project, not as a shared service-model project. The separate inferred
`@internal/habitat-harness-service-module-<module>-model` projects blur
module-local domain ownership into shared model ownership and make the boundary
taxonomy weaker than the collect-style shape. Collapse module-local model trees
back into their owning module projects, keep only `src/service/model` as the
shared service-model project, update taxonomy text, and validate with the
existing `boundaries` target plus service-module shape validation.

## Active Slice: Action-Named Procedures

Service procedure names must describe direct Habitat actions instead of generic
CLI-shaped `run` calls. Rename the procedure surface to
`check.report`, `classify.target`, `fix.applyPatterns`,
`graph.workspaceGraph`, `hook.execute`, and `verify.changes`. CLI commands keep
parsing flags, then compile those flags into the action inputs. Update contracts,
routers, CLI callers, focused tests, and command mocks together; do not add a
compatibility alias for the old `run` names.

## Active Slice: Router Wrapper Burn-Down

Routers must not reduce to one-line delegates such as
`return yield* context.runHook(input)` or `context.runGraph(...)`. Keep router
imports local-module-only, but expose module-owned primitive operations through
context and write procedure-level dispatch/orchestration in the router body.
Tighten the Grit service-wiring pattern so future router files reject
`context.run*` wrapper delegates.

## Resource Config Follow-Up

Explore Effect `Config` as the owner for Habitat runtime configuration loading
instead of continuing to grow hand-rolled config parsing/source selection. The
follow-up must either adopt Effect Config for `resources/config/**` or refuse it
with a concrete cause. Startup/shutdown helpers such as TSDKArc are lower
priority and should only be considered if the runtime acquisition/release model
still has a real gap after Effect Config is evaluated.

Completed step: replaced the custom config source/schema substrate with an
Effect-native config descriptor and live layer. Keep deterministic test/manual
overrides through `makeHabitatConfigLayer`, but make the default live resource
load through Effect `Config` so runtime overrides enter through the Effect config
provider rather than a Habitat-specific source abstraction.
