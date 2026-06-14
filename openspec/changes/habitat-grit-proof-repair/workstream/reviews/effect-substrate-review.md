# Effect Substrate Review

## Verdict

Implementation should not start on Grit adapter-touching code under the current
packet. The packet correctly reopens Effect and rejects blanket migration, but
the non-adoption path is too permissive for the tasks it assigns. The requested
injected-violation harness, raw Grit acquisition/provenance, parse/schema
classification, scan-root service seams, dry-run/apply proof, cleanup, rollback,
and fake-service tests map directly to `habitat-effect-grit-adapter`, with
`habitat-effect-command-runner` as a likely dependency or shared slice.

Docs-only record repair can proceed, but any code that changes `grit.ts`, adds
adapter seams, or makes apply proof depend on new infrastructure should wait
until `habitat-effect-grit-adapter` or an equivalently reviewed typed adapter
design is opened and accepted.

## Findings table

| ID | Severity (P1/P2/P3) | Location | Finding | Required repair |
| --- | --- | --- | --- | --- |
| EFF-SUB-01 | P1 | `proposal.md:75`, `design.md:106`, `tasks.md:37`, `tools/habitat-harness/src/lib/grit.ts:27` | Non-adoption conflicts with the implementation scope. The packet says current TypeScript may continue when work is proof records, tests, fixtures, and probes, but the required harness has to inject scan roots, exercise the real wrapper path, guarantee cleanup, and prove exact rule mapping. Current `grit.ts` computes scan roots at module load, caches one shared report, uses a `SpawnResult` without argv/cwd/env/duration/failure class, and hides parse modes behind a tail-output diagnostic. Implementing the harness without an adapter substrate would add the manual machinery the packet itself says should trigger Effect. | Make `habitat-effect-grit-adapter` or an accepted typed Grit adapter design a prerequisite for tasks 4, 6, and any edits to `tools/habitat-harness/src/lib/grit.ts`. If the owner wants a no-Effect path, add a pre-code decision record proving typed failure classes, command provenance, injectable scan roots, cleanup guarantees, and test seams before code. |
| EFF-SUB-02 | P1 | `design.md:141`, `tasks.md:58`, `specs/habitat-harness/spec.md:88`, `tools/habitat-harness/src/lib/grit.ts:86` | Apply proof is risky enough to require a transaction design before implementation. `runGritApplyPatterns` always uses `--force`, writes against discovered live roots, captures only stdout/stderr/exitCode, and has no clean-worktree guard, diff capture, target export validation, rollback resource, or interruption cleanup. The packet lists these as proof duties but does not make the transaction substrate a precondition. | Gate `deep_import_to_public_surface` applied-diff proof behind `habitat-effect-grit-adapter` or a reviewed transaction design with clean-worktree precheck, temp/probe path ownership, finalizer/rollback proof, command metadata, and post-rollback status proof. Until then, keep live dry-run hygiene as non-safety evidence. |
| EFF-SUB-03 | P2 | `design.md:160`, `tasks.md:71`, `docs/projects/habitat-harness/effect-orchestration-evaluation.md:149`, `docs/projects/habitat-harness/research/local-effect-adoption-fit.md:108` | The trigger matrix is not objective enough because it names triggers but does not require a decision record or pass/fail evidence before implementation. Supporting Effect records require each repair touching command/check/fix/hook orchestration to choose current internals, Effect behind the command shell, shell reconsideration, or deferred Effect; the local fit pack requires command provenance, service-injection tests, runtime-edge discipline, and records truth. The packet only asks the owner to evaluate whether implementation needs new code, so an owner could self-classify after already designing ad hoc seams. | Add a required substrate decision table in `design.md` and `phase-record.md` before task 4: concern, current-code capability, required proof, chosen substrate, trigger result, evidence path, and reviewer. Mark tasks 4/6/adapter tests blocked until that table is accepted by the Effect/substrate lane. |
| EFF-SUB-04 | P2 | `design.md:70`, `design.md:191`, `specs/habitat-harness/spec.md:24`, `tools/habitat-harness/src/lib/spawn.ts:5`, `tools/habitat-harness/src/lib/grit.ts:118` | Command provenance is required but not structurally available from current runner data. The packet requires argv/cwd/env/duration/failure-class style proof, while `SpawnResult` carries only exitCode/stdout/stderr and `loadGritReport` discards argv/env/cache/scan-root provenance after the call. This makes raw acquisition, parse failure, and current-tree proof records depend on handwritten notes rather than data from the adapter. | Decide whether `habitat-effect-command-runner` is a prerequisite or folded into the Grit adapter. Add a typed command result contract that preserves argv, cwd, env delta, scan roots, cache dir, duration, exit code, stdout, stderr, and failure class for Grit check/apply proof. |
| EFF-SUB-05 | P2 | `design.md:121`, `specs/habitat-harness/spec.md:114`, `tools/habitat-harness/src/lib/grit.ts:155`, `docs/projects/habitat-harness/research/local-effect-adoption-fit.md:120` | Parser/schema risk is named but not converted into required tests for the existing adapter. `parseGritJson` tries whole-output and first/last brace substring, swallows parse errors, and returns undefined; the rule path then emits one generic diagnostic. The packet requires current-tree proof and schema-drift triggers, but it does not require no-JSON, malformed JSON, wrapper-noise, schema drift, empty scan roots, pattern miss, or cache-scope tests before accepting non-adoption. | Add adapter test cases for those failure modes and require each to produce a typed result or an explicitly classified diagnostic. If that cannot be done without service seams, fake command runner, and fake filesystem, open `habitat-effect-grit-adapter` first. |

## Positive Checks

- The packet separates native Grit samples, current-tree wrapper proof, raw
  acquisition, injected violations, baselines, parity, Nx scheduling, dry-run,
  applied diff, rollback, and type/test proof.
- It keeps Grit, Habitat baseline policy, Biome formatting, Nx scheduling, and
  Effect orchestration in distinct owner layers.
- It correctly refuses broad Effect migration and says Effect is useful only
  where typed errors, services, command provenance, resource safety, or tests
  improve proof quality.
- It identifies the current false-green selector behavior as outside Grit proof
  until `habitat-oclif-entrypoint-repair` lands.
- It explicitly blocks claims that green native samples or green `nx grit:check`
  alone prove current-tree enforcement or apply safety.

## Open Questions

- Should `habitat-effect-command-runner` be a downstack prerequisite for
  `habitat-effect-grit-adapter`, or should the Grit adapter own its first typed
  command runner internally?
- Where should command provenance live: public CheckReport schema, internal proof
  records, or both with different detail levels?
- After `habitat-oclif-entrypoint-repair`, should invalid selectors render as
  command errors, failing CheckReports, or both?
- Is the apply proof intended to run in the live worktree only, or should the
  accepted adapter design require a temp workspace/sandbox for destructive
  probes?
