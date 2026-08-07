# Civ7 oRPC Migration Gates

## 1. Ground The Slice

- Read the ratified product, system, outcome, topology, and workstream packet.
- Identify the actor outcome, current callers, current owner, destination
  owner, preserved behavior, and deletion trigger.
- Use `bunx nx show project <project> --json` to discover the real project and
  target names before choosing verification commands.
- Treat current implementation shape as migration evidence, not destination
  authority.

## 2. Close Semantic Ownership

- Native behavior lands in `services/civ7-controller`, under the official
  runtime realm/API group that owns it, and executes inside the controller mod.
- Actor-facing gameplay meaning lands in the Play module proved by baseline
  behavior and consumes only the public controller client.
- Run intent, state, ordering, cancellation, correlation, reconciliation, and
  final outcome remain in MapGen-runs, separate from Controller, Play, portable
  definition truth, and app-qualified physical effects.
- No operation has two fact writers or depends on a current route/file name for
  its meaning.

## 3. Close The Service Boundary

- The service owns one public contract and callable client over one private
  complete router.
- `src/client.ts` is the ordinary consumer face; private service source is not
  imported across the boundary.
- Ready dependencies are declared through the public construction face and
  supplied only by qualified app or API composition.
- Consumers neither recreate a method interface nor derive types from private
  contract or implementation leaves.
- Expected failures, defects, interruption, cancellation, and context
  requirements are preserved at the one native procedure boundary selected by
  the exact installed vendor lane.

## 4. Close The API Projection

- Every caller-facing route leaf is owned by the API contract.
- `src/client.ts` is the public caller face and `src/api.ts` is the public
  registration face.
- API contract, implementation, and router stay private under
  `src/service/**`.
- Each projection delegates explicitly to a bound public service client or
  exact app-supplied public capability.
- The API does not copy a service contract subtree, import a service-private
  router, acquire providers, or own service operation state.
- The qualified app materializes request context and mounts the registration
  face.

## 5. Close App Composition

- One qualified app selects each provider, plugin, host role, configuration
  root, and adapter identity exactly once.
- The app acquires providers, constructs ready resource values and adapters,
  binds service clients in dependency order, and supplies API context.
- A host controller binding transports typed envelopes only; it never
  regenerates a mature operation body. Raw JavaScript remains an explicit
  app-owned diagnostic, and window capture remains separate app evidence.
- Ordinary commands, projections, and services receive only their declared
  bound capabilities.
- Success, failure, partial startup, cancellation, and interruption all reach
  app-owned disposal without duplicating provider or service policy.

## 6. Pass The Vendor Source Gate

- Load `dev:orpc`; add `dev:effect-orpc` and `dev:effect-ts` when Effect crosses
  the procedure boundary.
- Load `dev:inngest` and, when relevant, `dev:effect-inngest` only for an earned
  durable workflow.
- Record the installed package tuple from the workspace manifest and lockfile.
- Inspect that exact published source and declarations for the proposed
  mechanism.
- Add a discriminating compile or lifecycle fixture for any choice that could
  differ across vendor lanes.
- Do not freeze guessed builder names, extension behavior, initialization
  order, error mapping, runtime/scoping, or cancellation semantics in Civ7
  architecture guidance.

## 7. Verify The Owning Proof

- Service contract: public client and contract type coherence.
- Service semantics: one mirrored suite for each affected module operation;
  preserve refusal, partial, stale, unavailable, and uncertain outcomes.
- Service execution: request isolation, interruption, cancellation, ordering,
  and once-only root behavior when affected.
- API contract/projection: caller schema and exact delegation/output/error
  mapping without choosing transport.
- API execution: only API-owned stream or projection lifecycle.
- App assembly/execution: provider/plugin/adapter selection, client binding,
  host mounting, interruption, and disposal.
- Run the discovered affected Nx lint, typecheck, test, and build targets.

## 8. Bound Live Claims

- Run read-only live evidence before mutation evidence.
- Mutate only with explicit authorization and a scope tied to the current
  player and game state.
- Preserve stable no-repeat identity for uncertain play mutations and require
  fresh controller evidence before retry.
- Label type, contract, semantics, execution, projection, assembly, generated,
  installed, loader, and live claims independently.

## Stop Conditions

Return to design when:

- Controller and Play require shared semantic write authority;
- Play needs a provider, resource value, transport, raw execution capability,
  or private controller source;
- an API cannot state a caller contract distinct from a service mirror;
- a service or API must expose private router source;
- a concrete vendor mechanism cannot be proven against the installed source;
- a workflow has no process-independent resumption need;
- relationship labels outrun official relationship evidence; or
- local proof is being used to claim live Civ7 behavior.

## Bounded Residue Review

Search the changed service, API, app, tests, and guidance roots only. The slice
must contain no private cross-service imports, provider acquisition outside an
app, copied service-contract subtrees in an API, parallel method interfaces,
unselected peer modules, or claims that one proof class establishes another.
