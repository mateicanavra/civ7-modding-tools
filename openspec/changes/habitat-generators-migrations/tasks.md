## 1. Generators

- [ ] 1.1 Implement `project` generator for uniform kinds (plugin, foundation,
  app): package.json with tags, tsconfig, src/test stubs, workspace
  registration; refusal path with rationale for non-uniform kinds.
- [ ] 1.2 Implement `pattern` generator: grit pattern + fixtures + rule-pack
  entry + empty baseline via the rule-introduction gate.
- [ ] 1.3 Probe: one generated project per supported kind passes
  `habitat check` + build/check/test cold; remove probes.

## 2. Migrations

- [ ] 2.1 Wire `migrations.json` + a no-op baseline migration;
  `bunx nx migrate @internal/habitat-harness` proof.

## 3. Classify And Agent Procedure

- [ ] 3.1 Complete `habitat classify <path-or-diff>`: project, tags, owning
  rules, required targets; JSON output.
- [ ] 3.2 Update root `AGENTS.md` Tooling Defaults with the
  classify→generate→author→verify loop; full procedure in harness README.

## 4. Verification And Closure

- [ ] 4.1 All proposal gates pass; classify spot-checks recorded.
- [ ] 4.2 `bun run openspec -- validate habitat-generators-migrations
  --strict`; downstream realignment (AGENTS routers, process docs); train
  closure review against FRAME end-state checklist (§14 of spec draft input).
