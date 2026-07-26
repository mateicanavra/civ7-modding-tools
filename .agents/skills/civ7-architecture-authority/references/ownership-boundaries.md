# Ownership Boundaries

Use this reference when placing a symbol, file, helper, generated artifact, doc, test, or runtime call.

## SDK

Owns:

- public TypeScript mod authoring APIs;
- builders, nodes, XML file abstractions, localizations, and mod output contracts;
- SDK constants and type-level ergonomics for mod authors.

Does not own:

- CLI command UX;
- MapGen pipeline internals;
- Civ7 engine runtime calls;
- generated `dist/` output as editable source;
- official resource extraction mechanics.

## CLI

Owns:

- user-facing commands, flags, help, command errors, and command orchestration;
- config/root resolution for command execution;
- integration of plugin workflows into command I/O.

Does not own:

- reusable graph/file/git/mod logic that belongs in plugin packages;
- SDK builder semantics;
- game runtime adapter calls;
- generated resources or generated docs as source.

## Plugin Libraries

Own:

- reusable pure mechanics such as files, graph crawling/rendering, git helpers, and mod management primitives.

Do not own:

- CLI argument parsing and command UX;
- SDK domain concepts unless the plugin is explicitly SDK-facing;
- package-specific side effects unless named by the plugin contract.

## Config Package

Owns:

- workspace config schema, parsing, validation, and path resolution shared across tools.

Does not own:

- command-specific policy;
- package-specific defaults that belong to the package or mod;
- generated artifact content.

## Civ7 Types

Owns:

- type definitions for Civ7 runtime scripting and engine globals.

Does not own:

- runtime adapter implementation;
- MapGen or SDK behavior;
- generated mod output.

## Civ7 Adapter

Owns:

- direct imports of Civ7 engine globals and `base-standard` APIs;
- translation from engine/runtime APIs into stable adapter methods.

Does not own:

- MapGen algorithms or recipe semantics;
- mod tuning/content decisions;
- pure SDK XML generation logic.

## MapGen Core

Owns:

- stage/step/recipe authoring APIs, config compilation, and plan/execution contracts;
- artifact admission/publication, deterministic execution, tracing, and generic
  algorithm/data-structure primitives.

Does not own:

- direct Civ7 engine imports;
- game-facing bootstrap files;
- generated mod output;
- MapGen Studio UI;
- Swooper domain models, operations, recipes, or product tuning. Purity and
  possible reuse do not make N=1 product logic part of the SDK.

## MapGen Viz And Apps

Own:

- visualization contract types, viewers, workers, streaming/dump protocols, and UI behavior.

Do not own:

- MapGen generation truth;
- game runtime projection;
- generated mod artifacts.

## Swooper Maps Mod

Owns:

- Foundation, Morphology, Hydrology, Ecology, Resources, and Placement domain
  models and operations;
- recipes, product policy, game-facing map integration, mod package scripts,
  and Civ7 deployment output generation.

Does not own:

- generic SDK/runtime mechanics already owned by a named substrate;
- adapter internals;
- hand-edited `mod/` output.

## MapGen Domain Module Layout

Normalized internal layout for `mods/mod-swooper-maps/src/domain/<domain>/`:

- The domain root is an aggregate semantic router: `contract.ts`, `router.ts`,
  public `index.ts`, `modules/`, and an optional `model/` for vocabulary proven
  shared by multiple direct modules.
- Each `modules/<module>/` is the cohesive owner of one operation family. It
  owns `contract.ts`, `router.ts`, `index.ts`, `ops/`, any immutable artifacts
  it produces, and an optional local `model/`.
- `ops/<op-id>/` owns one operation contract and implementation. Its complete
  input/output envelopes are inline in `contract.ts`; strategies and rules do
  not reconstruct types from those envelopes or from artifact schemas.
- `model/atoms/` owns only small composable schema primitives or cohesive
  subentities. `model/policy/` owns stable decisions at the lowest domain or
  module scope that covers every real consumer. Neither is a helper or config
  cabinet.
- `artifacts/` lives with the direct producing module. Each
  `<artifact>.artifact.ts` owns one inline `defineArtifact` authority, and the
  adjacent `index.ts` is that module's sole artifact catalog.

The accepted positive kind laws live under `.habitat/blueprints/domain*` and
`.habitat/blueprints/artifact`; use those structures rather than preserving a
flat compatibility layout.

## Official Resources

Own:

- external game-data facts used as evidence and fixtures.

Do not own:

- repo architecture;
- SDK public API names;
- MapGen stage topology;
- generated-output edit authority.

## Docs

Own:

- durable architecture, product, process, testing, ADR, deferral, and project-control records.

Do not own:

- executable behavior unless paired with source/tests;
- volatile chat status in canonical docs;
- project scratch as evergreen authority.
