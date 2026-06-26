# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Runtime, config, and errors
- Owner: runtime/config/errors implementation lane
- Branch/Graphite stack: `agent-DRA-effect-runtime-config-errors` stacked on
  `agent-DRA-effect-static-inventory-guardrails`
- Started: 2026-06-19
- Status: implementation complete except aggregate Habitat check remains a
  bounded Grit-provider-cutover refusal

## Objective

- Target movement: build the shared Effect runtime substrate.
- Non-goals: complete vendor/domain migration beyond the runtime write set.
- Done condition: live/fake runtime services exist and old direct runtime
  shortcuts are removed from the write set; slow ambient work is no longer
  hidden inside ordinary local feedback.

## Verification

- `bun run --cwd tools/habitat-harness check` passed.
- `bun run --cwd tools/habitat-harness test` passed: 22 files, 243 tests.
- `bun run --cwd tools/habitat-harness build` passed.
- `/opt/homebrew/bin/timeout 420s bun run build` passed.
- `bun run biome:format` and `bun biome check --write .` applied repo
  formatter/import-sort fixes.
- `bun run biome:ci` passed.
- `bun run openspec:validate` passed: 269 items.
- `git diff --check` passed.
- `rg "Effect\\.run(Sync|Promise|Fork|Callback)|runPromise\\(" tools/habitat-harness/src -n`
  found only `src/runtime/run.ts`.
- `/opt/homebrew/bin/timeout 45s bun run habitat:check -- --json --tool command-check`
  passed in about 2s with no `baseline-integrity` built-in; baseline integrity
  is now explicit via `--baseline-integrity`, `--base`, baseline authoring, or
  verify.
- `/opt/homebrew/bin/timeout 45s bun run habitat:check -- --json` returned
  bounded JSON in about 35s and exits 1 because broad live source-backed Grit
  execution is explicitly refused until the vendor-provider batching/cutover
  packet owns that scheduling.

## Scheduling Corrections

- `baseline-integrity` is no longer appended to every `habitat check` report.
  It remains available for explicit baseline integrity requests and `habitat
  verify`, where base comparison is part of the product contract.
- Command-backed rules now execute through the Effect `CommandRunner` provider
  and are scheduled concurrently by the check executor instead of serially
  blocking aggregate feedback.
- Broad live source-backed Grit batches now fail fast with a typed adapter
  contract diagnostic instead of starting a long unschedulable vendor command.
  The durable repair is assigned to `deep-habitat-effect-vendor-providers` and
  `deep-habitat-effect-grit-apply-cutover`.

## Migration Boundary

- `src/lib/habitat-process.ts` is a temporary migration bridge only. It exists
  in this packet to keep current Grit adapter and public command behavior
  stable while `CommandRunner` becomes the generic execution owner.
- The durable end state forbids compatibility shims, duplicate process paths,
  dead code, or fallback runners. Deletion is explicitly assigned to
  `deep-habitat-effect-vendor-providers` and
  `deep-habitat-effect-grit-apply-cutover`; those packets must move Grit
  callsites to provider services and remove `HabitatProcessLive`,
  `makeFakeHabitatProcessLayer`, and the Grit-shaped process facade before the
  refactor train closes.
