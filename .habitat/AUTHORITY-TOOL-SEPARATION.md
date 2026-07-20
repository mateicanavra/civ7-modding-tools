# Habitat Authority Tool Separation

Status: active reference for authority ownership and runner selection

## Purpose

This document separates the enforcement tools Habitat uses so future rule work
does not collapse back into bespoke scripts. A rule should choose the smallest
tool that owns its proof class. If a packet mixes proof classes, split the
assertions first.

## Core Split

Habitat authority lives in `.habitat`. Execution machinery lives in
`tools/habitat` or in the external tool that owns a specific proof class.
`rule.json` records runner metadata; it is not the ontology for the policy
itself.

## Tool Ownership

| Concern | Owner | Use For | Do Not Use For |
| --- | --- | --- | --- |
| Source syntax and source-pattern authority | Grit / GritQL | imports, exports, calls, identifiers, object/property shape, Markdown/source text patterns, rewrite-backed diagnostics | directory topology, generated freshness, graph traversal, package runtime behavior |
| Alternative AST/source matching | ast-grep | source structural matching if a future rule cannot be expressed cleanly in Grit and a deliberate tool decision is made | file-tree topology, task graph, formatter hygiene |
| Workspace graph and task relationships | Nx | project graph, import/project boundaries, task dependencies, target ordering, affected execution | source AST patterns, arbitrary nested file structure, package semantic validation |
| Format and hygiene | Biome / formatter layer | formatting, import organization, general lint hygiene owned by formatter/linter capabilities | Habitat policy, topology, project graph ownership |
| File-tree topology | Habitat `structure-check` runner | globbed filesystem shape, allowed/required/forbidden direct children, closed/open directory scopes, retired path absence, generated artifact presence when the claim is only presence | imports/exports, source regex, graph traversal, currentness, generated equivalence |
| Package or product semantics | package-local validators / package tests | runtime behavior, API behavior, generated artifact equivalence, derived schema correctness, live integration behavior, package-specific graph traversal | static source-pattern authority, general file-tree shape |

## Decision Rules

1. If the assertion is about code or Markdown syntax, use Grit first.
2. If the assertion is about project dependencies, build ordering, or task
   relationships, use Nx or an Nx-backed Habitat rule.
3. If the assertion is about the shape of files and directories, use
   `structure-check`.
4. If the assertion requires executing package code, deriving semantic data, or
   comparing generated output to source truth, keep it package-local.
5. If a command-check script contains more than one proof class, split it by
   assertion before changing owners.

## Graph Execution Rule

Nx owns task scheduling, dependency order, caching, and parallelism. A
registered `runner:nx` rule names one concrete leaf target; it must not point at
a generated Habitat owner, aggregate, or rule-alias target. Nx-owned Habitat
owner checks project local rule execution and graph-backed work as sibling
dependencies, then expose dependency-only public targets. They never start a
second Nx scheduler.

Habitat-executed rules remain Habitat runners. When a rule consumes generated
output, its closed `graphDependencies` list schedules only the exact producers;
the generated rule target and owner-local batch still execute and report the
rule through Habitat.

Direct `bun habitat check --rule <id>` remains a diagnostic surface and may
delegate an explicitly selected `runner:nx` rule. Formatting authority follows
the same law: Habitat registers the rule, Biome owns the check, and Nx schedules
the `habitat:check:hygiene` leaf exactly once.

## Source Pattern Execution Rule

Habitat Grit rules are packet-local source-pattern authority. A rule's
`runner.files.pattern` is the canonical pattern body and its normalized
`diagnosticAcquisition` declares either `check` or `apply-dry-run`. Acquisition
is a generic runner policy, not a rule-id, path, extension, or domain special
case. Habitat remains the sole checked-in authority tree.

For every selected rule, Habitat plans the admitted roots once. A rule is then
executed, refused, or explicitly not applicable because no requested root
belongs to it. The provider must not fall back to broader roots, silently drop
an unmatched rule, or manufacture clean from an empty merge.

Each execution materializes one Effect-scoped parent that owns the selected
`.grit/grit.yaml`, empty user configuration, and isolated cache. It runs the
installed pinned native directly, never the downloading package shim, with
downloads, telemetry, colors, and the default file-size limit disabled. The
command runs from that scoped parent against absolute admitted targets and the
scope is released on success or failure.

Habitat decodes only the pinned machine contracts. Check JSON must arrive on
stderr, and only its top-level absolute `paths` prove processed coverage.
Compact apply dry-run JSONL must arrive on stdout with a closed event union and
one successful final `AllDone`. Malformed output, valid but incomplete output,
acquisition failure, and complete observation remain distinct states; only a
complete observation may become clean or findings. Apply dry-run here is
diagnostic observation only. It grants no live-write, rollback, fix-admission,
or safe-apply authority.

Fix preview is admitted separately and atomically by
`runner.fix: { kind: "preview-only", pattern, effects }`. The registered record owns
the decision, normalized pattern asset, and closed file-effect authority.
Habitat may observe that pattern
for one or many selected rules, but it never infers admission from diagnostic
policy, remediation prose, a sibling file, or a rule id. No current fix
capability writes source files.

Do not convert source-pattern rules to Habitat scripts only because native Grit
needs execution plumbing.

Package tests are not a junk drawer for retired source tokens, stale schema
keys, or static import/source-shape assertions. Product/package tests should
prove behavior, API contracts, generated equivalence, or runtime validation.
Static source syntax belongs in Grit; project graph law belongs in Nx; retired
state that cannot recur through a live source rail should usually be deleted,
not preserved as a negative assertion.

## Structure-Check Boundary

`structure-check` is intentionally narrow. It should validate only filesystem
topology through globbed tree patterns. It must not grow source regex matching,
import/export analysis, graph traversal, freshness checks, or package semantic
logic.

Good `structure-check` claims:

- a root glob matches the expected directory class;
- direct children under a matched root satisfy required and forbidden glob
  patterns;
- a closed scope has no undeclared direct children;
- generated artifact files exist where declared, without proving freshness or
  equivalence;
- retired directories or files are absent.

Claims that belong elsewhere:

- imports, exports, calls, identifiers, source text tokens: Grit;
- task ordering, dependency graph, project boundaries: Nx;
- generated artifact freshness/equivalence: package validator or Nx target;
- derived schemas, runtime behavior, API behavior: package-local tests or
  validators.

## Anti-Riddle Rule

Do not introduce a new Habitat runner because a domain has a special noun such
as stage topology, recipe topology, or docs topology. The runner owns a proof
class, not a domain name. "Stage topology" is just file-tree topology unless it
requires package semantic derivation, in which case it is not `structure-check`.
