# Civ7 Capability Realization Topology

**Status:** Proposed decision
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
        service/
          habitat.toml
          {base,contract,impl,router}.ts
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
    rawr.civ7.ts
    civ7.ts
    bin/
      run.js
    runtime/
      config.ts
      processes.ts
      profiles/
        <profile>.ts
    test/
      definition.test.ts
      assembly/
        shell.test.ts
      profiles/
        <profile>.test.ts
      entrypoints/
        civ7.test.ts
      tsconfig.json
    tsconfig.json
  mapgen-studio/
    habitat.toml
    package.json
    project.json
    rawr.mapgen-studio.ts
    server.ts
    web.ts
    dev.ts
    runtime/
      config.ts
      processes.ts
      adapters/
        civ7-official-data.ts
        civ7-save-files.ts
        fresh-log-files.ts
        studio-run-files.ts
        swooper-map-config-source.ts
      profiles/<profile>.ts
    test/
      definition.test.ts
      profiles/<profile>.test.ts
      entrypoints/{server,web,dev}.test.ts
      execution/
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
      rawr.swooper-physics.ts
      build.ts
      deploy.ts
      runtime/
        adapters/
          local-mod-install.ts
        config.ts
        processes.ts
        profiles/
          local-civ7.ts
        file-plan.ts
        map-script/
          adapter.ts
          entrypoint.ts
          setup.ts
        run-manifest.ts
        targets.ts
      test/
        definition.test.ts
        profiles/
          local-civ7.test.ts
        entrypoints/
          build.test.ts
          deploy.test.ts
        execution/
          adapters/
            local-mod-install.test.ts
        artifact/<selected-artifact-id>.test.ts
        deployment/<selected-deployment-id>.test.ts
        [runtime/<selected-runtime-id>.test.ts]
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

The reusable service source packet is selected at each shown `src/service`
anchor. It owns no `test/` interior: standalone service roots own their
contract, module-semantics, and execution proof, while the API root owns its
contract, projection, and selected execution proof. Each kind fixes its anchor
leaves directly. Source-shaped proof mirrors admitted source identities one for
one; for example, every admitted app profile and role entrypoint has exactly
one matching suite. API, web, and qualified product manifests select only the
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
host adapter. Runtime profiles select the macOS provider. The control service
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
- **Consumers:** shared runtime provisioning and control-service binding
- **Forbids:** provider selection, app profile, control-service policy

#### `packages/civ7-mod-install`

- **Kind:** package
- **Role:** validate an already rendered Civ7 mod tree and compute an exact
  wholesale installation plan
- **Produces:** path grammar, tree comparison, replacement plans, digest
  algorithms, and typed receipt construction over supplied observations
- **Consumers:** the Swooper realization's `local-mod-install` adapter and the
  git-mod topic's `local-mods` adapter
- **Forbids:** rendering, mod identity, target selection, deployment semantics,
  filesystem access, compatibility, live proof, provider selection, and
  process lifecycle

The app/topic adapters own directory discovery, reads, writes, and atomic
replacement. The package computes what an exact replacement means from
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
vocabulary. The Studio app selects exact config-source, run-files, and
fresh-log adapter identities; the Swooper realization selects the exact local
installation adapter and cold execution targets. Shared runtime lowers those
selections into ready capabilities during service binding without restating
operation keys or types. This is neither resource acquisition nor provider
selection. The service imports no app implementation, Node filesystem API,
generated output, target implementation, or installation package.

#### `plugins/server/api/mapgen-studio`

- **Kind:** plugin-server-api root with independently selected shared
  service-source projection
- **Role:** project Studio and control capabilities across the Studio
  same-origin caller boundary
- **Produces:** client and API-registration faces
- **Consumes:** public `civ7-control` and `mapgen-runs` clients plus
  official-data and saved-configuration capabilities supplied through
  runtime-materialized request context
- **Consumers:** MapGen Studio app
- **Forbids:** Tuner construction, product truth, process startup

The internal modules express caller-facing Studio groupings, not an independent
semantic service: `authoring` projects recipe/config work, `control` preserves
the caller-facing `civ7.*` surface, `runs` projects the MapGen runs service, and
`studio` projects host identity and event observation. The `civ7.autoplay`
contract remains in the API's caller-facing `control` grouping but invokes the
MapGen-runs `autoplay` operation, which owns mutex admission and delegates the
accepted mutation to the control client. The API adopts the
shared Habitat API-plugin plus service-source construction laws directly. It declares
narrow API-owned service requirements; the shared runtime binds public control
and run-service clients and materializes the API `Context`. It owns no domain
truth, operation registry, or run-retention state. Its selected service source owns
the caller-facing `studio.events.watch` projection. The shared process runtime
supplies one immutable `{ serverInstanceId, serverStartedAt }` identity per
process scope; the API emits its immediate `hello` first, then combines
operation and control observation streams, preserves ordering, replays the
latest live-game event, and closes subscriptions when its runtime scope ends.

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
forbidden; `*.test.ts` is filename grammar only. The selected service source at
`src/service` owns no nested proof.

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
- **Consumes:** topic plugins and shared runtime realization
- **Forbids:** command ownership, a second topic registry, provider
  acquisition, and reusable control truth

`apps/cli/package.json#oclif.plugins` is the single authored membership
authority. The cold app definition references the oclif host but does not
enumerate topic packages again. The development and production launchers both
select the same app, profile, and `cli` role through one shared oclif harness.
That harness calls native oclif `run(...)` inside a managed process scope;
using `execute(...)` is rejected because its process-exit behavior can bypass
outer finalizers.

The runtime profile selects providers. Shared runtime provisions resources,
binds service clients once for the one-command process, and exposes them
through a scoped runtime command context. Topic-local semantic and diagnostic
command bases carry static cold requirement descriptors and narrow that context
to the clients their commands require. After native oclif selects a command
class, shared base initialization asks the surrounding harness to provision
and bind only that class's requirements. The descriptors are neither a second
registry nor topic hooks. Commands do not import the app, profile, provider,
process runtime, or a topic-local client factory. Invocation facts from parsed
flags remain command-scoped views and never enter the service-binding cache.
The runtime profile selects the Civ7 window-capture provider required by the
control service; the game topic receives only the bound control client and
never imports the resource or provider.

Help, version, and unknown-command paths acquire no live capability. Success,
command failure, binding failure, partial startup, and interruption all reach
one idempotent finalizer before oclif reports the captured result. The current
shared runtime is only a type-environment marker, so this oclif host bridge and
runtime-aware command base are shared-substrate prerequisites rather than
Civ7-local compensation.

The CLI root composes the shared app proof with one CLI specialization:
`test/definition.test.ts`, exact `test/profiles/<profile>.test.ts`, exact
`test/entrypoints/civ7.test.ts`, `test/assembly/shell.test.ts`, and one
`test/tsconfig.json`. Habitat topology proves the app is commandless; a bounded
source relation owns the sole authored `package.json#oclif.plugins` registry
and forbids duplicate topic enumeration. The CLI-specific assembly suite
observes only collision-free runtime discovery, the help catalog,
executable-shim equivalence, and delegation to the shared harness. The shared
definition, profile, and entrypoint layers retain their distinct oracles;
shared runtime owns command-process lifecycle proof.

#### `plugins/web/app/mapgen-studio`

- **Kind:** proposed qualified web-app projection; currently
  `UNCONSTRUCTIBLE`
- **Role:** own the MapGen Studio browser product surface
- **Produces:** browser role projection
- **Consumes:** Studio API client and public product definitions
- **Consumers:** MapGen Studio app definition
- **Forbids:** provider selection, process startup, private service source

Its manifest selects the exact view, interaction, and browser-execution proof
component identities classified from the migration corpus. Each selected
identity has one matching suite and every unselected suite is forbidden;
`*.test.tsx` is terminal filename grammar only.

#### `apps/mapgen-studio`

- **Kind:** proposed shared generic app plus qualified Studio role packet;
  currently `UNCONSTRUCTIBLE`
- **Role:** declare Studio plugin membership, provider profiles, and server/web
  entrypoint role selections
- **Produces:** Studio product runtime
- **Consumes:** Studio web and API plugins plus app-owned runtime profiles
- **Forbids:** resource acquisition, manual service binding, manual API context,
  transport mounting, Swooper truth, private service/API implementation

The shared runtime compiler, provisioning kernel, process runtime, and
harnesses acquire the selected Tuner and window-capture providers, bind the
control and MapGen-runs services, materialize API context, mount the selected
roles, observe, and dispose. The app does not recreate that substrate. No
Studio source moves into these semantic destinations until the shared generic
app law and independently closed web/Studio specializations are accepted.

The Studio app additionally selects the Swooper definition-authoring and
realization bindings used by MapGen-runs plus the cold official-data,
saved-configuration, run-files, and fresh-log bindings its selected
capabilities declare. Each semantic selection names one exact
`runtime/adapters/` identity. Those adapters derive qualified host paths from
profile-supplied roots and own filesystem effects while delegating pure
parsing, planning, and comparison to packages. The realization app owns opaque
deployment target references. The runtime profile selects the Tuner and
window-capture providers plus configuration roots, never adapter identities.
Shared runtime resolves and binds all of them; cold filesystem adapters never
become managed providers.

Every admitted `runtime/profiles/<profile>.ts` has exactly one
`test/profiles/<profile>.test.ts`, and each authored `server.ts`, `web.ts`, or
`dev.ts` role entrypoint has its exact `test/entrypoints/<role>.test.ts`.
Every selected runtime adapter has one exact
`test/execution/adapters/<adapter>.test.ts` suite. The app blueprint closes
those axes and forbids unmatched leaves; wildcard syntax describes only the
terminal filename grammar.

#### `apps/mods/{map/swooper-physics,civ/dacia}`

- **State:** Swooper is an existing legacy realization owner under the partial
  map envelope plus independently enforced product laws; it remains unadmitted
  until the qualified realization root, proof interior, and anchor close. Dacia
  remains `UNCONSTRUCTIBLE` at the proposed destination
- **Role:** render, bundle, verify, and deploy one Civ7 mod identity
- **Produces:** generated mod artifact and live proof
- **Consumes:** matching mod definition plugin and runtime SDK
- **Forbids:** duplicate product definition and hand-authored generated output

The Swooper realization retains `gen:run-manifest` and `deploy:studio`
behavior and adds the corresponding app-owned deployment target for a
transient run materialization. Its `local-mod-install` adapter owns host
filesystem observation and replacement while consuming
`packages/civ7-mod-install` for pure validation, planning, and receipt
construction. It exposes no reusable production module; shared runtime binds
only the selected semantic target.

Its `rawr.swooper-physics.ts` descriptor declares the matching definition and
implements the public MapGen-runs realization dependency through
`runtime/targets.ts`. The closed runtime interior also admits
`runtime/file-plan.ts` for deterministic mod-tree planning and
`runtime/run-manifest.ts` for transient manifest materialization. Concrete
Civ7 engine globals, setup, and the map-script loader live only under
`runtime/map-script/`; the reusable `packages/civ7-adapter` supplies their
contract, static metadata, and mock. These files are cold compiler or qualified
runtime input. They are not a service facade, provider, or callable app export.

The realization root composes the generic app law rather than replacing it:
`local-civ7.ts` is the selected profile and `build.ts` plus `deploy.ts` are the
selected role entrypoints, with exact matching generic app suites. Its
qualified manifest and `runtime/targets.ts` then select the exact
`local-mod-install` adapter plus artifact, deployment, optional
generated-runtime, and live proof identities. Each identity maps to one suite;
wildcard suffixes are grammar only. No current
Swooper test exercises a real Civ7 loader or runtime observation, so none is
genuine live proof; the `.live.test.ts` leaves must be newly authored and run
only through the uncached live target.

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
negotiation, and live proof. Until then, the current intelligence bridge is
removed rather than renamed.

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

Adopt only from the accepted corrected shared Habitat successor, never from
the inspected audit baseline:

- resource/provider separation;
- the oRPC 2 and official Effect service lineage;
- independent selected-depth blueprint law;
- service truth and qualified plugin projection;
- exact public entries and private implementation closure;
- proof ownership by kind;
- canonical app definition/profile/entrypoint semantics and shared runtime
  realization;
- structure and source relationships in Habitat, graph scheduling in Nx,
  types in TypeScript, and behavior in tests.

The accepted corrected shared successor uses `src/api.ts` and `src/client.ts`
for an API plugin's public faces, keeps its executable router private, and uses
a module-root `router.ts` plus operation router leaves. Older Magic or Civ7
`server.ts` and `router/index.ts` shapes are migration evidence, not
destination law.

The canonical runtime realization spec governs ownership and lifecycle:
plugins declare service use, profiles select providers, and runtime
realization binds and mounts them. Its older flat API file sketch is not
selected over the newer concrete Habitat API and service packets. This is an
explicit authority reconciliation, not a second API topology.

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
