# Tasks

## 1. Planning And Review

- [x] 1.1 Open a child planning branch from `codex/habitat-derived-packet-execution`.
- [x] 1.2 Read requested skills and OpenSpec workstream references.
- [x] 1.3 Inspect current registry schema, path derivation, registry loaders,
      baseline, artifact routing, Nx, and live manifest corpus.
- [x] 1.4 Run first-wave agent review of proposal/design/spec/tasks.
- [x] 1.5 Disposition first-wave P1/P2 findings and polish the plan.
- [x] 1.6 Validate OpenSpec change and commit the planning artifact.
- [x] 1.7 Close first-wave agents so implementation can start with fresh agents.

## 2. Implementation Phase: Characterize

- [x] 2.1 Add tests proving current rule behavior before schema migration.
- [x] 2.2 Add failing tests for arbitrary manifest location preserving rule
      identity and behavior.
- [x] 2.3 Add tests for duplicate ids and missing referenced runner files.
- [x] 2.4 Create the 124-row manifest migration ledger covering current path,
      current path-derived facts, sibling role files, proposed manifest facts,
      runner file refs, baseline/artifact refs, and unresolved exceptions.
- [x] 2.5 Add selector boundary tests proving only `grit`, `habitat`, and `nx`
      are public runner names.

## 3. Implementation Phase: Manifest Contract

- [x] 3.1 Add `RuleManifestV1` / `RuleRunnerV1` schema.
- [x] 3.2 Parse `rule.json` as the full rule manifest.
- [x] 3.3 Validate explicit runner file references.
- [x] 3.4 Validate explicit baseline/artifact references where current behavior
      consumes them.
- [x] 3.5 Remove live id/title/runner derivation from packet path and siblings.
- [x] 3.6 Use exhaustive runner/runtime dispatch in execution consumers.

## 4. Implementation Phase: Corpus Migration

- [x] 4.1 Add `schemaVersion`, `id`, `title`, `placement`, and explicit `runner`
      to every live `.habitat/**/rule.json`.
- [x] 4.2 Preserve current policy/routing fields unless explicitly changed by
      this spec.
- [x] 4.3 Verify every referenced runner file exists.
- [x] 4.4 Add explicit baseline/artifact references or record the deliberate
      global id-based baseline contract.

## 5. Implementation Phase: Consumer Cutover

- [x] 5.1 Replace service registry discovery with location-independent manifest
      discovery.
- [x] 5.2 Replace Nx registry loader with the same manifest contract.
- [x] 5.3 Replace baseline current-state id/path assumptions with manifest facts.
- [x] 5.4 Replace Habitat artifact routing packet-id parsing with manifest and
      runner/artifact-file joins.
- [x] 5.5 Update Nx inputs, hooks, reports, Grit, structure, script, file-layer,
      and generator consumers.
- [x] 5.6 Remove duplicated service/Nx registry enrichment so both surfaces
      consume the same manifest contract.

## 6. Implementation Phase: Closure

- [x] 6.1 Delete or quarantine packet-path derivation as migration/history-only
      code.
- [x] 6.2 Replace packet-grammar tests with location-independence tests.
- [x] 6.3 Update active docs that describe path-derived identity or
      sibling-derived runner inference.
- [x] 6.4 Run focused tests, runtime proof, OpenSpec validation, and closure
      scans.
- [x] 6.5 Commit the implementation branch through Graphite with a clean
      worktree.
