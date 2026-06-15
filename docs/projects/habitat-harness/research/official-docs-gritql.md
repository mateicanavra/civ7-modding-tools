# Official GritQL Documentation Evidence Pack

Retrieval date: 2026-06-14. Evidence scope: official Grit/GritQL documentation only. This pack is audit-grade research support for Habitat design/spec work, not final decision authority.

## Frame Carried Forward

- Selection: rule/codemod semantics that must shape Habitat's Grit pattern workstream: syntax, language/parser support, scan roots, apply behavior, testing, dry-run, precision, limitations, and enforcement evidence.
- Foreground: repo-local executable structure for agents: classify before authoring, generate supported pattern structure, enforce by owner layer, keep baselines shrink-only, transform safely, and keep records truthful to observed behavior.
- Exterior: product/runtime architecture decisions, non-Grit enforcement layers except where Grit boundaries matter, Grit Cloud as an operating dependency, Studio/VS Code authoring workflows, and blog/example-only claims.
- Hard core: Habitat cannot treat a Grit pattern as enforced or rewriting unless official docs support the semantic surface and local proof covers the missing operational contract.
- Falsifier: if official docs and local proof cannot establish deterministic scope, parser support, match precision, and non-destructive apply behavior for a rule class, that rule class must leave the Grit syntax/codemod layer or remain advisory.

## Sources

| ID | Official URL | Used for |
|---|---|---|
| S1 | https://docs.grit.io/ | GritQL overview, search/modify purpose, supported-language marketing surface |
| S2 | https://docs.grit.io/language/overview | Embedded query language purpose |
| S3 | https://docs.grit.io/tutorials/gritql | Structural matching, rewrites, conditions, valid-snippet limitation |
| S4 | https://docs.grit.io/language/patterns | Pattern forms, rewrites, file/program/range/multifile/sequential/regex |
| S5 | https://docs.grit.io/language/syntax | Syntax cheat sheet |
| S6 | https://docs.grit.io/language/modifiers | `and`, `or`, `any`, `not`, `maybe`, `contains`, `within`, `limit`, list modifiers |
| S7 | https://docs.grit.io/language/conditions | `where`, `<:`, boolean conditions, rewrites in conditions, assignments |
| S8 | https://docs.grit.io/language/bubble | metavariable scope, `bubble`, auto-wrap, global metavariables |
| S9 | https://docs.grit.io/language/target-languages | target languages, language declaration, parser variants/defaults |
| S10 | https://docs.grit.io/guides/patterns | custom pattern definitions and `.grit` pattern files |
| S11 | https://docs.grit.io/guides/config | `.grit/grit.yaml`, pattern metadata, imports, `.gritignore`, suppression |
| S12 | https://docs.grit.io/guides/testing | pattern test conventions |
| S13 | https://docs.grit.io/guides/authoring | authoring format and test-loop guidance |
| S14 | https://docs.grit.io/cli/reference | CLI command semantics and flags |
| S15 | https://docs.grit.io/guides/ci | hosted CI baseline/trend behavior and GitHub Action limitation |
| S16 | https://docs.grit.io/language/idioms | `$new_files`, specific rewrites, targeting code blocks |
| S17 | https://docs.grit.io/language/functions | custom/JS functions, built-ins, JS function limitations |

## Findings

- [CONFIDENT] GritQL is for structural code search and transformation. Official docs describe it as a query language for searching/modifying source code and as Grit's embedded language for searching/transforming source code. Code snippets are AST-aware rather than raw string matches; the tutorial notes they can match multiline/single-quote variants while ignoring comments, but snippets must be valid code for the target language. Exact strings and regex are separate tools when AST-aware snippets are wrong. (S1, S2, S3, S4)
- [CONFIDENT] A Grit pattern both finds matches and may execute a transformation. The docs define rewrites with `=>`; rewrites are themselves patterns. `.` deletes matched code only on the right-hand side. `raw` snippets bypass Grit's validity help and can produce invalid output, so they are unsafe as default generator output. (S4, S5)
- [CONFIDENT] Match precision lives in conditions and modifiers, not just snippet shape. `where` introduces required conditions; multiple conditions in braces all must hold. `<:` matches a metavariable against a pattern. `contains` descends the syntax tree, `within` searches upward, `until` stops traversal, `before`/`after` constrain adjacency, `some`/`every` handle lists, and `limit` applies only at the root query and globally across queried files. `or` short-circuits; `any` continues and runs all applicable transformations. (S6, S7)
- [CONFIDENT] Scope is a major semantic hazard. By default, metavariables share scope across the target file after binding. Pattern definitions and `bubble` create new scopes; root patterns that do not target `file` or `body` are auto-wrapped as `file(body = contains bubble $root_pattern)` so they can match independently multiple times in a file. If a rule needs file-level shared binding, it must deliberately use `file(...)` or global metavariables. (S8)
- [CONFIDENT] Supported-language status must be carried as rule metadata. The target-language page lists JS/TS, Python, JSON, CSS, Rust, plus Java/HCL/Solidity/Markdown/YAML/Go/SQL as Alpha and Ruby/PHP as Beta. It recommends always specifying `language` because the default JavaScript behavior may change; current JS without a variant defaults to TypeScript with JSX enabled. (S9)
- [CONFLICT] Official docs disagree on the language surface. The CLI reference `--language` values include entries not listed on the target-language page, such as `html`, `kotlin`, `csharp`, `elixir`, `vue`, and `toml`, and duplicate `php`. Habitat should treat the target-language page as the higher-quality semantic source and require local proof before using a CLI-listed-only language. (S9, S14)
- [CONFIDENT] Repo patterns have documented structure. Grit config lives at `.grit/grit.yaml`; patterns can be listed with `name`, `title`, `body`, `description`, `level`, and `tags`. `level` is one of `none`, `info`, `warn`, `error` and defaults to `info`. Patterns in `.grit/patterns` are imported by default. Markdown patterns in `.grit/patterns` use file name as pattern name, first heading as title, first non-heading paragraph as description, first fenced code block as body, and subheadings for tests. (S10, S11, S12, S13)
- [CONFIDENT] Pattern identity must stay unique. Config docs say named pattern resolution associates each named pattern with a single unique body and warns against same file names in subdirectories because they cause conflicts. Remote module resolution is flat and duplicate names across modules can error. Habitat generators should prevent duplicate pattern IDs before Grit sees them. (S11)
- [CONFIDENT] Scan roots and ignores are explicit. `grit check [PATHS]...` and `grit apply <PATTERN> [PATHS]...` default paths to `.`. Grit ignores `.gitignore` entries and `.grit` directories by default; additional cascading `.gritignore` files can omit files/dirs. Inline `grit-ignore` comments suppress named patterns on specific lines. `grit check --only-in-json` can restrict analysis to ESLint-style file ranges. (S11, S14)
- [CONFIDENT] `check` and `apply` have different operational surfaces. `grit check` checks current directory/path(s) for violations and supports `--fix`, `--level`, cache controls, GitHub Actions output, and `--only-in-json`. `grit apply` applies a pattern/migration to path(s), supports pattern forms (`name`, `body`, `call`, `ai`, `path`, `workflow`), and has `--dry-run`, `--interactive`, `--force`, `--stdin`, `--output`, `--jsonl`, `--language`, `--only-in-json`, cache controls, and `--format`. (S14)
- [UNCERTAIN] Dry-run is documented only for `grit apply` as "Show a dry-run of changes." Official docs do not specify the output schema, whether it is guaranteed no-write in all modes, how it interacts with `--stdin`/`--output`, or whether `grit check --fix` has an equivalent dry-run path. Habitat must verify this locally before relying on dry-run as a safety gate. (S14)
- [CONFIDENT] Official CI shrink behavior is hosted-check-specific. Hosted Grit CI runs on files in a commit not excluded by `.gritignore`, reports `warn` or higher, and fails if an `error`-level pattern newly triggers relative to the last commit on the default branch. The GitHub Action does not include previous-result cache and annotates all `warn`+ findings. Therefore Habitat's repo-local shrink-only baseline cannot be delegated to generic `grit check`; it must be a Habitat-owned wrapper/record. (S15)
- [CONFIDENT] Pattern tests are first-class evidence. `grit patterns test` tests all defined repo patterns; `--filter` selects subsets; CLI also documents `--exclude`, `--verbose`, `--update`, and `--watch`. Markdown tests use subheadings: one code block means "should match", two code blocks mean input/expected output, identical two-block cases are negative tests, and `// @filename: example.js` supports grouped multi-file examples. YAML inline patterns can carry `samples` with `input` and `output`. (S12, S14)
- [CONFIDENT] Safe rewrites should be precise and preserve original syntax. The idioms page recommends matching a larger pattern and rewriting only specific metavariables inside `where`, because broad whole-snippet rewrites can lose syntax/semantic details such as `async` or comments. (S16)
- [CONFIDENT] File-creating transforms need extra collision proof. `$new_files` creates files as a pattern side effect, but official docs warn it does not consider existing files and can overwrite them. (S16)
- [CONFIDENT] Multifile and sequential patterns are specialized, higher-risk semantics. `sequential` is top-level only and steps are not auto-wrapped. `multifile` evaluates steps across all files with shared global state; each step must top-level as `file()` optionally preceded by `bubble`. Docs suggest `$new_files` is faster if merely creating files. (S4)
- [CONFIDENT] JS custom functions are not a stable enforcement substrate without extra proof. Docs mark JavaScript functions as alpha without stability guarantees; they must return stringable values, run in a WebAssembly sandbox, cannot access filesystem/network, errors cause the pattern to error/fail to match, and they cannot bind new variables. (S17)

## Implications For Habitat Pattern Workstreams

- Classify first: a candidate Grit rule must state target language, parser variant, owner layer, scan roots, and whether it is check-only or rewrite-capable before pattern authoring starts. CLI-listed-only language support is provisional until locally proven.
- Generate supported structure: the Habitat Grit generator should emit `.grit/patterns/<pattern-id>.md` with frontmatter `level`/`tags`, a heading/title, description, one fenced Grit body with explicit `language`, and test subheadings. It should reject duplicate pattern IDs and discourage inline YAML bodies except for very small generated rules.
- Enforce through owner layers: use Grit for syntax-shape invariants and codemods only. Import graph, file ownership, generated-zone, and hygiene concerns should not be forced into Grit when another Habitat layer owns them.
- Baselines shrink-only: official hosted checks have trend-sensitive behavior, but local CLI docs do not provide a repo-local baseline contract. Habitat must own the baseline file, compare current JSON/JSONL findings to it, fail on new findings for ratcheted rules, and only accept baseline shrinkage.
- Safe check path: check-only patterns need positive tests, negative tests, owner-root scan proof, `.gritignore`/suppression policy, and wrapper proof for machine-readable diagnostics before moving from advisory to enforcing.
- Safe rewrite path: rewriting patterns additionally need expected-output tests, `grit apply --dry-run` proof, no `--force` by default, clean-worktree precondition, idempotence proof where relevant, and review of all touched paths. `$new_files`, `raw`, `multifile`, `sequential`, and JS functions require explicit escalation evidence.
- Match precision discipline: prefer structural snippets plus `where`/`<:`/`within`/`contains`/`until` over broad regex. Use `file(...)` only when shared file-level bindings are intended; otherwise rely on auto-wrap/bubble behavior and test multiple matches per file.
- Records stay truthful: every pattern record should include official-doc source IDs, local CLI version/proof date, supported/unsupported constructs used, known false-positive controls, and whether dry-run/apply behavior has been verified in this repo.

## Non-Applicable Areas

- Grit hosted checks and the Grit GitHub App are evidence for possible baseline semantics, not an operating dependency for Habitat's repo-local harness.
- Grit Studio, VS Code extension guidance, videos, and web app workflows are authoring aids, not enforcement evidence.
- `grit apply --ai` and remote workflow/blueprint features are outside this Habitat lane unless separately framed; they are not audit-grade deterministic pattern infrastructure.
- Remote Grit modules and the standard library are not automatically Habitat authority. They may be imported only with explicit provenance, pinning/update policy, and local tests.
- JavaScript custom functions are non-default for enforced or rewriting patterns because official docs mark them alpha and constrain their runtime heavily.

## Uncertainties

- The CLI docs do not specify `grit check` exit-code semantics or the JSON/JSONL schema. Fast verification: run the installed repo-pinned CLI on a known violating pattern and record status code plus output schema.
- The dry-run docs do not define no-write guarantees beyond the flag description. Fast verification: run `grit apply --dry-run` against a temp repo and compare git diff, mtimes, and output.
- Target-language docs conflict with CLI language values. Fast verification: run one tiny match and one rewrite per candidate Habitat language/parser variant under the pinned CLI.
- `--only-in-json` semantics are documented but not enough to prove staged-range behavior. Fast verification: feed a two-range ESLint-style JSON input and confirm only those ranges produce findings/rewrites.
- `.gritignore` interaction with explicit path arguments and inline suppressions needs local proof for Habitat scan roots. Fast verification: create temp nested `.gritignore` and explicit include path cases.
- Remote module pinning/version behavior is under-specified in docs. Fast verification: avoid remote modules for enforced Habitat rules until a pinning/update policy is established.
- Multi-file rewrite ordering/global-state behavior needs repo-local proof before use. Fast verification: write focused multifile tests with conflicting names/imports and confirm deterministic output.

## Stop/Reframe Triggers

- A rule requires a target language/parser unsupported by the target-language docs and not locally proven.
- False positives cannot be reduced with documented Grit conditions/modifiers without hiding true positives.
- A rewrite requires `raw`, `$new_files`, `multifile`, `sequential`, JS functions, or `--force` and lacks explicit collision/idempotence/proof.
- A candidate Grit rule is really an import graph, file ownership, generated-zone, or hygiene concern owned by another Habitat layer.
- The baseline mechanism cannot prove shrink-only behavior repo-locally without hosted Grit checks.
- Official docs conflict with local observed behavior and no source-code or pinned-version proof has adjudicated it.
