# Habitat Harness Workstream — Frame and Baseline

- **Built:** 2026-06-12
- **Built by:** workstream owner agent (Fable), with Matei's settled decisions
- **Mode:** frame-discovery + co-framing, exported for future implementing agents
- **Object path:** objective-framing (backward from the end state), carried by a solution frame (the harness)
- **Durability:** standalone — this document must survive compaction and agent handoff
- **Cynefin read:** complicated (tool composition is known-good engineering), with one complex edge: burn-down volume is unknown until rules go red

This is the stable baseline for the workstream. Iterate from here, not from chat history.

---

## 1. The Frame

### WHAT (the lens)

Treat repository structure as an **executable, ratchetable contract**. Today the
repo's architecture is enforced by a scattered, partially-prose surface: nine
custom lint scripts, six architecture tests, an ESLint config of restricted
imports, CI jobs, and AGENTS.md/doc rules with no enforcement. The harness
re-homes all of that into one repository-local toolkit (`tools/habitat`)
with five enforcement layers, each with a single owning tool, plus a ratchet so
new invariants can land red and be burned down to green without blocking the
repo.

The harness is **not** product architecture, a framework, or a governance
layer. It makes whatever architecture the repo already chose enforceable down
to the file level — and keeps it that shape no matter which agent edits the
code.

### WHY

- Agents (and humans) currently learn the architecture by reading prose and
  inferring from code; violations are caught late, by CI scripts, or never.
- The repo's stated goal ("classify first, generate second, author third,
  verify continuously") requires structure to be queryable and enforceable,
  not documented.
- Matei's operating goal: stay back while agents reshape and continuously
  enforce project structure — codemods migrate in place, lint rules keep the
  shape, failures burn down iteratively.

### Selection commitments

**In:**
- All existing structural enforcement (scripts/lint/*, architecture tests,
  eslint.config.js restricted-import blocks, CI wiring).
- Nx adoption (full — graph, tags, affected, targets, cache, local plugin,
  generators), retiring Turbo.
- Module-boundary tags derived from current enforcement and docs.
- GritQL pattern catalog (check + apply) for syntax-shape invariants and codemods.
- Biome replacing Prettier (format + hygiene lint).
- Husky hooks (pre-commit, pre-push) delegating to the harness CLI.
- Ratchet/baseline machinery for red→green burn-down.
- Doc-vs-code discrepancy logging (logged, not resolved here).

**Foreground:** the migration map (existing check → harness owner), the
derived taxonomy, the ratchet mechanism, and the slice train.

**Exterior (deliberately out):**
- Redesigning product/runtime architecture or package splits. The taxonomy
  encodes the **current implied architecture**, including splits we may not
  want long-term. Wrong-tag discoveries are future refactors, not this
  workstream.
- Resolving doc-vs-code discrepancies. They are **logged** in
  `discrepancy-log.md` and decided at the end / later.
- MapGen domain semantics, runtime behavior, game proof. Nothing here touches
  what the code does — only its shape.
- Durable work systems, review/governance process (owned by the existing
  workstream skills and OpenSpec machinery).
- Publishing the harness as a shared plugin (explicitly later; it starts
  repo-local).

### Hard core (violating any of these forces a reframe)

1. **Enforcement-only scope.** The harness encodes and enforces the current
   implied architecture; it never invents target architecture or domain
   behavior. Codemods rewrite known structure; they fail closed on ambiguity.
2. **Five layers, one owner each.** Repository layer = Nx graph + tags;
   import layer = Nx `enforce-module-boundaries` via a purpose-limited,
   quarantined
   ESLint config; file layer = path/generated-zone rules; syntax layer =
   GritQL; hygiene layer = Biome. A concern lives in exactly one layer.
3. **Ratchet invariant.** Every rule lands with an explicit baseline
   (violations enumerated, frozen). Baselines only shrink. A rule is "locked"
   when its baseline is empty; locked rules hard-fail. New rules may land red
   without blocking unrelated work.
4. **Derived, lockable, revisable taxonomy.** Tags and constraints are derived
   from existing enforcement + docs (provenance cited per rule), locked on the
   ratchet now, revised later as deliberate decisions — not silently.
5. **CI is authoritative.** Hooks are local friction reduction. Nothing is
   "verified" because a hook passed.

### Protective belt (can flex without reframe)

- Exact tag names and granularity; exact Grit pattern inventory; hook timing
  details; whether doc-lint checks stay Python or become harness-native TS;
  the order of mid-train slices; Nx version (22.x vs 23).

### Falsifier

- If slice H1's verification shows Nx cannot represent the existing
  turbo.json pipeline + bun workspace graph without breaking `bun run check`
  / CI parity, the "Nx fully" decision returns to Matei with evidence.
- If a whole **class** of existing checks (not an instance) cannot be owned by
  any of the five layers, the layer model is wrong — reframe.

### Degeneration trigger

If three or more invariants that were assigned to a tool layer end up
implemented as bespoke `habitat-native` scripts ("the tool couldn't express
it"), the harness is degenerating into a rebranded script wrapper — stop and
re-evaluate the layer model before adding more rules.

### Structural alternatives considered (and why rejected)

- **Keep Turbo + `eslint-plugin-boundaries` (no Nx).** Rejected by decision
  (Matei: "go Nx fully"), and confirmed unnecessary caution: Nx documents a
  native one-command Turborepo migration and official Bun support (see §4).
- **Pure-CI enforcement (scripts only, no harness CLI/plugin).** Rejected: no
  remediation path (codemods), no agent-facing classify/generate/fix loop, no
  graph queryability — it reproduces the current state with more rules.

### NOT how

Implementation steps live in the OpenSpec change sets
(`openspec/changes/habitat-*`) and nowhere else. This frame does not specify
file contents, command flags, or task order.

---

## 2. Settled decisions (Matei, 2026-06-12)

| # | Decision | Status |
|---|---|---|
| D1 | **Nx fully**, retiring Turbo. No coexistence posture. | Settled |
| D2 | **GritQL stays** — "just make it work." (It does; see §4.) | Settled |
| D3 | **Husky + Biome are in-scope and get done** — not deferred for shared-worktree concerns. Pre-commit auto-staging is allowed **only for files the formatter itself touched** (never blanket `git add -A`). | Settled |
| D4 | **Taxonomy is derived from current state**, lockable on the ratchet; wrong-tag discoveries are future revisions. | Settled |
| D5 | **Doc-vs-code discrepancies are logged, not resolved** during this workstream; design decisions reviewed at the end. | Settled |
| D6 | Trade-offs are allowed but must be recorded visibly as revisitable. | Standing rule |
| D7 | **Habitat is a real CLI and uses oclif**, matching the existing `packages/cli` framework pattern. The H2 Bun-run hand parser is scaffold-only and must be replaced before hooks/generators harden the command surface. | Settled 2026-06-13 |

## 3. Trade-offs taken (revisitable, recorded per D6)

| Trade-off | Choice | Revisit when |
|---|---|---|
| Biome reformat churn | One dedicated reformat commit + `.git-blame-ignore-revs`; Prettier removed in same slice | Never (one-time cost) |
| Pre-commit scope | Format + cheap grit checks on staged files only; full affected verification at pre-push; auto-restage only formatter-touched files | If multi-lane worktree staging conflicts appear in practice |
| ESLint survives (purpose-limited) | Only as the runner for `@nx/enforce-module-boundaries`; all other current ESLint rules migrate to Grit/file-layer | When Nx Conformance or a Biome-native boundary integration covers it |
| Harness CLI framework | Use oclif as the outer command adapter for `habitat`; keep rule/check logic in reusable libraries, not command classes | Revisit only if oclif becomes incompatible with the repo's Node/Bun execution model |
| Doc-lint scripts (`lint-doc-*`, `lint-mapgen-docs.py`) | Wrapped as habitat-native checks, not force-fitted into a tool layer | If they grow; they are doc tooling, not architecture enforcement |
| By-design habitat-native set (excluded from the degeneration-trigger count) | Exactly: adr-lint, doc-ambiguity, mapgen-docs (doc tooling); workspace-entrypoints (manifest rule); G6/G7 (semantic doc/code sync). Everything else must live on its tool layer | If this list grows beyond these six, the growth counts toward the degeneration trigger |
| Nx version | Adopt latest 22.x; do not wait for 23 stable; never 21.5.0/21.6.0 (pulled releases) | `nx migrate` when 23 lands |

## 4. De-risk evidence (all flags resolved 2026-06-12)

### GritQL under Bun — WORKS (proven locally)

Sandbox proof (`/tmp/grit-derisk`, Bun workspace):
- `bun add -d @getgrit/cli` installs cleanly; `bunx grit --version` → `grit 0.1.1`.
- `grit apply` performed a correct structural rewrite (`oldBoundary($args)` → `newBoundary($args)`).
- `grit check` with a repo-local `.grit/patterns/*.md` pattern (level: error,
  custom message) correctly flagged a deep-domain-import sample mirroring our
  real `@mapgen/domain/*/ops/*` rule; `--json` emits machine-readable
  diagnostics (check_id, path, line/col, message, severity).

Gotchas captured for implementation:
1. `grit init` required before `check` (cache dir).
2. Regex capture groups bind metavariables — use non-capturing `(?:...)`.
3. `register_diagnostic` is Biome-plugin GritQL, not grit-CLI; CLI patterns
   use plain match + frontmatter `level`/message.
4. **`grit check` exits 0 even with findings** — the harness wrapper must
   derive pass/fail from `--json` results, never from exit code.

### Biome under Bun — WORKS

`biome --version` through the repo-local package-script/tool PATH →
`2.4.16`.

### Nx ⟂ Turbo — NO CONFLICT (verified from official docs)

- Dedicated recipe: **"Migrating from Turborepo to Nx"** — one command,
  `bunx nx@latest init`, detects `turbo.json` and converts tasks →
  `targetDefaults` (dependsOn/outputs/inputs map 1:1; `cache: true` becomes
  explicit; `persistent` → `continuous`).
  https://nx.dev/docs/guides/adopting-nx/from-turborepo
- Not auto-mapped (needs a manual pass; our turbo.json has 18 task entries):
  `extends`, `passThroughEnv`, `envMode`, `outputLogs`; env vars become cache
  inputs.
- Bun officially supported as package manager (since Nx 19.1); Nx runs on
  Node, invoked via `bunx nx`; pin both runtimes.
  https://nx.dev/docs/guides/nx-cloud/use-bun
- Text `bun.lock` graph parsing fixed in Nx 21.x (nrwl/nx#31973); this repo
  already uses text `bun.lock`. Known foot-guns: don't run Nx on the Bun
  runtime; don't invoke nx from bun `postinstall`.
- `@nx/eslint-plugin` `enforce-module-boundaries` is graph-based, supports
  flat config and **tags in `package.json` (`"nx": {"tags": [...]}`)** — no
  project.json files needed.
  https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries
- Residual (minor, verified at slice H1): whether the converter handles every
  field of our specific turbo.json — H1's first task is the init + diff.

### Nx final settlement — CURRENT CONTRACT (2026-06-14)

H1's official migration path completed and the later
`habitat-nx-worktree-state-contract` pass settled the current repo contract:

- Nx is the only active repository task graph and orchestrator. Turbo has no
  active package dependency, root config, cache, CI, or root-script role.
- Root workflows are thin `bun run <script>` entrypoints into Nx targets:
  `build`, `check`, `lint`, `test`, `verify`, and `ci` all enter the Nx DAG.
- Package-owned proofs live in package targets. Root verifier sprawl does not
  come back; focused proof uses package `verify` modes or explicit Nx targets.
- Root package scripts and Habitat-spawned graph commands invoke `nx ...`
  through the standard Nx global-to-local handoff to the repo-local
  `devDependencies.nx` version.
- No normal workflow sets custom Nx socket/cache/workspace-data overrides,
  disables the daemon globally, repairs package-manager link state, runs
  direct distribution binaries, or resets the Nx cache as a routine step.
- The yargs/string-width install failure was resolved through normal dependency
  hygiene: Nx remains a root dev dependency, `string-width@4.2.3` anchors the
  yargs 17 CJS path, and modern ESM consumers keep scoped `string-width@7`
  copies.
- Current command boundary after the lint-topology repair: `bun run lint` is
  the fast repo-wide Biome hygiene gate. Full Habitat structural proof remains
  explicit through `nx run-many -t habitat:check`,
  `@habitat/cli:habitat:check:all`, `bun run verify`, and
  `bun run check`; it is not hidden inside root lint.

## 5. Spec draft disposition

Input: `habitat-harness-spec-draft-input.md` (local baseline copy derived from
the RAWR draft, 2026-06-12; wording amended on 2026-06-14 for the full-depth
scope correction). Assessment: sound as a target tool-composition spec
(~70%); blind to this repo (~30%). We **adopt** its tool ownership model,
forbidden patterns, invariant-record format, remediation rules, CI posture,
and agent operating procedure. We **amend**:

| Area | Draft says | We do |
|---|---|---|
| Starting point | Greenfield-ish phases | Migration-first: wrap existing 9 scripts + 6 arch tests, then port |
| Turbo | Not mentioned | Explicit Nx migration slice (native converter) |
| Taxonomy | "Each repo defines its own" (examples only) | Derived from existing enforcement, provenance per tag (`taxonomy.md`) |
| Ratchet | Absent | First-class: per-rule baselines, shrink-only, lock-when-empty |
| Existing ESLint config | Unaware | Current restricted-import/syntax blocks migrate to Grit + file layer; ESLint keeps only the Nx boundary rule |
| Hooks | Generic pre-commit restage | D3 condition: restage only formatter-touched files; Graphite-aware |
| Workspaces | `apps/*, packages/*, services/*, tools/*` | This repo's globs + add `tools/*` |
| Runtime pins | Recommended | Adopted through `.nvmrc`, `.bun-version`, and root `packageManager` |
| `bun ci` | Suggested | Keep `bun install --frozen-lockfile` (already in CI) |

## 6. Grounding insights (what the repo actually has)

- **Scale:** 21 workspace projects (3 apps, 15 packages incl. 4 plugins,
  3 mods), ~2,200 TS files, ~305k LOC. Bun workspaces + text bun.lock +
  `linker = "isolated"` already (spec-aligned).
- **Existing enforcement is substantial and mostly green:** 9 lint scripts
  (adapter boundary, workspace entrypoints, domain refactor guardrails,
  recipe imports, normalization guardrails, doc lints, oRPC contract
  ownership), 6+ architecture tests (core purity, recipe import boundary,
  RNG authority, bundle runtime imports, projection band, ecology guardrails),
  ESLint flat config with 8 families of restricted-import/syntax rules, CI
  `architecture-strict-core` job. Allowlists exist (adapter boundary: 6
  exceptions) — the embryonic ratchet.
- **What's missing:** no Nx/Biome/Grit/Husky anywhere; no harness-style local
  hooks (one opt-in `scripts/git-hooks/pre-commit` exists — it publishes the
  civ7-resources submodule via `core.hooksPath`; dispositioned in slice H7);
  prose-only rules (generated-zone read-only, stage truth/projection
  separation, typed intent usage) have **zero enforcement**; checks emit
  human text, not JSON; no codemod capability at all.
- **OpenSpec machinery is mature:** `openspec/config.yaml` authority order,
  ~141 change records, strict validation via `bun run openspec:validate`.
  This workstream is a new change train (`habitat-*`), separate from the
  MapGen normalization train.

## 7. Companion artifacts (this directory)

| File | Contents |
|---|---|
| `habitat-harness-spec-draft-input.md` | Local baseline copy of the input spec draft, with scope-language correction |
| `taxonomy.md` | Derived tag taxonomy, per-project assignments, dep constraints, initial violation backlog |
| `invariant-corpus.md` | Complete corpus of existing checks → harness-owner migration map |
| `discrepancy-log.md` | Doc-vs-code discrepancies (logged per D5, decided later) |
| `workstream-record.md` | Systematic-workstream record: gates, proof classes, slice state |
| `../../../openspec/changes/habitat-*` | The change train (one OpenSpec change per slice) |

## 8. Workstream status

- **Original H1-H8 train:** historical implementation evidence, not current
  closure authority by itself. The recovery frame and claim ledgers decide
  which claims remain true after fresh proof.
- **Latest settled branch:** `agent-F-habitat-nx-worktree-state` for Nx
  workflow normalization.
- **Current recovery phase:** active repair packets under
  `openspec/changes/habitat-*`; command trust is owned by
  `habitat-oclif-entrypoint-repair` before downstream Grit/current-tree proof
  may consume selector behavior.
- **Settled tooling baseline:** Nx is fully adopted, Turbo is retired from
  active workflow, root scripts are Nx DAG entrypoints, package-specific
  verifiers live with their owning package, and normal worktree setup uses
  `bun install` plus the standard repo-local Nx CLI path.
- **Open product work:** command-surface truth, baseline contract repair,
  Grit proof/backfill, classify/generator repair, hook hardening, and per-rule
  locked-violation remediation remain active recovery workstreams until their
  current proof packets close.
