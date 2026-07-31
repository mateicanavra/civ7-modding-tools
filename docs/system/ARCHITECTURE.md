# Architecture

## Model

Civ7 Modding Tools composes actor-facing capabilities through six system
roles:

```text
pure package or product definition
  -> managed foreign capability where needed
  -> semantic service where product transitions exist
  -> caller projection
  -> app-declared composition
  -> shared runtime realization
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
| Resource/provider | Provider-neutral readiness/failure plus one concrete acquire/use/release implementation | Product policy, caller UX, app profile selection |
| Service | Semantic facts, admission, policy, transitions, correction, private implementation, public client | Transport mounting, provider selection, process startup |
| Plugin | CLI/API/web/workflow/mod-definition projection | Reusable product truth, private service implementation, process lifetime |
| App | Cold composition, profiles, role entrypoints, qualified adapters, realization proof | Reusable semantics, provider lifecycle implementation, a second service contract |
| Shared runtime | Interpret app composition, acquire providers, bind clients, mount roles, observe and dispose process scope | Civ7 product policy |

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
- The control service owns live gameplay meaning. The current
  `@civ7/direct-control` package still mixes Tuner lifecycle, native lowering,
  and diagnostics; it remains a documented hybrid until the whole consumer
  corpus can move together.
- The CLI app owns oclif startup and topic registration only. Topic plugins own
  command UX and call public clients or qualified adapters.
- Studio's browser, API projection, semantic run operations, cold host adapters,
  and process realization are different responsibilities even where current
  source still combines them.

## Construction Gate

The shared Habitat platform owns the construction grammar upstream. Civ7
selects and composes accepted kinds; it does not fork or approximate them.
Target source moves wait until the corrected usable substrate pin and selected
kind law are constructible in this repository.

Current behavior, accepted destination ownership, constructibility, migration,
and proof remain separate claims. The normative packet, exact source corpus,
and proof ledger are under
[Civ7 Capability Realization](../projects/civ7-capability-realization/).

## Component Guides

- [SDK](sdk/overview.md)
- [CLI](cli/overview.md)
- [MapGen](libs/mapgen/)
- [Swooper Physics](mods/swooper-maps/architecture.md)
- [Direct Control](direct-control/)
