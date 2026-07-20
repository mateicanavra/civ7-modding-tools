# Packet 6 Verification Evidence

Status: Packet 6 local verification is closed-passed for the declared static,
behavior, OpenSpec, Habitat, classify-reported, and review-lane gates below.

## Product Evidence

- `generate-map-artifacts.ts` now builds a pure `SwooperMapArtifactFilePlan`
  before writing files.
- The plan records relative output paths, artifact kind, text/bytes content
  kind, marker metadata for generated map entries, and the generated-entry
  exclusive set used to remove stale generated map entrypoints.
- `writeSwooperMapArtifactFilePlan(plan, { outputRoot })` owns output-root
  resolution, directory creation, exclusive-set cleanup, and file writes.
- Catalog generation input remains file-scan based in this packet; Packet 6
  does not cut catalog generation over to the catalog source index.
- Run proof metadata remains selected-config only: request id and launch
  envelope digest attach to the chosen generated map entry and not to unrelated
  map entries.

## Static And Behavior Gates

| Gate id | Required | Command/protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| habitat-classify | Required | `git diff --no-ext-diff > /tmp/swooper-map-artifact-file-plan.diff && bun habitat classify /tmp/swooper-map-artifact-file-plan.diff` | Packet 6 diff captured with intent-to-add files visible | Exit `0`; classify reported `nx run mod-swooper-maps:check`, `nx run mod-swooper-maps:test`, `nx run habitat:check`, `nx run habitat:test`, and `bun run lint` as runnable gates for this diff | Inline terminal JSON summary from 2026-07-07 | Classify-reported gates are authoritative for closure. | PASS |
| focused-file-plan-tests | Required | `bun test mods/mod-swooper-maps/test/config/map-artifact-file-plan.test.ts` | File-plan model and writer implemented | Exit `0`; `7 pass`, `0 fail`, `84 expect()` calls | Inline terminal output from 2026-07-07 | Pure plan shape, selected proof metadata isolation, output-root writer behavior, stale generated-entry cleanup, escaped-path safety, symlinked generated-dir refusal, and symlinked write-path preflight are covered. | PASS |
| generator-equivalence | Required | `nx run mod-swooper-maps:gen:map-artifacts --skip-nx-cache --outputStyle=static` followed by `git diff -- mods/mod-swooper-maps/src/maps/generated mods/mod-swooper-maps/mod mods/mod-swooper-maps/dist/recipes` | File-plan writer wired into CLI | Exit `0`; generated `9` Swooper map configs; generated artifact diff empty | Inline terminal output and empty `git diff` from 2026-07-07 | Existing catalog artifact output remains equivalent for current inputs. | PASS |
| sa06-targeted-habitat | Required | `bun habitat check --rule grit-swooper-map-render-file-plan-boundary --json` | SA-06 Habitat rule registered | Exit `0`; rule status `pass`; `0` diagnostics | Inline terminal JSON from 2026-07-07 | Habitat wrapper current-tree proof for selected SA-06 scan roots passes through the authority plane. | PASS |
| sa06-injected-violation-proof | Required authority sanity check | Temporary injected direct `writeFile` violation in `generate-map-artifacts.ts`; temporary `promises as fs` generator write; temporary namespace and default `node:fs/promises` imports in `map-artifacts/render-extra.ts`; each followed by `bun habitat check --rule grit-swooper-map-render-file-plan-boundary --json`, then removal and clean rerun | Injections applied and removed with `apply_patch`; no injected code remains | Violating runs exited non-zero with diagnostics at the injected generator import/call, generator `fs.writeFile` member call, non-writer renderer namespace import, and non-writer renderer default import/member call; final clean rerun passed with `0` diagnostics | Inline terminal JSON from 2026-07-07 | SA-06 detects generator-owned filesystem mutation and aliased/default/namespace filesystem acquisition in non-writer artifact modules without relying on current-tree silence alone. | PASS |
| classify-mod-check | Required | `nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static` | Habitat classify reports mod check | Exit `0`; target and 18 dependencies succeeded | Inline terminal output from 2026-07-07 | Swooper Maps type/build surface remains green. | PASS |
| classify-mod-test | Required | `nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static` | Habitat classify reports mod test | Exit `0`; `505 pass`, `2 skip`, `0 fail`, `14748 expect()` calls; owner Habitat check passed with `84` rules, `0` failing, `1` advisory | Inline terminal output from 2026-07-07 | Swooper Maps behavior remains green after file-plan extraction and symlink-safety repair; Packet 4 transitional advisory remains nonblocking. | PASS |
| habitat-provider-check | Required for changed Habitat provider files | `nx run habitat:check --skip-nx-cache --outputStyle=static` | Habitat provider source changed | Exit `0`; `tsc -p tsconfig.json --noEmit` passed | Inline terminal output from 2026-07-07 | Changed Habitat provider and verify receipt code typecheck. | PASS |
| habitat-provider-tests | Required for changed Habitat provider files | `nx run habitat:test --skip-nx-cache --outputStyle=static` | Initial full suite exposed two Habitat harness failures; fixes applied and rerun; later Effect temp cleanup repair added | Exit `0`; `35` files passed, `328` tests passed | Inline terminal output from 2026-07-07 | Provider compatibility, verify receipt projection, registry contract tests, and materialization cleanup are green through the Habitat test suite. | PASS |
| focused-provider-tests | Supporting proof | `bun run --cwd tools/habitat test test/lib/grit-provider.test.ts test/rules/registry/contract.test.ts` | Bounded Grit provider compatibility and registry contract changed | Exit `0`; `2` files passed, `47` tests passed | Inline terminal output from 2026-07-07 | Selected markdown-backed Grit pattern materialization, diagnostic path normalization, materialization failure cleanup, and full manifest corpus loading are covered directly. | PASS |
| habitat-harness-red-green | Required blocker disposition | `nx run habitat:test --skip-nx-cache --outputStyle=static`, then targeted fixes, then `bun run --cwd tools/habitat test test/lib/verify-receipt.test.ts test/rules/registry/contract.test.ts`, then full `nx run habitat:test --skip-nx-cache --outputStyle=static` | Full Habitat gate initially red | Initial red: `verify-receipt.test.ts` parse failures and stale registry count assertion. Targeted rerun after final repairs: provider/registry `47` tests passed. Full rerun: `328` tests passed. | Inline terminal output and investigator/reviewer findings from 2026-07-07 | Red gates were resolved semantically: receipt projection was a real code bug; static registry counts were stale test authority replaced by disk-derived corpus invariants; materialization failures now stay in the provider failure channel and release temp roots. | PASS |
| openspec-strict | Required | `bun run openspec -- validate swooper-map-artifact-file-plan --strict` | Packet 6 implementation applied | Exit `0`; change is valid | Inline terminal output from 2026-07-07 | OpenSpec change remains valid. | PASS |
| workspace-lint | Required | `bun run lint` | Habitat classify reports workspace lint | Exit `0`; lint succeeded for `9` projects | Inline terminal output from 2026-07-07 | Workspace lint remains green. | PASS |

## Review Lanes

| Lane | Reviewer focus | Disposition |
| --- | --- | --- |
| TypeScript refactoring / structure | File-plan state model, ambient env collapse, writer boundary, stale cleanup modeling, generated marker metadata, JSDoc and anchor comments. | PASS. Kepler, Hubble, and James findings were accepted and repaired. The writer now preflights every exclusive set and planned file for path escape and symlink traversal before cleanup or writes; JSDoc explains the writer boundary rather than narrating implementation. |
| Code quality / Habitat authority | SA-06 rule shape, no `.grit` authority tree, Packet 4 temporary catalog anchor preservation, rule fixture quality, behavior-vs-structure split, no brittle exact code-shape Grit snapshots. | PASS. Lovelace and Descartes findings were accepted and repaired. The rule claim is narrowed to Node filesystem write authority, the registry test keeps a disk-derived full-manifest corpus invariant, and SA-06 proves violation classes through Habitat without creating a parallel `.grit` authority tree. |
| oRPC / Effect / library correctness | Packet 6 has no oRPC runtime surface change; reviewers still checked Effect resource handling, Bun writer semantics, Nx generation behavior, Grit docs semantics, and stale library cruft. | PASS. Carson and Archimedes findings were accepted and repaired. Effect temp-root release is registered before materialization; SA-06 catches namespace, aliased, and default filesystem acquisition shapes in non-writer artifact modules. |

## Review Finding Disposition

| Reviewer | Finding | Disposition | Repair proof |
| --- | --- | --- | --- |
| Hubble / TypeScript | Writer cleanup/write paths could traverse symlinked planned directories and delete/write outside `outputRoot`. | Accepted. Writer now refuses existing symlink components below the output root before cleanup and before/after directory creation for writes. | `focused-file-plan-tests` includes symlinked generated-dir refusal; `classify-mod-test` green. |
| Lovelace / Code quality + Habitat | SA-06 overclaimed “missing boundary” while only enforcing filesystem authority. | Accepted. Rule claim now names Node filesystem authority outside the writer; pattern continues to avoid exact generator local-shape assertions. | `sa06-targeted-habitat` green and `sa06-injected-violation-proof` proves generator and non-writer renderer violation classes. |
| Lovelace / Code quality + Habitat | Review lanes were claimed closed before final findings were recorded. | Accepted. Ledger status and review table now record findings and repairs explicitly; task 3.4 remains open until focused rechecks clear. | This section is the durable disposition record. |
| Lovelace / Code quality + Habitat | Registry test replacement lost the full-corpus invariant. | Accepted. Registry test now derives `rule.json` paths from disk and asserts loaded manifest paths match exactly, while avoiding hard-coded counts. | `focused-provider-tests` and `habitat-provider-tests` green. |
| Carson / Library correctness | SA-06 missed aliased/namespace filesystem imports in non-writer map-artifact modules. | Accepted. Pattern now forbids Node filesystem imports in non-writer `map-artifacts` modules and keeps writer as the only artifact module with fs authority. | Temporary namespace violation failed under `bun habitat check --rule grit-swooper-map-render-file-plan-boundary --json`; clean rerun passed. |
| Carson / Library correctness | Grit materialization temp root could leak if file materialization failed after `mkdtempSync`. | Accepted. Temp-root acquisition uses `Effect.try` and registers release before materialization; materialization failures use `Effect.try` inside the scope. | Provider cleanup regression test passes; full `habitat:test` green. |
| James / TypeScript | File-path symlink validation still ran after stale generated-entry cleanup. | Accepted. Writer preflights symlink components for every exclusive set and every planned file before any `rm`, `mkdir`, or `writeFile`, then rechecks a file target after directory creation before writing. | `focused-file-plan-tests` includes symlinked write-path refusal before stale cleanup; `classify-mod-test` green. |
| Descartes / Code quality + Habitat | Generator `import { promises as fs } from "node:fs"; await fs.writeFile(...)` bypassed SA-06, and rule metadata still overclaimed generic filesystem authority. | Accepted. SA-06 now blocks the `promises as fs` generator write shape and the manifest claim is narrowed to Node filesystem write authority outside the writer. | Temporary generator member-call violation failed under Habitat; clean SA-06 rerun passed. |
| Archimedes / Library correctness | Non-writer artifact modules could use a default `node:fs/promises` import and member-call write. | Accepted. SA-06 now blocks default Node fs imports in non-writer artifact modules, with a matching fixture and live temporary violation proof. | Temporary default import/member-call violation failed at import and call lines; clean SA-06 rerun passed. |

## Authority Notes

- SA-06 is Habitat-owned. Grit is only the runner selected by the Habitat rule
  manifest.
- Bounded Habitat Grit provider compatibility is a Habitat wrapper
  implementation detail for running selected markdown-backed Grit patterns from
  an isolated temporary cwd against absolute repo scan roots. It is not a new
  `.grit` authority tree, not raw Grit authority, and not product proof beyond
  the named Habitat wrapper gates.
- The Habitat provider compatibility proof is a bounded current-provider claim.
  It does not settle the long-term Habitat toolkit resource-management design,
  and it does not claim every future Grit rule can rely on absolute scan-root
  `$filename` semantics without its own fixture/current-tree proof.
- The temporary Packet 4 catalog index advisory remains intact; its anchors in
  `generate-map-artifacts.ts` were preserved during the extraction.
- This packet does not include live Studio endpoint checks because it does not
  change a public Studio endpoint, operation status projection, cancellation
  command, or Run in Game server workflow. If a later Packet 6 repair touches
  those surfaces, endpoint proof becomes required before Packet 6 closure.
