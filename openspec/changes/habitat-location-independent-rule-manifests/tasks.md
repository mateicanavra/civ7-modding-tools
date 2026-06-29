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

- [ ] 2.1 Add tests proving current rule behavior before schema migration.
- [ ] 2.2 Add failing tests for arbitrary manifest location preserving rule
      identity and behavior.
- [ ] 2.3 Add tests for duplicate ids and missing referenced runner files.
- [ ] 2.4 Create the 124-row manifest migration ledger covering current path,
      current path-derived facts, sibling role files, proposed manifest facts,
      runner file refs, baseline/artifact refs, and unresolved exceptions.
- [ ] 2.5 Add selector boundary tests proving only `grit`, `habitat`, and `nx`
      are public runner names.

## 3. Implementation Phase: Manifest Contract

- [ ] 3.1 Add `RuleManifestV1` / `RuleRunnerV1` schema.
- [ ] 3.2 Parse `rule.json` as the full rule manifest.
- [ ] 3.3 Validate explicit runner file references.
- [ ] 3.4 Validate explicit baseline/artifact references where current behavior
      consumes them.
- [ ] 3.5 Remove live id/title/runner derivation from packet path and siblings.
- [ ] 3.6 Use exhaustive runner/runtime dispatch in execution consumers.

## 4. Implementation Phase: Corpus Migration

- [ ] 4.1 Add `schemaVersion`, `id`, `title`, `placement`, and explicit `runner`
      to every live `.habitat/**/rule.json`.
- [ ] 4.2 Preserve current policy/routing fields unless explicitly changed by
      this spec.
- [ ] 4.3 Verify every referenced runner file exists.
- [ ] 4.4 Add explicit baseline/artifact references or record the deliberate
      global id-based baseline contract.

## 5. Implementation Phase: Consumer Cutover

- [ ] 5.1 Replace service registry discovery with location-independent manifest
      discovery.
- [ ] 5.2 Replace Nx registry loader with the same manifest contract.
- [ ] 5.3 Replace baseline current-state id/path assumptions with manifest facts.
- [ ] 5.4 Replace Habitat artifact routing packet-id parsing with manifest and
      runner/artifact-file joins.
- [ ] 5.5 Update Nx inputs, hooks, reports, Grit, structure, script, file-layer,
      and generator consumers.
- [ ] 5.6 Remove duplicated service/Nx registry enrichment so both surfaces
      consume the same manifest contract.

## 6. Implementation Phase: Closure

- [ ] 6.1 Delete or quarantine packet-path derivation as migration/history-only
      code.
- [ ] 6.2 Replace packet-grammar tests with location-independence tests.
- [ ] 6.3 Update active docs that describe path-derived identity or
      sibling-derived runner inference.
- [ ] 6.4 Run focused tests, runtime proof, OpenSpec validation, and closure
      scans.
- [ ] 6.5 Commit the implementation branch through Graphite with a clean
      worktree.
