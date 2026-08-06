# Civ7 Capability Realization Ground Receipt

**Status:** Passed; Civ7 consumes the released Habitat substrate
**Date:** 2026-08-06
**Container:** [WORKSTREAM.md](./WORKSTREAM.md#container-0-ground)
**Frame:** [FRAME.md](./FRAME.md)

## Decision

Ground is closed. Civ7 now consumes Habitat through the exact released
`@habitat-ai/cli@0.5.2` development dependency. The CLI carries
`@habitat-ai/sdk@0.5.2` as its exact ordinary dependency and projects the shared
Nx targets. The workspace-local Habitat producer, bootstrap path, virtual
projects, tests, and temporal authority workspace are retired.

Civ7 retains only its instances, qualified overlays, product policy, adapters,
and compatibility rules. It does not copy, fork, or reinterpret the shared
laws. The selected shared pack is exactly `app@1`, `package@1`, `plugin@1`,
`plugin-nx@1`, `provider@1`, and `resource@1`. `service@1` is intentionally not
selected; current Civ7 service law remains local until the upstream owner
publishes a shared service kind that this product deliberately admits.

## Release Authority

| Artifact | Exact identity | Ground result |
| --- | --- | --- |
| Habitat source release | tag `habitat-cli-v0.5.2`; source `92482052a7878d47085a14831bf3d6098f2b2d5d` | Accepted upstream release authority |
| Template consumer proof | canonical `main` at `ee03d1c7e065c779fb63f9c57a1c0d2e121c1630` | Accepted canonical first-consumer receipt |
| Habitat release proof | workflow `31070676131`; final repository ratchet `31075870726` | Both green at handoff |
| Habitat CLI | `@habitat-ai/cli@0.5.2`; Bun lock integrity `sha512-/gDZg9sWYkOxoYpzMS/XqSIJ8QxfOWffYjPDWTc7ALIsOWuQ8LafPRrB61YueQXH/V9fKdR2z//3ol65kMh/nw==` | Installed as the sole direct Habitat development dependency |
| Habitat SDK | `@habitat-ai/sdk@0.5.2`; Bun lock integrity `sha512-xz/bRXej6swKJLRruo7Bj/UZLxcZGVCGKtpiaue3dALmcHK2aMtT5kKrtEb04nYPFx3twd70AVoPLY8bOYimsw==` | Installed only as the CLI's exact ordinary dependency |

The published CLI declares Bun `>=1.3.14`, Node `^24.18.1`, Nx `23.1.0`, Oclif
`^4.13.2`, and TypeBox `1.3.8`. `habitat resolve` reports policy pack
`@habitat-ai/sdk@0.5.2`, schema version 3, and exactly the six selected shared
blueprints above.

## Consumer Proof

| Proof class | Evidence | Result |
| --- | --- | --- |
| Exact installation | Frozen `bun.lock`; only `@habitat-ai/cli@0.5.2` is direct | Passed |
| Initializer application | `bunx nx generate @habitat-ai/cli:init --no-interactive` | Passed |
| Initializer idempotence | A second application left `nx.json`, `package.json`, and `.codex/hooks.json` unchanged | Passed |
| Stable initialized files | SHA-256: `nx.json` `d61aadf2180aef515954aa0f78ace6d479c33ae1c43f7441c5e8a08d58722fae`; `package.json` `17c9162057ef8c6ced9f36449cc9c937c8e2e812d9ebbc2234ff704bcdcadaa3`; `.codex/hooks.json` `c0bdf3facce0b6d709dd3ac0b121037cf96a816d0c242a0a1f9f525ffe365a27` | Recorded after the second idempotent application |
| Shared-kind fixture | Disposable instances of all six selected kinds resolved and passed their closed structure laws | Passed |
| Closed-law falsifier | One injected loose member was refused by every selected shared kind | Passed |
| Unsupported-kind refusal | A disposable `service@1` instance was refused with `authority-blueprint-missing` | Passed without writes |
| Local compatibility structure | 26 of 26 Habitat structure applications | Passed |
| Local compatibility syntax | 76 of 76 Grit applications | Passed |

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

## Repository Proof

The ordinary repository graph is green after the consumer cut:

- frozen dependency installation;
- strict OpenSpec validation: 360 passed, 0 failed;
- full serial Nx `check` graph across 31 projects and 126 dependency tasks;
- full serial Nx `build,test,verify` graph across 30 projects and 28 dependency
  tasks;
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
boundary and was re-proven there without reopening Ground or copying substrate
law. Fresh live proof and Studio-owned writers remain part of the joint Core
Platform seal, not Ground.
