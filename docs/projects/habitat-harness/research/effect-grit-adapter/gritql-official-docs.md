# GritQL / Grit CLI Official Evidence Pack For Habitat Harness

Retrieval date: 2026-06-14.

Official repo snapshot used for source corroboration: `biomejs/gritql`
commit `c80b3026471b229f41b279c3eb0c162dcdacfdb1`.

## Objective

Produce verified or corroborated official-source evidence for the GritQL and
Grit CLI semantics that matter to Habitat Harness proof design before broad
pattern backfill. The next DRA packet needs to decide whether a typed
Effect-backed Grit adapter is warranted and, if so, which guarantees it must
own for 22 check patterns and one apply codemod.

## Frame

- In: official `docs.grit.io` documentation, official `biomejs/gritql`
  repository docs/source/tests, and only the semantics needed for Habitat
  proof: scan scope, fixtures, baseline behavior, injected violations,
  JSON/provenance, and safe apply.
- Foreground: what can be relied on as public Grit behavior versus what Habitat
  must wrap, pin, or empirically probe.
- Exterior: blogs, model memory, Biome's separate GritQL plugin behavior, and
  local Habitat pattern implementation details not yet present in this repo.
- Structural alternative considered: a public-docs-only adapter contract. That
  fails because the public docs do not define JSON schema, local baseline
  semantics, or exit behavior with enough precision for audit-grade proof.
- Falsifier: if a pinned `grit version --jsonl`/`grit help`/empirical probe on
  Habitat's chosen CLI version contradicts the source-derived observations
  below, the adapter contract must prefer the pinned CLI behavior and record
  the public-doc gap explicitly.

## Source Map

Public docs, all retrieved 2026-06-14:

- CLI reference: https://docs.grit.io/cli/reference
- CLI quickstart: https://docs.grit.io/cli/quickstart
- Configuration: https://docs.grit.io/guides/config
- Pattern libraries: https://docs.grit.io/guides/patterns
- Testing GritQL: https://docs.grit.io/guides/testing
- Continuous Integration: https://docs.grit.io/guides/ci
- Syntax reference: https://docs.grit.io/language/syntax
- Patterns: https://docs.grit.io/language/patterns
- Conditions: https://docs.grit.io/language/conditions
- Pattern modifiers: https://docs.grit.io/language/modifiers
- Variable scoping / bubble: https://docs.grit.io/language/bubble
- Common idioms: https://docs.grit.io/language/idioms
- Target languages: https://docs.grit.io/language/target-languages
- Functions: https://docs.grit.io/language/functions

Official repo docs/source URLs, all retrieved 2026-06-14:

- CLI docs source:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/docs/src/pages/cli/reference.mdoc
- Config docs source:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/docs/src/pages/guides/config.mdoc
- Pattern libraries docs source:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/docs/src/pages/guides/patterns.mdoc
- Testing docs source:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/docs/src/pages/guides/testing.mdoc
- CI docs source:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/docs/src/pages/guides/ci.mdoc
- Syntax/pattern docs:
  https://github.com/biomejs/gritql/tree/c80b3026471b229f41b279c3eb0c162dcdacfdb1/docs/src/pages/language
- CLI output flags:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/cli/src/flags.rs
- JSONL messenger:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/cli/src/jsonl.rs
- Check command implementation:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/cli/src/commands/check.rs
- Apply command implementation:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/cli/src/commands/apply_pattern.rs
- Scan JSON implementation:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/cli/src/scan.rs
- MatchResult API:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/core/src/api.rs
- Compact JSONL API:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/core/src/compact_api.rs
- Path expansion:
  https://github.com/biomejs/gritql/blob/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/language/src/target_language.rs
- CLI tests:
  https://github.com/biomejs/gritql/tree/c80b3026471b229f41b279c3eb0c162dcdacfdb1/crates/cli_bin/tests

## Findings With Provenance

### Pattern Syntax And Matching

- Confirmed public behavior: a Grit query root is a pattern; patterns can be
  code snippets, metavariable-bearing snippets, AST node patterns, rewrites,
  regexes, compound patterns, modifiers, or `where`-restricted patterns.
  (sources: https://docs.grit.io/language/syntax; repo lines:
  `docs/src/pages/language/syntax.mdoc` lines 14-84, 92-132, 142-166)
- Confirmed public behavior: snippets can use metavariables; `$filename`,
  `$new_files`, `$program`, and `$grit_*` names are reserved; `$program` means
  the current program, `$filename` the current relative file path, and
  `$new_files` a list of new files. (source: https://docs.grit.io/language/patterns;
  repo lines: `patterns.mdoc` lines 73-96 and 158-164)
- Confirmed public behavior: Grit supports language declarations and currently
  supports JavaScript/TypeScript, Python, JSON, CSS, Rust, Ruby, PHP, and
  alpha/beta languages listed in target-language docs. If no language is
  specified, Grit defaults to JavaScript, but docs warn that may change and
  recommend explicit language declarations. (source:
  https://docs.grit.io/language/target-languages; repo lines:
  `target-languages.mdoc` lines 5-20 and 24-56)
- Confirmed public behavior: `where` can contain one condition or a comma
  separated list, and multiple conditions must all be true. The `<:` operator
  matches a metavariable on the left against a pattern on the right. (source:
  https://docs.grit.io/language/conditions; repo lines:
  `conditions.mdoc` lines 26-35)
- Confirmed public behavior: rewrites are `pattern => pattern`, can include
  metavariables, are themselves patterns, and their right side must be a code
  snippet or a metavariable bound to one. Dot (`.`) on the right side deletes
  matched code. (source: https://docs.grit.io/language/patterns; repo lines:
  `patterns.mdoc` lines 166-216 and 571-573)
- Confirmed public behavior: rewrites can be used in conditions only when the
  left side is a metavariable; the condition matches only if the rewrite
  succeeds for all referenced locations. (source:
  https://docs.grit.io/language/conditions; repo lines:
  `conditions.mdoc` lines 151-157)
- Confirmed public behavior: `bubble` creates a new scope so metavariables
  inside do not stay bound to the same value across all matches in the file.
  Without `bubble`, repeated matches can fail because an existing binding is
  reused. (source: https://docs.grit.io/language/bubble; repo lines:
  `bubble.mdoc` lines 17-52)

### Replacement Limitations And Risk Surface

- Confirmed public behavior: `raw` output bypasses Grit's built-in attempts to
  ensure output code is valid; it should be used only when the emitted text is
  intentionally as-is. (source: https://docs.grit.io/language/patterns; repo
  lines: `patterns.mdoc` lines 50-53)
- Confirmed public behavior: broad rewrites can lose syntactic/semantic details
  such as `async` and argument comments; docs recommend matching a larger
  pattern and rewriting only specific metavariables. (source:
  https://docs.grit.io/language/idioms; repo lines: `idioms.mdoc` lines
  128-181)
- Confirmed public behavior: `$new_files` can create files as a side effect but
  does not consider existing files and can overwrite them. (source:
  https://docs.grit.io/language/idioms; repo lines: `idioms.mdoc` lines 50-82)
- Confirmed public behavior: `sequential` is supported only at the top level of
  a Grit program, and its steps are not auto-wrapped. (source:
  https://docs.grit.io/language/patterns; repo lines: `patterns.mdoc` lines
  434-445)
- Confirmed public behavior: custom JavaScript functions must return a
  stringable value, run in a WebAssembly sandbox, cannot access filesystem or
  network, erroring functions make the pattern fail to match, and foreign
  functions cannot bind new variables. (source:
  https://docs.grit.io/language/functions; repo lines: `functions.mdoc` lines
  113-119)
- Habitat inference: any apply codemod that uses `raw`, `$new_files`, broad
  whole-node rewrites, `todo`, custom JS functions, `sequential`, or
  `multifile` needs an explicit allowlist and additional proof. Public docs
  expose these as powerful features, not safety guarantees.

### Pattern Definitions And Fixtures

- Confirmed public behavior: `.grit/grit.yaml` config can define inline
  patterns with `name`, `tags`, `level`, `body`, `description`, and `samples`.
  `level: none` disables a pattern in the example. (source:
  https://docs.grit.io/guides/config; repo lines: `config.mdoc` lines 21-67)
- Confirmed public behavior: all patterns from `.grit/patterns` are imported by
  default; markdown patterns can live under `.grit/patterns` including
  subdirectories. (sources: https://docs.grit.io/guides/config and
  https://docs.grit.io/guides/patterns; repo lines: `config.mdoc` lines
  153-155)
- Confirmed public behavior: markdown pattern files derive pattern name from
  filename, title from first heading unless front matter overrides it,
  description from first non-heading paragraph, body from first fenced code
  block, metadata from YAML front matter, and test cases from subheadings.
  One code block means a positive match; two code blocks mean input/expected
  output; two identical blocks mean a negative case; `// @filename: example.js`
  can group multiple input/output files. (source:
  https://docs.grit.io/guides/testing; repo lines:
  `docs/src/markdoc/partials/markdown_rules.md` lines 1-11)
- Confirmed public behavior: YAML `samples` under `.grit/grit.yaml` require
  both `input` and `output`. (source: https://docs.grit.io/guides/testing;
  repo lines: `testing.mdoc` lines 27-54)
- Confirmed public behavior: `grit patterns test` runs all defined patterns;
  `--filter` runs a subset. CLI reference also documents `--exclude`,
  `--verbose`, `--update`, and `--watch`. (sources:
  https://docs.grit.io/guides/testing and https://docs.grit.io/cli/reference;
  repo lines: `testing.mdoc` lines 5-10 and `reference.mdoc` lines 453-473)
- Habitat inference: `grit patterns test` is necessary but insufficient for
  injected-violation proof because pattern fixtures prove sample behavior, not
  current-tree scan scope, baseline deltas, ignored-path behavior, or
  production command JSON/provenance.

### Check, Apply, And Baseline Semantics

- Confirmed public behavior: `grit check [PATHS]...` checks pattern violations
  on target paths, defaulting `PATHS` to `.`. Options include `--fix`,
  `--level`, `--no-cache`, `--refresh-cache`, `--github-actions`, and
  `--only-in-json`. (source: https://docs.grit.io/cli/reference; repo lines:
  `reference.mdoc` lines 74-109)
- Confirmed public behavior: `grit apply <PATTERN_OR_WORKFLOW> [PATHS]...`
  accepts a pattern name, pattern body, pattern call, pattern file path, or
  workflow name; target paths default to `.`. Options include `--output`,
  `--limit`, `--dry-run`, `--force`, `--interactive`, `--output-file`,
  `--stdin`, `--cache`, `--refresh-cache`, `--language`, and `--only-in-json`.
  (source: https://docs.grit.io/cli/reference; repo lines: `reference.mdoc`
  lines 147-225)
- Confirmed public behavior: `--dry-run` is documented as showing the changes
  that would be applied; `--force` is documented as force-apply even if there
  are uncommitted changes. (source: https://docs.grit.io/cli/reference; repo
  lines: `reference.mdoc` lines 181-192)
- Confirmed public CI behavior: hosted CI checks run on all files in a commit
  not excluded by `.gritignore`, report `warn` or higher, and fail when an
  `error` level pattern appears that did not previously trigger on the last
  default-branch commit. The GitHub Action does not include a cache of previous
  results and annotates all `warn` or higher results. (source:
  https://docs.grit.io/guides/ci; repo lines: `ci.mdoc` lines 17-34)
- Source-derived behavior: local `grit check` filters enforced patterns at
  `--level` or, by default, `warn`, and skips universal patterns. It exits with
  a `GoodError` when files have rewrites and `--fix` was not used. (sources:
  `check.rs` lines 111-116 and 404-418;
  `error.rs` lines 1-3; tests `check.rs` lines 47-60)
- Source-derived behavior: `grit check --fix` applies rewrite results and then
  returns success with a fixed-file count. (source: `check.rs` lines 404-407)
- Habitat inference: local `grit check` is current-tree oriented, not
  trend-baselined. Hosted CI has baseline/trend semantics, but Habitat should
  not import that baseline model into local proof unless it intentionally wraps
  it. For DRA proof, baseline must be Habitat-owned: clean-tree zero or
  expected-count snapshot, then injected violation delta.

### Scan Roots And Path Filtering

- Confirmed public behavior: check/apply `PATHS` default to `.` and
  `--only-in-json` restricts analysis to ranges in an ESLint-style JSON array
  of filePath/message ranges. (source: https://docs.grit.io/cli/reference;
  repo lines: `reference.mdoc` lines 82-109 and 155-225)
- Confirmed public behavior: Grit ignores `.gitignore` files and any files in a
  `.grit` directory by default. Additional `.gritignore` files are cascading
  glob files. (source: https://docs.grit.io/guides/config; repo lines:
  `config.mdoc` lines 179-186)
- Source-derived behavior: path expansion selects file types by target language,
  adds `.gritignore` as a custom ignore file, explicitly excludes `**/.grit/**`,
  uses standard filters, and accepts multiple start paths. With no target
  language, implementation selects TypeScript and JavaScript file types.
  (source: `target_language.rs` lines 436-480)
- Habitat inference: current-tree scan proof must run in a controlled fixture
  root with explicit paths, explicit language declarations, known `.gitignore`
  and `.gritignore` contents, and no range filter unless the proof is
  specifically for range-restricted scans.

### JSON, JSONL, And Provenance

- Confirmed public behavior: global `--json` and `--jsonl` exist, but docs only
  say they are supported on some commands; no public schema is documented.
  (source: https://docs.grit.io/cli/reference; repo lines: `reference.mdoc`
  lines 61-67)
- Source-derived behavior: `--json` and `--jsonl` conflict with each other and
  are mapped to output formats. For some error paths, JSON/JSONL output formats
  are treated as "always OK" by implementation, meaning the adapter cannot rely
  solely on process exit status. (sources: `flags.rs` lines 1-8 and 66-74;
  `apply_pattern.rs` lines 495-524 and 576-583)
- Source-derived behavior: `grit apply --json` is rejected by the local
  emitter with "JSON output is not supported for apply_pattern"; `--jsonl`
  uses `JSONLineMessenger`. (source: `messenger_variant.rs` lines 276-296)
- Source-derived behavior: `JSONLineMessenger` serializes each `MatchResult` as
  a JSON object per line in standard mode or a compact representation in
  compact mode. (source: `jsonl.rs` lines 57-70)
- Source-derived behavior: `MatchResult` JSONL variants include `PatternInfo`,
  `AllDone`, `Match`, `InputFile`, `Rewrite`, `CreateFile`, `RemoveFile`,
  `DoneFile`, and `AnalysisLog`; rewrites carry original/rewritten file data
  plus optional `reason`; `AllDone` carries `processed`, `found`, and a reason;
  `AnalysisLog` carries level, message, position, file, engine id, optional
  range, syntax tree, and source. (source: `api.rs` lines 17-35, 489-558,
  735-763)
- Source-derived behavior: compact JSONL removes file contents from matches and
  rewrites, preserving source file, ranges, and optional reason. (source:
  `compact_api.rs` lines 13-92)
- Source-derived behavior: `grit check --json` logs a Semgrep-like object with
  `paths` and `results`; each result includes `check_id`, `local_name`,
  `start`, `end`, `path`, and `extra` containing message and severity. This is
  implementation, not public schema. (sources: `scan.rs` lines 7-78 and tests
  `check.rs` lines 70-76)
- Source-derived behavior: plumbing check rewrites can attach a reason with
  source `Gritql`, pattern title/name/level, and no metadata/explanation.
  Normal `check --json` uses the Semgrep-like path instead. (source: `check.rs`
  lines 286-302)
- Habitat inference: Habitat needs its own typed output contract that consumes
  Grit output and emits stable records. The adapter should treat raw Grit JSON
  as an input format, not as Habitat's durable proof artifact.

### Safe Apply Behavior

- Confirmed public behavior: `--dry-run`, `--interactive`, `--force`, and
  `--output-file` are part of apply's documented surface. (source:
  https://docs.grit.io/cli/reference; repo lines: `reference.mdoc` lines
  181-200)
- Source-derived behavior: `--dry-run` conflicts with hidden `--format` and
  `--interactive`; normal result handling applies rewrites only when
  `dry_run` is false. (sources: `apply_pattern.rs` lines 109-132 and
  `emit.rs` lines 148-150)
- Source-derived behavior: if a rewrite would be applied in a dirty git working
  tree and neither `--dry-run` nor `--force` is set, Grit blocks in non-TTY
  environments and prompts in TTY environments. The dirty check includes
  modified, new, and deleted working-tree files including untracked files.
  (sources: `apply_pattern.rs` lines 534-548 and `utils.rs` lines 17-40)
- Source-derived behavior corroborated by official tests: non-TTY apply in a
  dirty git repo fails, reports "Untracked changes detected" and `--force`,
  leaves the target file unmodified, and succeeds when rerun with `--force`.
  (source: `crates/cli_bin/tests/apply.rs` lines 2667-2694)
- Habitat inference: safe apply proof must not depend on Grit's prompt behavior
  because Habitat runs non-interactively. The adapter should enforce its own
  clean temporary worktree, run dry-run first, then apply only after expected
  file/hunk validation.

## Constraints / Invariants To Encode

- Public docs are enough to justify using Grit for structural check/apply, but
  not enough to make raw CLI output an audit-grade contract.
- Habitat must pin and record the exact Grit CLI version or binary hash for all
  proof runs; source-derived behavior is not a stable public guarantee.
- Pattern files for Habitat should declare language explicitly; default
  JavaScript behavior is documented as subject to change.
- Every one of the 22 checks must have at least one positive fixture, one
  negative fixture, and one injected-violation proof against the current tree or
  a controlled fixture tree.
- Fixture tests (`grit patterns test`) and scan tests (`grit check`) are
  separate gates. Passing samples does not prove scan scope or baseline.
- Baseline semantics are Habitat-owned for local proof. Do not rely on hosted
  CI trend semantics unless the DRA explicitly chooses that system boundary.
- Grit output parsing must validate both process exit and record contents.
  `AnalysisLog` at error severity, malformed JSON/JSONL, missing `AllDone`, or
  unexpected file/range provenance must fail the proof.
- `--no-cache` or `--refresh-cache` should be used in proof runs unless the
  proof explicitly covers cache behavior.
- Safe apply requires dry-run, explicit file allowlist, clean temporary
  worktree, expected-diff assertion, apply, post-apply diff assertion, and
  idempotence or follow-up `check` proof.

## Open Questions / Uncertainties

- Public docs do not specify stable JSON/JSONL schemas. Fastest verification:
  pin the Habitat-selected `grit` version, run small probes for `check --json`,
  `apply --jsonl --output compact`, compile error, match-only pattern, rewrite
  pattern, and empty input, then snapshot the accepted adapter input schema.
- Public docs do not specify all exit-code behavior. Fastest verification:
  probe clean no-match, match, rewrite, compile error, parse error, dirty apply,
  and JSONL error modes; encode the wrapper's normalized status contract.
- Public docs do not define local baseline semantics for `grit check`; only
  hosted CI trend baseline is documented. Fastest verification: treat local
  baseline as Habitat-owned and avoid inferring official baseline behavior.
- Public docs do not say whether `grit patterns test --update` has any
  safeguards against accidental fixture rewrites. Fastest verification: do not
  allow `--update` in proof mode; reserve it for authoring mode.
- Public docs do not specify path normalization stability across output modes.
  Fastest verification: probe relative/absolute paths from repo root and
  subdirectories; normalize in the adapter and record the original raw path.
- Public docs do not specify how cache affects JSON/proof determinism. Fastest
  verification: use `--no-cache` in check proof and `--refresh-cache` in any
  cache-specific test.

## Required Habitat Adapter Obligations

For the 22 check patterns:

- Discover exactly 22 intended check patterns from Habitat's configured pattern
  source and fail if the count, names, or levels drift unexpectedly.
- Require each check pattern to be configured at `warn`/`error`, or run
  `grit check --level info` intentionally and record that choice.
- Run `grit patterns test --filter <pattern>` for each pattern's authored
  fixtures, with `--update` disabled in proof mode.
- Run a current-tree or controlled-fixture `grit check` with explicit path
  roots, `--no-cache`, no range filter, and known ignore files.
- For each check, inject a violation into a disposable fixture/current-tree
  copy and prove the adapter observes exactly the expected pattern identity,
  file, range, and severity.
- Prove negative fixtures remain clean and ignored-path fixtures remain ignored.
- Normalize raw output to a Habitat record:
  `patternName`, `level`, `file`, `range`, `command`, `cwd`, `paths`,
  `gritVersion`, `patternDigest`, `fixtureDigest`, `rawOutputDigest`.
- Fail on `AnalysisLog` error records, missing/invalid JSON, missing expected
  `AllDone`/summary, unexpected files, unexpected pattern names, or nonzero
  process exit unless the specific probe declares that nonzero as expected.

For the one apply codemod:

- Run in an isolated clean git worktree or temp copy; never apply directly to a
  dirty developer tree.
- First execute `grit apply <codemod> <paths> --dry-run --jsonl --output compact`
  or an empirically selected equivalent. If the selected Grit version cannot
  provide usable dry-run JSONL, capture standard output plus a filesystem diff
  after a temp apply.
- Validate the candidate rewrite set before applying: expected files only,
  expected count/ranges, no `AnalysisLog` error, no unapproved `CreateFile`,
  `RemoveFile`, `raw`, `todo`, `$new_files`, or broad whole-node rewrite risk.
- Apply only after dry-run validation, then assert the resulting diff matches
  the expected allowlist and re-run the relevant check set.
- Prove idempotence: a second dry-run/apply pass should produce zero rewrites
  or an explicitly accepted stable residual.
- Record full provenance for the codemod: raw Grit output digest, before/after
  file digests, normalized rewrite records, command/cwd/env, Grit version, and
  adapter version.

## Suggested Next Edits

- file: `docs/projects/habitat-harness/research/effect-grit-adapter/gritql-official-docs.md`
  -> change: keep as the official-source evidence anchor for the DRA packet.
- file: future Habitat adapter spec
  -> change: encode the wrapper contract above instead of exposing raw Grit CLI
  JSON as the durable proof schema.
- file: future Habitat probe suite
  -> change: add empirical probes for JSON schema, exit codes, path
  normalization, cache behavior, dirty apply, and baseline/injected-violation
  behavior on the pinned Grit version.
