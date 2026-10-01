# Civ7 Capability Realization Topology

**Status:** Accepted decision
**Date:** 2026-07-30

This comparison expands each plausible topology far enough to expose its real
ownership and runtime consequences. The selected topology is Alternative C.

## Alternative A: Controller-Primary

```text
packages/
  civ7-tuner-protocol/

resources/
  civ7-tuner/
    contract.ts
    providers/local-socket/

services/
  civ7-live/
    modules/{app,game,ui}/
  civ7-play/
    modules/{attention,city,diplomacy,government,narrative,
             notifications,progression,strategy,turn,unit,world}/

plugins/
  mod/ui/civ7-controller/
    src/{shell,game,loader}/
  server/api/
    civ7-hq/
      src/{client,server,service/modules/{live,data,mods,logs}}/
    civ7-play/
      src/{client,server,service/modules/{game,attention,city,diplomacy,
                                         government,narrative,notifications,
                                         progression,strategy,turn,unit,world}}/

apps/
  mods/ui/civ7-controller/
  server/civ7-control-plane/
    src/{app,main,runtime}/
  cli/
  web/mapgen-studio/
    src/{browser,server,runtime}/
```

### Cards

| Container | Role | Primary consumer | Structural concern |
| --- | --- | --- | --- |
| `packages/civ7-tuner-protocol` | Pure Tuner framing and messages | Tuner provider | Cannot make App UI promises awaitable |
| `resources/civ7-tuner` | Managed Tuner capability | Server and CLI apps | Cannot share globals across Civ7 states |
| `services/civ7-live` | App, game, and UI live controls | Play service and HQ API | Risks becoming a forwarding catalog |
| `services/civ7-play` | Gameplay policy and outcomes | Play API and CLI | Duplicates the current control service boundary |
| `plugins/mod/ui/civ7-controller` | App UI controller projection | Controller mod app | Requires shell/game lifecycle and async ingress |
| `plugins/server/api/civ7-hq` | Live/data/mod/log API aggregation | Control-plane app | Broad API before a caller contract |
| `plugins/server/api/civ7-play` | Network gameplay projection | Browser/network play clients | Unearned alongside in-process CLI |
| `apps/mods/ui/civ7-controller` | Controller deployment identity | Civ7 App UI | No current deployed consumer |
| `apps/server/civ7-control-plane` | API/resource host | Network clients | Becomes mandatory for local tools |
| `apps/cli` | Local command process | Humans and agents | Would choose between local and server paths |
| `apps/web/mapgen-studio` | Studio product runtime | Map authors | Must still preserve one shared live session |

### Disposition

Rejected for this initiative. It depends on an unbuilt mailbox, a controller
deployment/version protocol, and unproved shell/game lifecycle handshakes. It
also turns the current proven host path into a fallback, creating the hybrid
state this migration is intended to remove.

## Alternative B: Layer-Per-Noun Foundry

```text
packages/
  civ7-tuner-protocol/
  mapgen-core/

resources/
  civ7-live-connector/providers/civ7-tuner/
  catalog/providers/civ7-official-data/
  desktop-app/providers/civ7-macos/

services/
  civ7-control/
    modules/{app,game,ui,session}/
  civ7-live/
    modules/{readiness,observation,logs}/
  civ7-play/
    modules/{attention,city,diplomacy,government,narrative,
             notifications,progression,strategy,turn,unit,world}/
  civ7-mapgen/
    modules/{catalog,recipe,generation,projection,diagnostics}/
  civ7-resources/
    modules/{official-data,mods,logs}/

plugins/
  server/api/
    civ7-live/src/{client,server,service/modules/{readiness,observation}}/
    civ7-data/src/{client,server,service/modules/{official-data,mods,logs}}/
    civ7-play/src/{client,server,service/modules/{gameplay}}/
    civ7-hq/src/{client,server,service/modules/{live,data,control}}/
  async/workflows/
    mapgen/src/{events,functions,runtime,index}/
    civ7-control/src/{events,functions,runtime,index}/
  mod/map/swooper-physics/

apps/
  server/civ7-control-plane/src/{app,main,runtime}/
  cli/
  web/
    mapgen-studio/src/{browser,server,runtime}/
    docs/
    playground/
  mods/map/swooper-physics/
```

### Cards

| Container | Role claimed by this alternative | Primary consumer | Structural concern |
| --- | --- | --- | --- |
| `packages/civ7-tuner-protocol` | Pure wire support | Live connector | One consumer does not earn a public package |
| `packages/mapgen-core` | Portable MapGen SDK | MapGen service | Earned package, wrong forced consumer |
| `resources/civ7-live-connector` | Generic live connection | Control/live services | Hides the specific Tuner capability |
| `resources/catalog` | Managed catalog abstraction | Resources service | No current managed catalog consumer |
| `resources/desktop-app` | OS process control | Control service | No current implementation |
| `services/civ7-control` | App/game/UI/session authority | Live and play services | Too low-level to own semantic outcomes |
| `services/civ7-live` | Readiness/observation/log authority | Live/HQ APIs | Mostly forwards other owners |
| `services/civ7-play` | Gameplay policy | Play API | Splits the present service without a new authority |
| `services/civ7-mapgen` | Recipe and generation truth | Studio, mod, workflow | Breaks portable in-browser/in-mod ownership |
| `services/civ7-resources` | Data/mod/log operations | Data API | No coherent semantic state owner |
| `plugins/server/api/civ7-live` | Live network projection | Studio and external tools | No non-Studio caller yet |
| `plugins/server/api/civ7-data` | Data network projection | External tools | No caller contract yet |
| `plugins/server/api/civ7-play` | Play network projection | Agents/browser | CLI already calls in process |
| `plugins/server/api/civ7-hq` | Aggregate control plane | Server app | Becomes a projection junk drawer |
| `plugins/async/workflows/mapgen` | Durable generation workflow | Server app | Current operation is process-lifetime but not externally durable |
| `plugins/async/workflows/civ7-control` | Durable control workflow | Server app | No cross-request requirement |
| `plugins/mod/map/swooper-physics` | Game projection only | Swooper mod app | Strips accepted product-definition authority |
| `apps/server/civ7-control-plane` | Realize all APIs/workflows | Network clients | Unearned mandatory host |
| `apps/cli` | CLI process | Humans and agents | Risks alternate local/remote paths |
| `apps/web/*` | Web product identities | Browser users | Role is sound; paths alone prove nothing |
| `apps/mods/map/swooper-physics` | Mod realization | Civ7 | Owner earned; current root unsealed |

### Disposition

Rejected. The roots look complete, but the layers are not earned. This topology
adds forwarding boundaries, makes static data appear managed, and weakens
MapGen portability. It confuses structural expansion with state collapse.

## Alternative C: Capability-Port Foundry

**Selected.**

This selects semantic owners and realization chains, not permission to create
every shown root. Paths marked as law gates remain `UNCONSTRUCTIBLE` until
their independently closed Habitat packets are accepted.

```text
packages/
  mapgen-core/
  mapgen-config/
  civ7-adapter/
  civ7-map-policy/
  civ7-mod-install/
  civ7-save-files/
  sdk/
  studio-run-workspace/
  ...other proven pure/support packages

resources/
  civ7-tuner/
    AGENTS.md
    contract.ts
    habitat.toml
    package.json
    project.json
    test/
      contract/
        contract.typecheck.ts
        [contract.test.ts]
    tsconfig.build.json
    tsconfig.json
    providers/
      local-socket/
        AGENTS.md
        habitat.toml
        index.ts
        project.json
        tsconfig.json
        protocol.ts
        session.ts
        socket.ts
        test/
          semantics/provider.test.ts
          execution/lifecycle.test.ts
          [collaboration/provider.live.test.ts]
  civ7-window-capture/
    AGENTS.md
    contract.ts
    habitat.toml
    package.json
    project.json
    test/contract/contract.typecheck.ts
    providers/
      macos-screencapturekit/
        AGENTS.md
        habitat.toml
        index.ts
        project.json
        tsconfig.json
        test/
          semantics/provider.test.ts
          execution/lifecycle.test.ts
          collaboration/provider.live.test.ts
    tsconfig.build.json
    tsconfig.json

services/
  civ7-control/
    habitat.toml
    package.json
    project.json
    test/
      contract/client.typecheck.ts
      semantics/modules/<module>/<operation>.test.ts
      [semantics/<selected-service-invariant>.test.ts]
      execution/root.test.ts
    tsconfig.json
    src/
      client.ts
      service/
        habitat.toml
        base.ts
        contract.ts
        impl.ts
        router.ts
        modules/
          {attention,city,diplomacy,display,government,lifecycle,
           narrative,notifications,progression,readiness,strategy,
           turn,unit,view,world}/
            AGENTS.md
            contract/{index.ts,...}
            module.ts
            router.ts
            router/*.router.ts
            [middleware/]
            [model/]
  mapgen-runs/
    habitat.toml
    package.json
    project.json
    test/
      contract/client.typecheck.ts
      semantics/modules/<module>/<operation>.test.ts
      [semantics/<selected-service-invariant>.test.ts]
      execution/root.test.ts
    tsconfig.json
    src/
      client.ts
      service/
        habitat.toml
        base.ts
        contract.ts
        impl.ts
        model/
          actors/
            operation-runtime.ts
        router.ts
        modules/
          {autoplay,operations,run-in-game,save-deploy}/
            AGENTS.md
            contract/{index.ts,...}
            module.ts
            router.ts
            router/*.router.ts
            [middleware/]
            [model/]

plugins/
  cli/topics/
    {data,docs,game,git-mod,mapgen}/
      src/
        commands/<path>/<command>.ts
        [adapters/<path>/<adapter>.ts]
        index.ts
      test/
        commands/<path>/<command>.test.ts
        [adapters/<path>/<adapter>.test.ts]
        tsconfig.json
  server/api/
    mapgen-studio/
      habitat.toml
      project.json
      tsconfig.json
      src/
        api.ts
        client.ts
        context.ts
        contract.ts
        router.ts
        modules/
          {authoring,control,runs,studio}/
            AGENTS.md
            contract/{index.ts,...}
            module.ts
            router.ts
            router/*.router.ts
            [middleware/]
            [model/]
      test/
        contract/client.typecheck.ts
        projection/{authoring,control,errors,router,runs}.test.ts
        execution/{live-game-watcher,studio-events}.test.ts
  web/app/
    mapgen-studio/             # semantic destination; law gate required
      test/
        views/<selected-view-id>.test.tsx
        interactions/<selected-interaction-id>.test.tsx
        execution/<selected-execution-id>.test.tsx
  mod/
    map/swooper-physics/
    civ/dacia/                 # semantic destination; law gate required

apps/
  cli/
    habitat.toml
    package.json
    project.json
    bin/
      run.js
    src/
      cli.ts
      runtime/
        composition.ts
        context.ts
        adapters/
          local-mods.ts
    test/
      assembly/
        shell.test.ts
      execution/
        binding.test.ts
        finalization.test.ts
        adapters/
          local-mods.test.ts
      tsconfig.json
    tsconfig.json
  mapgen-studio/
    habitat.toml
    package.json
    project.json
    src/
      server.ts
      web.ts
      dev.ts
      runtime/
        composition.ts
        config.ts
        adapters/
          civ7-official-data.ts
          civ7-save-files.ts
          fresh-log-files.ts
          studio-run-files.ts
          swooper-map-config-source.ts
    test/
      assembly/
        composition.test.ts
      execution/
        hosts/{server,web,dev}.test.ts
        adapters/
          civ7-official-data.test.ts
          civ7-save-files.test.ts
          fresh-log-files.test.ts
          studio-run-files.test.ts
          swooper-map-config-source.test.ts
      tsconfig.json
  docs/
  playground/
  mods/
    map/swooper-physics/
      habitat.toml
      package.json
      project.json
      src/
        build.ts
        deploy.ts
        run-manifest.ts
        runtime/
          adapters/
            local-mod-install.ts
          file-plan.ts
          map-script/
            compiler.ts
          run-manifest.ts
      test/
        setup.ts
        artifact/<selected-artifact-id>.test.ts
        deployment/<selected-deployment-id>.test.ts
        runtime/<selected-runtime-id>.test.ts
        live/<selected-live-id>.live.test.ts
        tsconfig.json
      tsconfig.json
    civ/dacia/                 # semantic destination; law gate required
```

The topology intentionally contains no controller mod, MapGen generation
service, HQ API, generic catalog resource, macOS app-control resource, public
Tuner protocol package, or durable workflow plugin. Those remain admissible
future kinds, not empty placeholders. Docs and Playground retain their current
roots until their distinct app shapes are classified.

Services remain governed by the established local Civ7 packet because
`service@1` is unselected. Standalone service roots own their contract,
module-semantics, and execution proof; the API root owns only caller contract,
projection, and selected execution proof. Each kind fixes its anchor leaves
directly. API, web, app-host, and qualified product manifests select only the
variable subjects within their blueprint-defined axes. Placeholder and
wildcard suffix grammar never discover or admit proof. Every admitted test root
is closed by its blueprint around a small set of disjoint, meaningful
confidence axes. Generic kinds reuse generic layers; qualified and domain kinds
refine them rather than opening case-by-case test cabinets.

### Capability Cards

#### `packages/mapgen-config`

- **Kind:** package
- **Role:** own the portable JSON envelope and canonical identity vocabulary
  shared by MapGen definitions, authoring projections, and run services
- **Produces:** `@swooper/mapgen-config` with `src/index.ts` and the direct
  `src/map-config-envelope.ts` leaf
- **Consumers:** Swooper definition/realization, MapGen-runs, Studio API, and
  Studio web projection
- **Forbids:** oRPC procedures, Studio lifecycle, source mutation, recipe
  admission, and child source directories

This is the only residue retained from `packages/studio-contract`. Its contract
proof owns the public TypeBox/TypeScript surface; semantics owns exact portable
JSON admission, snapshot ownership, and serialization. Studio-specific
contracts move to their API or service owner, and the `studio-contract` package
identity retires.

#### `packages/civ7-adapter`

- **Kind:** package
- **Role:** own the portable engine-adapter contract, static capability
  vocabulary, and deterministic mock
- **Produces:** engine-facing TypeScript contracts and test implementations
- **Consumers:** MapGen definitions, the Swooper realization, and tests
- **Forbids:** ambient Civ7 globals, loader/setup entrypoints, live engine
  acquisition, filesystem access, and deployment

The current package is split at its environment boundary. Contract, static
metadata, and mock behavior remain reusable package authority. The concrete
implementation that imports Civ7 engine globals moves to the Swooper
realization's `runtime/map-script/` interior, where the game loader actually
executes it. The SDK no longer carries a concrete live adapter as if it were
portable.

#### `packages/studio-run-workspace`

- **Kind:** package
- **Role:** own Run in Game workspace paths, manifests, correlation contracts,
  snapshot comparison, and ordered-marker algorithms
- **Produces:** portable evidence types and pure path/manifest/comparison
  functions over caller-supplied values
- **Consumers:** MapGen-runs and the Studio app's runtime adapters
- **Forbids:** filesystem reads or writes, directory selection, process
  lifetime, and operation state

The MapGen Studio app owns `studio-run-files` and `fresh-log-files` adapters
that perform host filesystem effects. They delegate path grammar,
rewrite/truncation comparison, and fresh-byte classification to this package.
MapGen-runs owns marker selection, semantic acceptance, timeout policy, and
public outcomes.

#### `packages/civ7-save-files`

- **Kind:** package
- **Role:** parse saved-game configuration bytes and deterministically classify
  caller-supplied file candidates
- **Produces:** exact saved-configuration DTOs and pure bounded selection
- **Consumers:** the Studio app's `civ7-save-files` adapter and Swooper proof
- **Forbids:** filesystem listing, directory selection, Tuner access,
  load-game mutation, watch lifetime, and API projection

The MapGen Studio app selects the directory and performs the read through its
runtime adapter, then supplies the package only names and bytes. The API sees a
typed saved-configurations requirement and imports neither Node filesystem APIs
nor this package.

#### `resources/civ7-window-capture`

- **Kind:** resource with `macos-screencapturekit` provider
- **Role:** acquire the content-addressed helper, translate platform/TCC
  failures, capture only a selected Civ7 window, and release process-owned
  helper state
- **Produces:** ready window-capture capability and typed platform failures
- **Consumers:** runtime-owned control-service binding in CLI and Studio
- **Forbids:** control policy, app activation, desktop capture, provider
  selection, and caller projection

The existing helper compilation, cache revision, TCC availability, and external
process collaboration earn a managed resource rather than a package-shaped
host adapter. Qualified CLI and Studio apps select the macOS provider. The control service
owns view policy and public outcomes; the provider owns only acquisition and
capture mechanics. No generic desktop-control resource is inferred.

#### `resources/civ7-tuner`

- **Kind:** resource
- **Role:** provider-neutral managed access to named Civ7 Tuner states
- **Produces:** typed session capability and failure vocabulary
- **Consumes:** no semantic service
- **Consumers:** runtime-owned control-service binding and explicit diagnostics
- **Forbids:** gameplay semantics, direct-control convenience methods

#### `resources/civ7-tuner/providers/local-socket`

- **Kind:** provider
- **Role:** acquire, reconnect, health-check, execute, and release the local
  Civ7 Tuner socket
- **Produces:** `Civ7Tuner` resource value
- **Consumes:** resource contract; keeps its single-consumer protocol private
- **Consumers:** qualified app composition and control-service binding
- **Forbids:** provider selection, app policy, control-service policy

#### `packages/civ7-mod-install`

- **Kind:** package
- **Role:** validate an already rendered Civ7 mod tree and compute an exact
  wholesale installation plan
- **Produces:** path grammar, tree comparison, replacement plans, digest
  algorithms, and typed receipt construction over supplied observations
- **Consumers:** the Swooper realization's `local-mod-install` adapter and the
  CLI app's `local-mods` adapter
- **Forbids:** rendering, mod identity, target selection, deployment semantics,
  filesystem access, compatibility, live proof, provider selection, and
  process lifecycle

The app adapters own directory discovery, reads, writes, and atomic
replacement. A CLI topic calls the CLI app-bound capability and owns no
filesystem writer. The package computes what an exact replacement means from
caller-supplied tree observations; deployment remains an outcome owned by the
matching mod realization app.

This package selects the generic package kind's `contract/` and `semantics/`
proof layers. Contract proves the narrow receipt and input surface; semantics
proves invalid identity rejection, replacement planning, stale-file
classification, counts, and digests without touching a host filesystem.
Adapter execution, deployment, and live acceptance remain with their qualified
owners.

#### `services/civ7-control`

- **Kind:** service
- **Role:** own live-game capability admission, policy, semantic operations,
  postcondition classification, uncertainty, and no-repeat outcomes
- **Produces:** contract-derived client
- **Consumes:** runtime-supplied ready Tuner and window-capture resources
  through its public client constructor
- **Consumers:** CLI topic adapters and Studio API projection
- **Forbids:** Tuner acquisition, ambient Civ7 globals, HTTP mounting

The current modules remain one service because they share one live-game
authority. Public `lifecycle` and `readiness` routes are retained through the
port migration. A later product-authority decision may rename or combine them;
relocation does not silently change the contract. OS application lifecycle is
not implied.

The service is rewritten directly onto the shared Habitat oRPC 2/Effect
substrate. Its public `client.ts` exports the contract, client factory, and
client type; it maps ready runtime-supplied dependencies into private module ports.
The aggregate router and implementation remain private service authority. No
facade or service-adapter project exists between the resource and this client
boundary.

#### `services/mapgen-runs`

- **Kind:** service
- **Role:** own host-scoped Save & Deploy and Run in Game admission, operation
  policy, adoption semantics, diagnostics, and public outcomes
- **Produces:** a contract-derived client and operation events
- **Consumes:** runtime-supplied authored-config, run-files, fresh-log,
  mod-realization, control, and clock capabilities
- **Consumers:** Studio API projection
- **Forbids:** recipe truth, HTTP transport, provider construction, app startup

The service's private model owns its scoped operation records, retention,
cancellation handles, and event source because those values have no independent
acquire/use/release capability and no consumer outside the service. The service
scope creates and finalizes them. Their former resource shape is deleted
rather than wrapped.

The service also owns the meaning and policy of run operations, including the
autoplay mutex and `AUTOPLAY_BLOCKED` outcome, and exposes that policy through
its explicit `autoplay` module. Admitted autoplay delegates mutation to the
control client.

The service owns its public operation contract on the shared substrate. The
Studio API projects that client through API-owned contracts; this service never
depends on a Studio caller contract.

Its authored-config dependency exposes one
`prepareAuthoredConfigWrite(...)` operation. That operation returns an opaque
prepared write carrying the admitted config identity plus `write()` and
`rollback()` capabilities; source paths and previous bytes remain private to
the Studio app's `swooper-map-config-source` adapter. Its mod-realization
dependency preserves
distinct materialize, deploy materialization, deploy saved configuration, and
release operations. The matching mod app owns realization outcomes, host
installation effects, and its Nx targets.

MapGen-runs owns the transaction order and public phase evidence: prepare,
write, transition from saving to deploying, deploy, and exact rollback after
either save or deploy failure. Folding source mutation into
`deploySavedConfiguration` is rejected because it would hide the saving phase
and combine definition and realization authority.

The MapGen-runs public construction face owns its typed semantic
dependency descriptors, their operation signatures, and their failure
vocabulary. The Studio app selects and binds exact config-source, run-files,
and fresh-log adapter identities; the Swooper realization selects and invokes
the exact local installation adapter and finite execution targets. This is
neither resource acquisition nor provider selection. The service imports no
app implementation, Node filesystem API, generated output, target
implementation, or installation package.

#### `plugins/server/api/mapgen-studio`

- **Kind:** shared plugin shell plus qualified Civ7 API projection
- **Role:** project Studio and control capabilities across the Studio
  same-origin caller boundary
- **Produces:** client and API-registration faces
- **Consumes:** public `civ7-control` and `mapgen-runs` clients plus
  official-data and saved-configuration capabilities supplied through
  app-materialized request context
- **Consumers:** MapGen Studio app
- **Forbids:** Tuner construction, product truth, process startup

The internal modules express caller-facing Studio groupings, not an independent
semantic service: `authoring` projects recipe/config work, `control` preserves
the caller-facing `civ7.*` surface, `runs` projects the MapGen runs service, and
`studio` projects host identity and event observation. The `civ7.autoplay`
contract remains in the API's caller-facing `control` grouping but invokes the
MapGen-runs `autoplay` operation, which owns mutex admission and delegates the
accepted mutation to the control client. The API adopts the shared plugin shell
plus a qualified Civ7 API projection law. It declares narrow API-owned client
requirements; the Studio app binds public control and run-service clients and
materializes the API `Context`. It owns no domain truth, operation registry, or
run-retention state. Its caller-facing source owns the
`studio.events.watch` projection. The Studio server composition supplies one
immutable `{ serverInstanceId, serverStartedAt }` identity per process scope;
the API emits its immediate `hello` first, then combines
operation and control observation streams, preserves ordering, replays the
latest live-game event, and closes subscriptions when its app-owned process
scope ends.

The 70 existing routes beneath the merged control-service namespaces retain
their public service contract as one indivisible subtree. The API control
module composes that subtree once and delegates through the public control
client; only Studio-specific control routes author API-local schemas. This
preserves the caller tree without a facade, type extraction, or duplicate
contract authority.

The API kind fixes `contract/client.typecheck.ts`. The API manifest selects the
`authoring`, `control`, `errors`, `router`, and `runs` projection identities
plus the `live-game-watcher` and `studio-events` execution identities. Each
selected identity owns one matching suite and every unselected leaf is
forbidden; `*.test.ts` is filename grammar only.

#### `plugins/cli/topics/{data,docs,game,git-mod,mapgen}`

- **Kind:** accepted Civ7 `cli-topic-plugin` ownership law; current
  path-selected roots remain legacy and unsealed until proof closure and
  manifest admission
- **Role:** project one stable command topic into the CLI app
- **Produces:** oclif commands and command-local presentation
- **Consumes:** public services, resources, or packages
- **Consumers:** CLI app registration
- **Forbids:** binary startup, reusable semantic truth, alternate transports

Each topic requires `test/tsconfig.json` and an exact path/leaf mirror from
every admitted `src/commands/<path>/<command>.ts` to
`test/commands/<path>/<command>.test.ts`. If source adapters are selected, the
same exact relation applies from `src/adapters/<path>/<adapter>.ts` to
`test/adapters/<path>/<adapter>.test.ts`; adapter suites prove adapter-local
translation plus any qualified host effect, failure translation, and cleanup,
but never command presentation or pure package semantics. No unmatched suite,
proof-only directory, or support cabinet is admitted.

The repo-owned `mapgen` topic is earned by the existing diagnostic and metric
command surface. It consumes the Swooper definition plus public
`@swooper/mapgen-diagnostics` and metrics packages; it owns argument parsing,
terminal presentation, and command errors only. The definition does not retain
Node command entrypoints merely because the commands happen to execute one
recipe.

#### `plugins/mod/map/swooper-physics`

- **State:** existing legacy product-definition owner under the partial
  `map-mod-project` envelope plus independently enforced nested MapGen laws;
  unadmitted until its qualified root, proof interior, and manifest anchor close
- **Role:** own Swooper's portable product definition
- **Produces:** finite domains, recipe, configuration, diagnostics, metrics,
  trace, visualization entrypoints, and pure authoring metadata
- **Consumes:** MapGen SDK/core and Civ7 static policy
- **Consumers:** Swooper mod app and Studio
- **Forbids:** generated files, filesystem access, deployment, live runtime
  acquisition

Its qualified cold-authoring interior is closed to
`authoring/{config,index,targets}.ts`. `config.ts` owns pure configuration
admission and serialization, `index.ts` is the sole `./authoring` package
subpath, and `targets.ts` is the finite cold metadata target table. The Studio
app's `swooper-map-config-source` adapter owns source discovery, reads, writes,
and rollback while consuming this pure authoring surface. Map proof is closed
to source-derived
domain/recipe ownership, exact `test/authoring/targets.test.ts`, and the finite
`maps/{catalog,configs}` grammar in the kind matrix.

#### `plugins/mod/civ/dacia`

- **Kind:** proposed qualified civilization-mod definition; currently
  `UNCONSTRUCTIBLE`
- **Role:** own Dacia's authored Civ7 content and stable mod identity
- **Produces:** finite mod definition
- **Consumes:** public SDK and static Civ7 policy
- **Consumers:** Dacia mod app
- **Forbids:** generated output, deployment, process lifecycle

Dacia remains at its current owner until independently closed civilization
definition and realization packets are accepted.

#### `apps/cli`

- **Kind:** accepted commandless `cli-shell` ownership law; current root remains
  a legacy, unsealed instance until manifest-anchor and proof migration
- **Role:** declare the CLI product and own the sole oclif topic-registration
  manifest
- **Produces:** CLI process
- **Consumes:** topic plugins, selected providers, and public service clients
- **Forbids:** command ownership, a second topic registry, and reusable control
  truth

`apps/cli/package.json#oclif.plugins` is the single authored membership
authority. The development and production launchers call native oclif
`run(...)` through one app-owned process scope;
using `execute(...)` is rejected because its process-exit behavior can bypass
outer finalizers.

The CLI app selects providers, binds service clients once for a command that
requires them, and exposes those clients through a scoped command context.
Topic-local semantic and diagnostic command bases carry static requirement
descriptors and narrow that context to the clients their commands require.
Native oclif command selection is the discovery event; app-owned binding then
satisfies only that command's requirements. The descriptors are neither a
second registry nor topic hooks. Commands do not import the app, provider, or a
topic-local client factory. Invocation facts from parsed flags remain command-
scoped views and never enter binding identity. The game topic receives only
the bound control client and never imports a resource or provider.

Help, version, and unknown-command paths acquire no live capability. Success,
command failure, binding failure, partial startup, and interruption all reach
one idempotent app finalizer before oclif reports the captured result.

The CLI root composes shared `app@1` with one qualified CLI specialization.
Habitat topology proves the app is commandless; a bounded source relation owns
the sole authored `package.json#oclif.plugins` registry and forbids duplicate
topic enumeration. Assembly proof observes collision-free native discovery,
the help catalog, and executable-shim equivalence. Execution proof owns exact
binding, no-acquisition help paths, partial-startup cleanup, interruption, and
idempotent command-process finalization.

#### `plugins/web/app/mapgen-studio`

- **Kind:** proposed qualified web-app projection; currently
  `UNCONSTRUCTIBLE`
- **Role:** own the MapGen Studio browser product surface
- **Produces:** browser role projection
- **Consumes:** Studio API client, public product definitions, and the retained
  `packages/mapgen-studio-ui` component library
- **Consumers:** MapGen Studio app definition
- **Forbids:** provider selection, process startup, private service source

Its manifest selects the exact view, interaction, and browser-execution proof
component identities classified from the migration corpus. Each selected
identity has one matching suite and every unselected suite is forbidden;
`*.test.tsx` is terminal filename grammar only.
This destination receives browser application source from
`apps/mapgen-studio`; it does not relocate or relabel the separate
`packages/mapgen-studio-ui` component package.

#### `apps/mapgen-studio`

- **Kind:** shared `app@1` plus qualified Studio host packet; qualified overlay
  pending before source movement
- **Role:** compose Studio's real Bun, Vite, server, and web hosts
- **Produces:** Studio product runtime
- **Consumes:** Studio web and API plugins, selected providers, public service
  clients, and app-owned adapters
- **Forbids:** Swooper truth, private service/API implementation, and an
  invented generic runtime layer

The app selects and acquires the Tuner and window-capture providers, constructs
the control and MapGen-runs public clients, materializes API context, mounts its
native roles, observes them, and disposes the process scope. These are host
composition responsibilities, not semantic product truth. No Studio source
moves until the qualified Studio source and proof overlays close these exact
roles.

The Studio app additionally selects the Swooper definition-authoring and
realization bindings used by MapGen-runs plus the cold official-data,
saved-configuration, run-files, and fresh-log bindings its selected
capabilities declare. Each semantic selection names one exact
`runtime/adapters/` identity. Those adapters derive qualified host paths from
app configuration and own filesystem effects while delegating pure
parsing, planning, and comparison to packages. The realization app owns opaque
deployment target references. The app selects Tuner and window-capture
providers, configuration roots, and adapter identities exactly once. Cold
filesystem adapters never become managed providers.

Each authored `server.ts`, `web.ts`, or `dev.ts` host entrypoint has one exact
`test/execution/hosts/<role>.test.ts`. Every selected runtime adapter has one exact
`test/execution/adapters/<adapter>.test.ts` suite. The app blueprint closes
those axes and forbids unmatched leaves; wildcard syntax describes only the
terminal filename grammar.

#### `apps/mods/{map/swooper-physics,civ/dacia}`

- **State:** Swooper is admitted by shared `app@1` plus closed qualified source
  and proof laws. Dacia remains unconstructed at its proposed destination
- **Role:** render, bundle, verify, and deploy one Civ7 mod identity
- **Produces:** generated mod artifact and live proof
- **Consumes:** matching mod definition plugin and runtime SDK
- **Forbids:** duplicate product definition and hand-authored generated output

The Swooper realization retains `gen:run-manifest` and `deploy:studio`
behavior and adds the corresponding app-owned deployment target for a
transient run materialization. Its `local-mod-install` adapter owns host
filesystem observation and replacement while consuming
the current installation package pending its Estate Reconciliation
reclassification. It exposes no reusable production module and no second CLI
process owns its deployment.

The closed runtime interior admits `src/runtime/file-plan.ts` for deterministic
mod-tree planning and
`src/runtime/run-manifest.ts` for transient manifest materialization. Concrete
Civ7 engine globals, setup, and the map-script loader live only under
`runtime/map-script/`; the reusable `packages/civ7-adapter` supplies their
contract, static metadata, and mock. These files are cold compiler or qualified
runtime input. They are not a service facade, provider, or callable app export.

The realization root composes shared `app@1` law rather than replacing it.
Published Habitat supplies structural authority but no product app-runtime
constructor. Accordingly, `src/build.ts` and `src/deploy.ts` are finite Nx
entrypoints, not wrappers around an invented descriptor/profile runtime. The
qualified law closes the `local-mod-install` adapter plus artifact, deployment,
runtime-compatibility, and live axes. No live target has passed; the
`.live.test.ts` leaves run only through uncached live targets.

#### `apps/docs` and `apps/playground`

- **State:** legacy product/app roots pending classification and manifest-backed
  specialization
- **Role:** preserve the current Mintlify/content app and build/example app
- **Disposition:** remain at their current roots in this initiative
- **Forbids:** being forced into Studio's qualified app law

## Deferred Candidate Cards

### App UI controller

Candidate shape:

```text
plugins/mod/ui/civ7-control/
apps/mods/ui/civ7-control/
```

Admission requires a concrete same-realm consumer or a proven asynchronous
host ingress, separate shell/game lifecycle facts, deployment/version
negotiation, and live proof. Commit `8d0d4983ba` already removed the unconsumed
intelligence bridge; that completed receipt is not a candidate implementation
to rename or restore.

### Tuner protocol package

Candidate shape:

```text
packages/civ7-tuner-protocol/
```

Admission requires a second independent consumer of the framing and
command/result codecs. With one local-socket provider, those details remain
private provider implementation.

### Desktop app control

Candidate shape:

```text
resources/desktop-app/
  providers/macos/
```

Admission requires a working launch/quit/restart capability and an app-owned
Civ7 descriptor. `Network.restartGame()` does not prove OS process control.

### Durable workflows

Candidate shape:

```text
plugins/async/workflows/<workflow>/
```

Admission requires work that genuinely crosses a request lifecycle through
resume, retry, schedule, fanout, or durable progress. Request-local Studio run
behavior does not qualify merely because it has multiple steps.

## Law Adoption

Adopt only the selected Habitat 0.5.2 consumer packets, never dormant or
unselected SDK material:

- resource/provider separation;
- independent selected-depth blueprint law;
- local Civ7 service truth and qualified plugin projection;
- exact public entries and private implementation closure;
- proof ownership by kind;
- closed generic app structure plus qualified native host composition;
- structure and source relationships in Habitat, graph scheduling in Nx,
  types in TypeScript, and behavior in tests.

Habitat 0.5.2 does not select service or product-runtime law. Existing local
Civ7 service authority therefore remains the destination for service source,
while qualified app overlays govern native Oclif, Bun, Vite, server, web, and
finite Nx task composition. This is an explicit authority reconciliation, not
permission to copy dormant SDK packets.

Civ7 adds only qualified product facts:

- Bun/Nx/package envelopes that the shared project kind does not already own;
- the accepted Civ7 CLI topic law plus Studio, web, and mod-realization
  specializations;
- map and civilization mod-definition kinds;
- Civ7 product identities, capabilities, policies, and proofs.

Do not retain or import:

- Civ7's oRPC 1, patched `effect-orpc`, or legacy service topology;
- Magic product names, inventories, or runtime providers;
- an older staged/template packet when a newer shared authority exists;
- an implied universal mod, workflow, or host kind;
- instance-specific roots inside generic blueprint patterns.

The inspected Template CLI packets are not imported while they use
`plugins/cli/commands/*` as the package family or require app-owned
`src/commands`. Those upstream packets must converge on Civ7's model:
`apps/cli` is a commandless shell, and `plugins/cli/topics/*` are topic
packages with commands nested inside each topic.
