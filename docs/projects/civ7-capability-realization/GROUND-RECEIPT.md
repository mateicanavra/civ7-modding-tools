# Civ7 Capability Realization Ground Receipt

**Status:** Passed; Civ7 consumes the released Habitat substrate
**Date:** 2026-08-06; consumer release updated 2026-08-07
**Container:** [WORKSTREAM.md](./WORKSTREAM.md#container-0-ground)
**Frame:** [FRAME.md](./FRAME.md)

## Decision

Ground is closed. Civ7 originally proved the released `0.5.2` substrate,
consumed the compatible `0.5.4` provider repair, and now consumes the exact
released `@habitat-ai/cli@0.5.5` development dependency. The CLI carries
`@habitat-ai/sdk@0.5.5` as its exact ordinary dependency and projects the shared
Nx targets. The workspace-local Habitat producer, bootstrap path, virtual
projects, tests, and temporal authority workspace remain retired.

Civ7 retains only its instances, qualified overlays, product policy, adapters,
and compatibility rules. It does not copy, fork, or reinterpret the shared
laws. The selected shared pack is exactly `app@1`, `package@1`, `plugin@1`,
`plugin-nx@1`, `provider@1`, and `resource@1`. `service@1` is intentionally not
selected in `0.5.5`. That is an upstream construction refusal, not local design
space: Civ7 does not author generic service law and will not construct a new
service until the Habitat owner publishes the shared kind. The obsolete local
service compatibility packets are retired; the legacy service retains no
generic local authority while its behavior awaits destination reconciliation.

## Release Authority

| Artifact | Exact identity | Ground result |
| --- | --- | --- |
| Habitat source release | tag `habitat-cli-v0.5.2`; source `92482052a7878d47085a14831bf3d6098f2b2d5d` | Accepted upstream release authority |
| Template consumer proof | canonical `main` at `ee03d1c7e065c779fb63f9c57a1c0d2e121c1630` | Accepted canonical first-consumer receipt |
| Habitat release proof | workflow `31070676131`; final repository ratchet `31075870726` | Both green at handoff |
| Habitat CLI | `@habitat-ai/cli@0.5.2`; Bun lock integrity `sha512-/gDZg9sWYkOxoYpzMS/XqSIJ8QxfOWffYjPDWTc7ALIsOWuQ8LafPRrB61YueQXH/V9fKdR2z//3ol65kMh/nw==` | Installed as the sole direct Habitat development dependency |
| Habitat SDK | `@habitat-ai/sdk@0.5.2`; Bun lock integrity `sha512-xz/bRXej6swKJLRruo7Bj/UZLxcZGVCGKtpiaue3dALmcHK2aMtT5kKrtEb04nYPFx3twd70AVoPLY8bOYimsw==` | Installed only as the CLI's exact ordinary dependency |

The table above is the immutable original Ground receipt. At the next natural
consumer boundary, Civ7 advanced without reopening or forking Ground. This
intermediate table records the `0.5.4` provider repair:

| Current artifact | Exact identity | Consumer result |
| --- | --- | --- |
| Habitat source release | tag `habitat-cli-v0.5.4`; source `4c9d25a012e66636e8847c619ce8d8e45ca53954` | Accepted upstream release authority |
| Habitat CLI | `@habitat-ai/cli@0.5.4`; Bun lock integrity `sha512-StmnVRlTwgG/gEEXiJ8+jwdGE83TbOB70HaEGpPFp4E/SE40EE5fitLaxV8HDcfcU8FGlAu8MtQDqL1mhOJC5Q==` | Sole direct Habitat development dependency; registry provenance present |
| Habitat SDK | `@habitat-ai/sdk@0.5.4`; Bun lock integrity `sha512-YUAJ6tUU+rU8OkGrfHkHj25g/MeESDKnNU63Cr3gTMyac4h58fTC9rubkZjVXZqNJPx7OfIiEl5yKNdNo1mByQ==` | Exact ordinary CLI dependency; registry provenance present |
| Full Civ7 owner corpus | `civ7-adapter`; 1,815 authority-derived subjects | Evaluated with zero findings and no local rule narrowing |

The current consumer boundary is:

| Current artifact | Exact identity | Consumer result |
| --- | --- | --- |
| Habitat source release | tag `habitat-cli-v0.5.5`; source `9e0abc792e8a9bcb564c5f48625fa65a8e964e0d` | Accepted upstream release authority |
| Habitat release proof | workflow `31179940952`; canonical release record `dfecba06b52b44a489e5e20d330b8a21bf4eea3e` | Registry-installed native Nx proof and release settlement accepted |
| Habitat CLI | `@habitat-ai/cli@0.5.5`; Bun lock integrity `sha512-pvmKNIG6EqdXtKF2E2u7DonEtHnOtZzDkuHp7v4G93dg0G1RwYMbWiXuQz5hRYiBci8Wu7TVEU7YMMwCQ+QpIg==` | Sole direct Habitat development dependency; registry provenance present |
| Habitat SDK | `@habitat-ai/sdk@0.5.5`; Bun lock integrity `sha512-HgnzE13hZe9W0OgKUiYWfi5zCnTMrbK5L7M80++7qEeSgYzTO/rd+mL/0XLnMi7JmHZqkuDjNGSsQD/p7UxMuQ==` | Exact ordinary CLI dependency; registry provenance present |
| Full Civ7 owner corpus | `civ7-adapter`; 1,815 authority-derived subjects | Evaluated under the resolved `0.5.5` pack with zero findings and no local rule narrowing |

The current published CLI declares Bun `>=1.3.14`, Node `^24.18.1`, an internal
Nx Devkit `23.1.1` dependency, Oclif `^4.13.2`, and TypeBox `1.3.8`.
`habitat resolve` reports policy pack `@habitat-ai/sdk@0.5.5`, schema version 3,
and exactly the six selected shared
blueprints above.

## Consumer Proof

| Proof class | Evidence | Result |
| --- | --- | --- |
| Exact installation | Frozen `bun.lock`; only `@habitat-ai/cli@0.5.5` is direct and the installed SDK resolves exactly to `0.5.5` | Passed |
| Native upgrade | Native Nx migrations advanced Habitat to `0.5.5` and aligned `nx`, `@nx/eslint-plugin`, `@nx/storybook`, and `@nx/web` at `23.1.1` | Passed |
| Upgrade idempotence | Repeated native migrations applied no package updates and produced no `migrations.json` | Passed |
| Initializer application | Original consumer admission through `bunx nx generate @habitat-ai/cli:init --no-interactive` | Passed |
| Current initializer dry run | `bunx nx generate @habitat-ai/cli:init --dry-run --no-interactive` left the initialized consumer unchanged | Passed; the `0.5.5` existing-consumer contract requires no initializer rerun |
| Stable initialized files | SHA-256 after the `0.5.5` migration: `nx.json` `d61aadf2180aef515954aa0f78ace6d479c33ae1c43f7441c5e8a08d58722fae`; `package.json` `e614997e7308ea24767920e4c9e5441e6eaeb5acdcfab7aee704cb9de548946e`; `.codex/hooks.json` `c0bdf3facce0b6d709dd3ac0b121037cf96a816d0c242a0a1f9f525ffe365a27` | Recorded after frozen installation and idempotent native migration |
| Resolved policy pack | Current `habitat resolve` exposes exactly the six selected shared kinds and no `service@1` | Passed under `0.5.5` |
| Original shared-kind fixture | Disposable instances of all six selected kinds resolved and passed their closed structure laws | Passed; historical Ground proof |
| Original closed-law falsifier | One injected loose member was refused by every selected shared kind | Passed; historical Ground proof |
| Unsupported-kind refusal | Current catalog omits `service@1`; the original disposable instance was refused with `authority-blueprint-missing` | Current omission confirmed; original no-write falsifier preserved |
| Original compatibility structure | 26 of 26 Habitat structure applications at the original Ground seal | Passed; historical receipt |
| Original compatibility syntax | 76 of 76 Grit applications at the original Ground seal | Passed; historical receipt |

The compatibility rows preserve the original inherited-estate proof. The
superseded service packets are no longer current authority and were deleted
rather than repaired around the rejected host-control topology.

The JSDoc law remains one generic positive pattern. Its product and platform
applications split acquisition only to keep each Grit report within the
runner's bounded output contract; neither application specializes the law or
recovers membership with filename predicates.

## Producer Retirement

- `tools/habitat` and its workspace membership are deleted.
- `.habitat/habitat/toolkit`, `.habitat/.active`, and `.habitat/_support` are
  deleted; released mechanics and temporal workspaces are not consumer policy.
- `nx.json` loads `@habitat-ai/cli/nx-plugin`; no source-configured producer
  path remains.
- The repository hook calls the installed CLI. Pre-push delegates to the
  repository-owned Nx check graph.
- Root Nx orchestration scripts remain human-facing commands. Explicit no-op
  root project targets prevent those commands from recursively becoming leaf
  work inside their own graph.
- Obsolete Habitat-only scripts, producer tests, virtual-cycle exceptions, and
  orphaned repair packets are deleted rather than preserved as compatibility
  surfaces.
- The repository-local generic service packet and its legacy service inventory
  application are deleted. New service construction remains refused until the
  selected shared pack supplies `service@1`.

## Repository Proof

The ordinary repository graph is green after the current consumer cut:

- frozen dependency installation;
- strict OpenSpec validation: 360 passed, 0 failed;
- full uncached Nx `check` graph across 37 projects and 149 dependency tasks;
- the original Ground full serial Nx `build,test,verify` graph across 30
  projects and 28 dependency tasks;
- Knip dead-code and dependency proof;
- repository boundary and hygiene checks;
- generated Civ7 policy currentness against the pinned resource corpus;
- MapGen documentation, Studio browser bundle, artifact-contract, and mod
  runtime-compatibility verification.

The live Studio failure captured outside this Ground slice remains an honest
Interactive-platform input. Static generation, deployment, and product proof
passing here does not claim that a fresh Civ7 session reached the expected
runtime markers.

## Exit And Next Container

The original Ground exit at `fd60a16ad7605ad34c8afa9668aa847b52931022`
admitted Core Platform construction without product source relocation. The
locked 0.5.2 handoff superseded 0.5.1 at the next natural Interactive resource
boundary. The compatible `0.5.4` provider repair was then consumed and
re-proven against Civ7's complete owner corpus. The native `0.5.5` migration now
advances the consumer pair without reopening Ground, copying substrate law, or
admitting the still-unselected service kind. Fresh live proof and Studio-owned
writers remain part of the joint Core Platform seal, not Ground.
