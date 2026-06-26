## ADDED Requirements

### Requirement: Grit is a substrate provider capability

Grit implementation code SHALL live under
`tools/habitat-harness/src/substrate/providers/grit/**`. The provider root
SHALL expose the Grit resource definition, provider layers, request builders,
and Effect programs; it SHALL NOT expose provider-local Promise/runtime
bridges.

#### Scenario: Grit resource is provisioned through runtime layers

- **WHEN** service modules execute Grit-backed checks
- **THEN** they call Effect programs that require the Grit provider resource
- **AND** service/runtime layer composition provides the Grit provider
- **AND** Grit provider files do not call `Effect.runPromise` or accept
  caller-passed provider layers

### Requirement: Habitat internal boundary topology has no adapter layer

Habitat internal Nx boundary topology SHALL use architectural roots that map to
active source owners only: substrate, providers, core, service, workspace, and
host.

#### Scenario: Nx infers Habitat internal projects

- **WHEN** the Habitat Nx plugin materializes inferred internal projects
- **THEN** it does not emit `@internal/habitat-harness-adapters`
- **AND** it emits `@internal/habitat-harness-providers` for
  `tools/habitat-harness/src/substrate/providers`
- **AND** no dependency constraint references `habitat:adapter`

### Requirement: Structural enforcement uses Habitat tooling

Grit provider topology SHALL be guarded through Habitat/Nx/GritQL/Biome-owned
mechanisms rather than structure-only tests.

#### Scenario: Grit provider-domain rule is authored as Habitat GritQL

- **WHEN** Habitat validates provider-domain ownership
- **THEN** the active Habitat rule is a `.habitat/rules/**` record with
  `ownerTool: "grit-check"`
- **AND** the executable pattern lives under `.habitat/patterns/checks/**`
- **AND** no toolkit-local `source-check/rules/**` script is created for that
  provider-domain invariant
