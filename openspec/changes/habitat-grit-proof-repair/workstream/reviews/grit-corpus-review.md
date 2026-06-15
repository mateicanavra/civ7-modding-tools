# Grit Corpus Review

## Verdict

Not implementation-ready for a new Grit pilot yet. The packet correctly
identifies the current 22 `grit-check` rules, the 22 check pattern files, and
the single `deep_import_to_public_surface` apply pattern, and
`bun run openspec -- validate habitat-grit-proof-repair --strict` passes.

The blockers are in row-level proof depth. The proof matrix does not yet carry
the fields required by its own contract; injected probes are not forced to prove
agreement between Habitat scan roots, rule-pack scope, and Grit filename
predicates; apply safety does not prove missing-export refusal or preflight.
Those gaps would allow keyword-shaped checks, unsafe rewrites, and hidden row
obligations to pass through as proof.

## Findings Table

| ID | Severity (P1/P2/P3) | Location | Finding | Required repair |
| --- | --- | --- | --- | --- |
| GCR-P1-01 | P1 | `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md:18`; `openspec/changes/habitat-grit-proof-repair/design.md:90` | The matrix enumerates all 22 checks and the apply row, but its columns cannot carry the row contract in `design.md`: pattern file path, normative source, proving source, exact roots and exclusions, native sample count, current-tree command, injected probe path, baseline file path, non-claims, and downstream records are absent from the table. A row can still read as reviewed while hiding the concrete proof data. | Replace the matrix schema with one that directly matches the design contract, then fill it for all 22 checks and the apply row. Implementation readiness should require concrete row values, not placeholder status text. |
| GCR-P1-02 | P1 | `openspec/changes/habitat-grit-proof-repair/design.md:108`; `openspec/changes/habitat-grit-proof-repair/specs/habitat-harness/spec.md:57`; `tools/habitat-harness/src/lib/grit.ts:27` | The injected-violation harness only requires a probe under an approved scan root. The live adapter scans five shared roots, while each rule also has a `rules.json` scope and many patterns add their own `$filename` or source predicates. The packet does not require a per-row proof that the injected path is inside all three surfaces, or that a nearby out-of-scope path does not fire. This can hide scan-root drift and keyword-only behavior. | For every check row, record the Habitat adapter root, `rules.json` scope, Grit path/source predicate, injected path, expected diagnostic, and a path-control probe outside the effective scope. Any mismatch should either repair the rule/pattern or trigger the adapter substrate gate before closure. |
| GCR-P1-03 | P1 | `openspec/changes/habitat-grit-proof-repair/design.md:153`; `openspec/changes/habitat-grit-proof-repair/tasks.md:61`; `.grit/patterns/habitat/apply/deep_import_to_public_surface.md:12`; `tools/habitat-harness/src/lib/grit.ts:86` | Apply safety proves target export existence only for injected positive cases, but the current apply pattern rewrites every matching deep import under discovered recipe/map roots with `--force`. There is no required negative case where the public `/ops` target lacks the imported symbol, and no required preflight that inventories live matches before rewrite. That can turn an unexported deep import into a broken public import while still passing the planned positive proof. | Add live and injected match inventory before apply. Require a target-export preflight for every imported symbol, plus a missing-export negative fixture proving Habitat refuses or leaves the import unchanged. If that guard cannot be implemented in the current adapter, reclassify the codemod as unsafe for product evidence until the typed adapter/command runner work exists. |
| GCR-P2-04 | P2 | `openspec/changes/habitat-grit-proof-repair/tasks.md:17`; `openspec/changes/habitat-grit-proof-repair/tasks.md:43`; `tools/habitat-harness/test/grit/grit-patterns.test.ts:50` | Fixture coverage is still aggregate and conditional. The native test checks total report/sample counts and success, while the repair tasks ask for false-positive probes only when existing samples do not cover the model. No row has to classify its positive, negative, parser-edge, and false-positive samples. Keyword-shaped rules could satisfy the aggregate count without proving useful precision. | Add fixture coverage fields to each matrix row and require exact sample counts per pattern. Each row should list positive, negative, parser-edge, and false-positive coverage, or an evidence-backed not-applicable disposition, and the Grit test/report should fail when a row lacks that classification. |
| GCR-P2-05 | P2 | `docs/projects/habitat-harness/dra-takeover-frame.md:300`; `docs/projects/habitat-harness/dra-takeover-frame.md:351`; `openspec/changes/habitat-grit-proof-repair/workstream/downstream-realignment-ledger.md:17`; `tools/habitat-harness/src/generators/pattern/generator.cjs:23`; `tools/habitat-harness/README.md:81` | The takeover frame says generated Grit patterns must carry authority, proving source, false-positive model, scan roots, fixture strategy, baseline policy, and hook-scope decision before enforcement, but this packet only conditionally patches README guidance and does not list the pattern generator/schema as downstream work. The current generator can still create an enforced `grit-check` rule with placeholder authority text and a keyword-like sample. Because the packet enables the first Grit pilot after this repair, this leaves a path for the next pilot to bypass the repaired proof model. | Add `tools/habitat-harness/src/generators/pattern/**` and README/generator guidance to downstream realignment, or add an explicit stop condition that new pilots cannot use generated enforced rules until metadata repair lands. The stronger repair is to require authority source, proving source, scan roots, fixture model, baseline policy, and hook-scope fields in the generator before it writes an enforced rule. |

## Positive Checks

- Current corpus count is consistent across live sources: `rules.json` has 22
  `grit-check` rules, `.grit/patterns/habitat/checks` has 22 pattern files,
  and `.grit/patterns/habitat/apply` has one apply pattern.
- The packet separates proof classes cleanly: native samples, current-tree
  wrapper proof, injected violations, baselines, parity, Nx scheduling,
  dry-run, applied diff, rollback, and type/test proof are not collapsed into
  one green command.
- Selector false-green behavior is explicitly named and blocked on
  `habitat-oclif-entrypoint-repair`.
- The latest packet chooses explicit empty Grit baseline files for the current
  tranche, which is stronger than relying on missing-file behavior.
- The apply row is correctly treated as implemented but under-proven, with
  dry-run, applied-diff, type-only, Biome, test, and rollback proof called out.

## Open Questions

- Is raw Grit acquisition/provenance required for closure, or is Habitat wrapper
  proof accepted as the controlling current-tree proof with an explicit
  non-claim?
- Should `habitat-effect-grit-adapter` open now if the row-level root,
  provenance, cleanup, and apply preflight repairs require new adapter code?
