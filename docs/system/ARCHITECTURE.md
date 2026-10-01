# Architecture

## Model

Civ7 Modding Tools composes actor-facing capabilities through six system
roles:

```text
pure package or product definition
  -> managed foreign capability where needed
  -> semantic service where product transitions exist
  -> caller projection
  -> qualified app composition and native host entrypoint
  -> external system and owner-issued evidence
```

The chain is not mandatory ceremony. Pure authoring may stop at a package or
definition. A service is earned only by semantic capability authority. A
resource is earned only by acquired foreign lifecycle. A workflow is earned
only when work must outlive one request.

## Authority

| Role | Owns | Does not own |
| --- | --- | --- |
| Package | Pure contracts, algorithms, parsing, planning, comparison, static policy | Host acquisition, product write authority, projection, process startup |
| Resource | Provider-neutral external-capability contract, lifecycle vocabulary, ready value, and typed failures | Concrete acquisition, product policy, caller projection, or provider selection |
| Provider | One concrete acquisition, health, interruption, and release implementation | Product policy, provider selection, process composition, or caller UX |
| Service | Semantic facts, admission, policy, transitions, correction, private implementation, public client | Transport mounting, provider selection, process startup |
| Plugin | CLI/API/web/workflow/mod-definition projection | Reusable product truth, private service implementation, process lifetime |
| App | Runtime configuration, provider selection, ready-capability acquisition, public-client binding, plugin mounting, native role entrypoints, qualified adapters, process lifetime, and realization proof | Reusable semantics, provider implementation, or a second service contract |

Every relation must read in one direction: `defines`, `derives`, `acquires`,
`selects`, `binds`, `calls`, `projects`, `realizes`, `observes`, or `proves`.
Imports are evidence of those relations, not the architecture itself.

## Durable Boundaries

- Official Civ7 resources are identified source evidence. Generated types and
  policy are deterministic derived contracts, not runtime truth.
- The SDK owns portable mod authoring. A definition owns product-specific
  content; a realization owns generated files, installation, loader behavior,
  and live proof.
- MapGen Core owns generic authoring and execution mechanics. Swooper Physics
  owns its domains, recipe, product diagnostics, metrics, trace, and
  visualization.
- A MapGen artifact is deterministic pipeline truth. A Civ7 readback is
  epoch-scoped engine observation.
- `services/civ7-control` owns foundational `{app,game,map,ui}` interpretation
  and native operations over app-supplied ready resources.
  `services/civ7-play` owns actor-facing attention, planning, gameplay
  decisions, reconciliation, no-repeat policy, and next-action meaning over the
  public control client. The current `packages/civ7-direct-control` tree is
  frozen migration corpus, not continuing architecture authority.
- The CLI app owns oclif startup and topic registration only. Topic plugins own
  command UX and call public clients or qualified adapters.
- Studio's browser, API projection, semantic run operations, cold host adapters,
  and process realization are different responsibilities even where current
  source still combines them.

## Construction Gate

The shared Habitat platform owns generic construction grammar upstream. Civ7
consumes the installed 0.5.2 release, selects and composes accepted kinds, and
does not fork or approximate them. Shared shells being ready does not admit a
missing Civ7-qualified overlay; target source moves only after its exact local
law and proof topology are closed.

Current behavior, accepted destination ownership, constructibility, migration,
and proof remain separate claims. The normative packet, exact source corpus,
and proof ledger are under
[Civ7 Capability Realization](../projects/civ7-capability-realization/).

## Component Guides

- [SDK](sdk/overview.md)
- [CLI](cli/overview.md)
- [MapGen](libs/mapgen/)
- [Swooper Physics](mods/swooper-maps/architecture.md)
- [Live Control Evidence And Migration](direct-control/)
