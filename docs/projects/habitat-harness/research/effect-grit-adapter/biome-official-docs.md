# Biome Official CLI Evidence for Habitat Harness

Retrieval date: 2026-06-14
Evidence standard: verified or corroborated from official Biome documentation only.
Scope note: this note uses current Biome v2.x documentation as retrieved. The repo
does not currently pin `@biomejs/biome` in `package.json` or `bun.lock`; if
Habitat later pins a Biome version, re-verify against that exact binary and docs.

## Objective

Produce an official-source evidence pack for Biome CLI semantics relevant to
Habitat Harness command proof and fix pipelines, especially where Habitat combines
Grit structural rewrites with Biome check/fix/format/lint behavior.

The product frame is truthful structural automation for agents. Biome can provide
formatter, linter, assist, reporter, config-discovery, and fix behavior, but
Habitat must own command provenance, proof classification, protected-path policy,
cache boundaries, and nonzero-exit interpretation.

Frame commitments:

- In scope: Biome CLI commands, safe/unsafe fix semantics, reporters, diagnostics
  and failure behavior, config discovery, ignores/protected files, VCS/CI/local
  flags, GritQL/plugin rewrite behavior, and Habitat adapter obligations.
- Foreground: what Biome officially guarantees versus what Habitat must mediate
  through its command runner and proof substrate.
- Exterior: blogs, model memory, non-official summaries, performance tuning except
  where it affects logs/daemon/provenance, and unpinned local runtime behavior.
- Falsifier: a pinned Habitat Biome version or official source contradicts the
  current v2.x docs, or empirical behavior from that pinned binary conflicts with
  documented semantics.
- Structural alternative considered: direct trust in `biome check --write` as a
  proof operation. Rejected because Biome owns code transformation and diagnostics,
  not Habitat proof provenance, protected-path constraints, or cache semantics.

## Source Map

Official sources used:

- Biome CLI reference: https://biomejs.dev/reference/cli/ (retrieved 2026-06-14)
- Biome diagnostics reference: https://biomejs.dev/reference/diagnostics/ (retrieved 2026-06-14)
- Biome reporters reference: https://biomejs.dev/reference/reporters/ (retrieved 2026-06-14)
- Configure Biome guide: https://biomejs.dev/guides/configure-biome/ (retrieved 2026-06-14)
- Biome configuration reference: https://biomejs.dev/reference/configuration/ (retrieved 2026-06-14)
- Biome continuous integration recipe: https://biomejs.dev/recipes/continuous-integration/ (retrieved 2026-06-14)
- Biome git hooks recipe: https://biomejs.dev/recipes/git-hooks/ (retrieved 2026-06-14)
- Biome linter guide: https://biomejs.dev/linter/ (retrieved 2026-06-14)
- Biome formatter guide: https://biomejs.dev/formatter/ (retrieved 2026-06-14)
- Biome assist guide: https://biomejs.dev/assist/ (retrieved 2026-06-14)
- Biome GritQL reference: https://biomejs.dev/reference/gritql/ (retrieved 2026-06-14)
- Biome linter plugins guide: https://biomejs.dev/linter/plugins/ (retrieved 2026-06-14)
- Biome language support page: https://biomejs.dev/internals/language-support/ (retrieved 2026-06-14)
- Biome extension integration guide, daemon/log details:
  https://biomejs.dev/guides/editors/create-an-extension/ (retrieved 2026-06-14)
- Biome slowness guide, CLI log-file/log-kind details:
  https://biomejs.dev/guides/investigate-slowness/ (retrieved 2026-06-14)

## Findings (with provenance)

### Confirmed official behavior

- Verified: `biome check` runs formatter, linter, and import sorting on requested
  files; `biome lint` runs checks; `biome format` runs the formatter; `biome ci`
  is the CI command and runs formatter, linter, and import sorting read-only.
  `biome search` is experimental and searches Grit patterns across a project.
  Source: https://biomejs.dev/reference/cli/

- Verified: `biome ci` is documented as read-only: files are not modified. The
  CI recipe says `biome ci` should be used in CI and, compared to `check`, does
  not provide `--write`/`--fix`, integrates better with specific runners, allows
  thread control, and uses `--changed` rather than `--staged` when VCS integration
  is enabled. Sources: https://biomejs.dev/reference/cli/ and
  https://biomejs.dev/recipes/continuous-integration/

- Corroborated: `biome check --write` applies safe fixes, formatting, and import
  sorting; `--fix` is an alias for `--write`; `--unsafe` applies unsafe fixes and
  should be used with `--write` or `--fix`. `biome lint --write` writes safe fixes,
  with `--fix` again an alias; `biome format --write` writes formatted files.
  Sources: https://biomejs.dev/reference/cli/,
  https://biomejs.dev/linter/, and https://biomejs.dev/formatter/

- Verified: Biome distinguishes safe and unsafe fixes. Safe fixes are documented
  as guaranteed not to change code semantics and can be applied without explicit
  review. Unsafe fixes may change program semantics and should be manually
  reviewed. Source: https://biomejs.dev/linter/

- Verified: Biome linter plugin rewrites use GritQL and the `=>` operator.
  Without `--write`, rewrites are suggestions only. With `--write`, Biome applies
  plugin rewrites marked `fix_kind = "safe"`. With `--write --unsafe`, it also
  applies unsafe rewrites. If `fix_kind` is omitted, the rewrite is treated as
  unsafe by default. Source: https://biomejs.dev/linter/plugins/

- Verified with uncertainty: Biome GritQL currently supports JavaScript/TypeScript,
  CSS, and JSON targets; Biome uses GritQL for analyzer plugins and `biome search`.
  The official GritQL page says support is actively being worked on, bugs are
  expected, and some features are missing. It also cautions that grammar/node names
  may change between versions. Source: https://biomejs.dev/reference/gritql/

- Corroborated with boundary: GritQL has parsing and formatting support in
  Biome's language support matrix. The broader matrix lists plugin support across
  several Biome languages, but the GritQL reference and linter-plugin guide
  constrain current GritQL targets to JavaScript/TypeScript, CSS, and JSON.
  Sources: https://biomejs.dev/internals/language-support/,
  https://biomejs.dev/reference/gritql/, and
  https://biomejs.dev/linter/plugins/

- Verified: Assist is enabled by default in configuration. `biome check` can
  enforce assist actions; by default it enforces assists, and
  `--enforce-assist=false` prevents diagnostic errors for unapplied assist
  actions. Assist fixes are described as generally safe, and source-group assist
  actions typically do not change program functionality. Sources:
  https://biomejs.dev/assist/ and https://biomejs.dev/reference/configuration/

- Verified: The CLI supports reporters `default`, `json`, `json-pretty`,
  `github`, `junit`, `summary`, `gitlab`, `checkstyle`, `rdjson`, `sarif`, and
  `concise`, plus `--reporter-file=PATH`. The reporters page says the JSON and
  JSON-pretty reporters are experimental and subject to changes in patch releases.
  Sources: https://biomejs.dev/reference/cli/ and
  https://biomejs.dev/reference/reporters/

- Verified: Error diagnostics affect process status. The diagnostics reference
  says error diagnostics force the CLI to exit with an error code. The linter
  guide says `"error"` diagnostics always cause an error exit, `"warn"` does not
  unless `--error-on-warnings` is used, and `"info"` does not affect exit status
  even with `--error-on-warnings`. Sources:
  https://biomejs.dev/reference/diagnostics/ and https://biomejs.dev/linter/

- Verified with uncertainty: The official docs establish error versus non-error
  exit behavior but do not specify stable numeric exit-code values or a taxonomy
  that distinguishes diagnostics, config errors, parse errors, unmatched files,
  internal errors, and fatal errors solely by integer code. Sources:
  https://biomejs.dev/reference/diagnostics/ and
  https://biomejs.dev/reference/cli/

- Verified: `--no-errors-on-unmatched` silences errors emitted when no files were
  processed. `--files-ignore-unknown=true` tells Biome not to emit diagnostics for
  files it does not know how to handle. `--skip-parse-errors` skips files with
  syntax errors instead of emitting an error diagnostic. Sources:
  https://biomejs.dev/reference/cli/ and
  https://biomejs.dev/reference/configuration/

- Verified: Biome config file names are discovered in this order:
  `biome.json`, `biome.jsonc`, `.biome.json`, `.biome.jsonc`. Biome discovers
  config from the current working directory, then parent folders, then OS-specific
  home config locations. If no config is found, defaults apply. Source:
  https://biomejs.dev/guides/configure-biome/

- Verified: `--config-path=PATH` and `BIOME_CONFIG_PATH` set a config file path
  or a directory where Biome should find config, and disable the default
  resolution process. CLI reference documents `BIOME_CONFIG_PATH` for the global
  option. Sources: https://biomejs.dev/guides/configure-biome/ and
  https://biomejs.dev/reference/cli/

- Verified: Paths and globs in Biome config are resolved relative to the folder
  containing the configuration file, except where an extended configuration is
  involved. `files.includes` applies globally to Biome tools; tool-specific
  includes cannot match files excluded by `files.includes`. Source:
  https://biomejs.dev/guides/configure-biome/

- Verified: Biome always ignores protected files and emits no diagnostics for
  them. Current protected files are `composer.lock`, `npm-shrinkwrap.json`,
  `package-lock.json`, and `yarn.lock`. Source:
  https://biomejs.dev/guides/configure-biome/

- Verified: `files.includes` supports positive globs and negated globs with `!`
  to exclude files from lint/format. It also supports double-negated `!!` force
  ignore for project-related operations such as module graph construction and type
  inference. Biome recommends force-ignore for output folders such as `build/` and
  `dist/`, while generated files may use regular ignore so type information can
  still be extracted. Sources: https://biomejs.dev/guides/configure-biome/ and
  https://biomejs.dev/reference/configuration/

- Verified: VCS integration is off by default. When `vcs.useIgnoreFile` is true,
  Biome ignores files specified in VCS ignore files, Git local exclude, and
  `.ignore` files; nested ignore files are supported. Sources:
  https://biomejs.dev/reference/configuration/ and
  https://biomejs.dev/reference/cli/

- Verified: CLI path arguments are files or directories. Command-line globs are
  expanded by the shell, not Biome, and Biome docs discourage globs in favor of
  includes configuration. Sources: https://biomejs.dev/guides/configure-biome/,
  https://biomejs.dev/linter/, and https://biomejs.dev/formatter/

- Verified: For stdin mode, `--stdin-file-path=PATH` determines language and may
  affect overrides or nested config. If the path does not exist on disk, Biome
  treats it as virtual and does not require it to be part of the project file set;
  ignore checks via `files.includes` and VCS ignore rules are skipped. Source:
  https://biomejs.dev/reference/cli/

- Corroborated: Local pre-commit usage should use `--staged` and often
  `--no-errors-on-unmatched`; official git-hook examples include
  `biome check --staged --files-ignore-unknown=true --no-errors-on-unmatched`
  for checking staged files and `biome check --write --staged ...` for safe fixes.
  Source: https://biomejs.dev/recipes/git-hooks/

- Verified: Logging defaults matter for machine parsing. The CLI supports
  `--log-file`, `--log-level`, and `--log-kind`; if `--log-file` is omitted, logs
  are printed to stdout. `--log-level` defaults to `none`. The slowness guide
  shows `--log-level=tracing --log-kind=json --log-file=tracing.json` for
  structured logs. Sources: https://biomejs.dev/reference/cli/ and
  https://biomejs.dev/guides/investigate-slowness/

- Verified: Biome supports a daemon through `biome start` and `--use-server`.
  The extension guide says daemon users are responsible for stopping/restarting
  the process to avoid ghost processes and advises daemon operations only on
  single files because daemon operations are significantly slower than CLI itself.
  Sources: https://biomejs.dev/reference/cli/ and
  https://biomejs.dev/guides/editors/create-an-extension/

### Habitat inference from official behavior

- Habitat can rely directly on Biome to perform documented transformations and
  diagnostics for a captured invocation, but not to provide Habitat proof. Proof
  must be mediated because official Biome semantics depend on argv, cwd, config
  discovery, VCS settings, ignore settings, target paths, stdin path reality,
  reporter choice, log settings, and Biome version.

- `biome ci` is the right Biome primitive for read-only proof checks in CI-like
  contexts. `biome check --write` is the right broad safe-fix primitive when the
  Habitat phase intentionally permits formatting, safe lint fixes, assist, and
  import sorting together. `biome lint --write` or `biome format --write` should
  be used when Habitat wants to limit the transformation surface.

- `--unsafe` must be a separate Habitat phase or explicit gate. Official docs say
  unsafe fixes may change semantics, and Grit plugin rewrites default to unsafe
  when `fix_kind` is omitted. Habitat should never hide `--unsafe` inside a
  generic "fix" command.

- JSON reporter output is useful for machines but cannot be treated as a stable
  long-lived schema because Biome marks JSON reporters experimental and patch
  mutable. Habitat should persist raw reporter output and parse it behind a
  versioned adapter.

- Nonzero exit should not be collapsed into "tool failed." Habitat should classify
  at least: code-quality diagnostic failure, warning-escalated failure, parse
  failure, config/discovery failure, unmatched-file failure, unknown-file failure,
  internal/fatal Biome failure, runner/process failure, and protected-path policy
  failure.

- Zero exit should not be treated as structural proof unless Habitat also records
  the file set actually checked. `--no-errors-on-unmatched`,
  `--files-ignore-unknown`, protected files, config includes, VCS ignore, and
  virtual stdin paths can all produce a successful command that is not proof over
  the intended paths.

- Habitat protected-path constraints must be stricter than Biome's. Biome's
  official protected list is narrow and lockfile-focused; Habitat also has
  generated artifacts, repo policy, proof artifacts, and possibly user-protected
  paths that Biome does not know about.

- For proof-grade runs, Habitat should avoid `--use-server` unless it captures the
  daemon lifecycle, version, log path, and restart/stop behavior. Plain CLI runs
  have fewer hidden state surfaces.

## Constraints / invariants to encode

- Command provenance invariant: every Habitat Biome run records exact executable,
  Biome version, command name, argv, cwd, env variables relevant to Biome
  (`BIOME_CONFIG_PATH`, `BIOME_LOG_*`, `BIOME_THREADS`, daemon-related settings),
  stdin content hash if used, and whether `--use-server` was used.

- Config provenance invariant: every run records resolved config source
  (`--config-path`, `BIOME_CONFIG_PATH`, discovered file, or defaults), config file
  content hash when present, config directory, effective VCS settings, and
  `files.includes` / tool includes that constrain the target set.

- Target-set invariant: every proof run records requested paths, expanded shell
  argv exactly as received, discovered processed path set where available, ignored
  or protected path decisions, and pre/post content hashes for paths that can be
  modified.

- Fix phase invariant: `ci`/plain `check` are read-only proof phases;
  `check --write`, `lint --write`, and `format --write` are safe-write phases;
  `--unsafe` is a separately named unsafe-write phase requiring explicit policy
  authorization and diff review.

- Grit plugin invariant: plugin rewrites without `fix_kind = "safe"` are unsafe
  by official Biome semantics. Habitat's Grit adapter must surface fix_kind,
  plugin path, plugin content hash, target language, and whether the rewrite was
  suggestion-only, safe-applied, or unsafe-applied.

- Reporter invariant: use `--reporter-file` for machine output when possible; if
  reporter output is captured from streams, capture both stdout and stderr and
  store raw bytes. Treat `json` and `json-pretty` as unstable input schemas.

- Log separation invariant: for parseable reporter output, leave
  `--log-level=none` or route logs to `--log-file`; otherwise logs can share
  stdout with reporter output.

- Exit classification invariant: exit code alone is insufficient. Classification
  must combine exit status, parsed diagnostics when available, raw output,
  command phase, flags such as `--error-on-warnings`, and target-set expectation.

- Protected-path invariant: Habitat checks protected/generated/read-only paths
  before invoking Biome and again before accepting a diff. Biome's built-in
  protected list is treated as an additional guard, not Habitat's policy boundary.

- Stdin invariant: virtual `--stdin-file-path` is not closure-capable proof for
  repo path protection or ignore compliance because official docs say ignore
  checks are skipped when the path does not exist on disk.

- Cache/provenance invariant: cache keys for Biome proof/fix outputs include
  Biome version, executable path, argv, cwd, relevant env, config hash, target path
  hashes, plugin hashes, VCS metadata/default branch when using `--changed` or
  `--staged`, reporter mode, and safe/unsafe phase. Cache hits must not cross
  safe/unsafe boundaries.

- CI/local invariant: use `biome ci` for CI proof and `--staged` only for local
  staged-file workflows. Do not use `--staged` as CI proof because official docs
  identify staged files as local-only semantics.

## Open questions / uncertainties

- Numeric exit codes are not specified in the official docs reviewed. Fastest
  verification: install or locate the Habitat-pinned Biome binary, run a small
  fixture matrix, and record `(scenario, argv, stdout, stderr, exitCode)`.

- The local repo does not currently pin Biome. Fastest verification: decide
  Habitat's supported Biome version and add a version policy before claiming
  adapter stability.

- The JSON reporter schema is explicitly experimental. Fastest verification:
  inspect the pinned Biome source/tests or run a fixture corpus and snapshot the
  actual JSON schema under Habitat's adapter tests.

- Official CLI summary says `check` and `ci` run import sorting, while current v2
  docs also describe assist as a default tool and check-enforced assist. Fastest
  verification: run pinned Biome fixtures that isolate organize imports versus
  generic assist actions and record which diagnostics/fixes appear under
  `check`, `check --write`, and `check --enforce-assist=false`.

- The official docs say reporter output is printed to terminal but do not provide
  a stable stdout/stderr channel guarantee for every reporter. Fastest
  verification: fixture-run each Habitat-used reporter and record stream routing;
  prefer `--reporter-file` regardless.

- Biome protected files are officially limited. Fastest verification: define
  Habitat's protected/generated path policy from repo docs and command-runner
  requirements instead of expanding from Biome.

## Suggested next edits

- file: `docs/projects/habitat-harness/research/effect-grit-adapter/biome-official-docs.md`
  -> change: keep this evidence note as the source-backed baseline for Biome CLI
  adapter semantics.

- file: Habitat command-runner design doc (to locate or create)
  -> change: add required run record fields for argv/cwd/env/config/target-set,
  stdout/stderr/raw reporter capture, exit classification, and cache key inputs.

- file: Habitat Grit/Biome adapter spec (to locate or create)
  -> change: encode safe/write/unsafe phases, plugin `fix_kind` handling,
  reporter parsing strategy, and protected-path preflight/postflight gates.

- file: Habitat adapter test fixtures (to locate or create)
  -> change: add fixture matrix for check/ci/lint/format, write/fix/unsafe,
  unmatched files, unknown files, parse errors, warning escalation, JSON reporter,
  reporter-file, stdin virtual path, ignored files, and protected paths.
