# Rule Remediation: Public Domain Test Imports Grit Falsifier

Status: closed on `codex/habitat-public-domain-test-imports-falsifier`.

## Scope

This slice investigated whether `require_public_domain_surfaces_in_tests` could
be converted from a Habitat script into a packet-local Grit import rule.

## Finding

The predicate is Grit-shaped: it checks static import/export module specifiers
in test files and forbids deep `@mapgen/domain/<domain>/...` imports except for
the domain root, `/ops`, `/ops/index.js`, and `/config.js`.

The current Habitat/Grit execution plane cannot prove that predicate because
repo `.gritignore` excludes `**/test/` and `**/*.test.ts`. A temporary forbidden
deep import in `mods/mod-swooper-maps/test/ecology/classify-biomes.test.ts` was
ignored by Grit. The existing Habitat script still scans the intended test-file
corpus and remains the honest current runner.

## Disposition

| Rule id | Action | Reason |
| --- | --- | --- |
| `require_public_domain_surfaces_in_tests` | retained as packet-needed split/blocker | Converting to Grit as-is would create a false green because Grit ignores the target test files. |

## Boundary

- Do not move this predicate into package-owned behavior tests.
- Do not mark the row `no action` through Grit until Habitat has an explicit
  test-file scan capability or the rule is split into a different authority
  shape.
- Nx project boundaries remain project-plane authority and do not express this
  intra-project alias subpath rule.

## Proof

- Current script runner was restored.
- `bun habitat check --rule require_public_domain_surfaces_in_tests --json`
  passed with the restored runner.
- The failed Grit probe showed why the conversion is not implementation-ready:
  the target `.test.ts` file was ignored by Grit.
