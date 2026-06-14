## 1. Generators

- [x] 1.1 Implement `project` generator for uniform kinds (plugin, foundation,
  app): package.json with tags, tsconfig, src/test stubs, workspace
  registration; refusal path with rationale for non-uniform kinds.
- [x] 1.2 Implement `pattern` generator: grit pattern + fixtures + rule-pack
  entry + empty baseline via the rule-introduction gate.
- [x] 1.3 Probe: one generated project per supported kind passes
  `habitat check` + build/check/test cold; remove probes.

## 2. Migrations

- [x] 2.1 Wire the plugin's `migrations.json` + a no-op baseline migration;
  proof: hand-author a migration run file using package
  `./tools/habitat-harness` and execute `nx migrate
  --run-migrations=<run-file>.json --skip-install` (the package is
  unpublished, so `nx migrate @internal/habitat-harness` registry
  resolution does not apply). Note: the migration requirement's demonstrable
  gate in this slice is the no-op migration execution only.

## 3. Classify And Agent Procedure

- [x] 3.1 Complete `habitat classify <path-or-diff>`: project, tags, owning
  rules, required targets; JSON output.
- [x] 3.2 Update root `AGENTS.md` Tooling Defaults with the
  classify→generate→author→verify loop; full procedure in harness README.

## 4. Verification And Closure

- [x] 4.1 All proposal gates pass; classify spot-checks recorded against the
  four-path expected-output matrix in the proposal (owning project, tags,
  in-scope rules, required verification targets per path).
- [x] 4.2 `bun run openspec -- validate habitat-generators-migrations
  --strict`; downstream realignment (AGENTS routers, process docs); train
  closure review against FRAME end-state checklist (§14 of spec draft input).
