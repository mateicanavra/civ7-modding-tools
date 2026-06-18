# G-HOST After-Repair TypeScript / State-Space / Validation Rereview

## Verdict

Accepted for design/specification.

No unresolved P1/P2 findings remain in this lane on the repaired disk state.
G-HOST now defines a bounded Host Policy Boundary with closed declaration states,
named consumer projections, parser-owned path concepts, explicit unsupported
declaration/refusal outcomes, D0/D1 source blockers, and falsifying validation
gates. Source implementation remains blocked; this review does not accept any
runtime source change.

## Scope Reviewed

- Source packet: `docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`
- Current packet: `openspec/changes/deep-habitat-host-policy-boundary-gate/**`
- Routing/status records: `docs/projects/habitat-harness/openspec-remediation/context.md` and `packet-index.md`
- D0 compatibility authority packet for blocker sufficiency.
- Current disk only in worktree `codex/host-policy-boundary-gate-packet`.

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

None.

## Review Notes

- `$HABITAT_TOOL/src/lib/host-policy.ts` is now a concrete later owner path, not an implementation-time location choice. `context.md` resolves `$HABITAT_TOOL` to `$REPO_ROOT/tools/habitat-harness`, and `design.md`, `spec.md`, and `tasks.md` all require the first source implementation to use `$HABITAT_TOOL/src/lib/host-policy.ts` as the internal TypeScript owner module. The file does not exist on disk yet, which is consistent with the packet's source-blocked status.
- No equivalent/source-location decision remains for implementation. The packet says the first source implementation SHALL keep declarations in that internal TypeScript module, forbids user-authored config, repo-authored declaration data files, documented declaration locations, and public exports for the first implementation shape, and requires later accepted packets plus D0/D1 handling before any public upgrade.
- State-space collapse is sufficient for design/specification. `HostPolicyDeclaration` is a closed family; declaration reads resolve to declared, missing, unavailable, malformed, conflicting, or not-applicable; and unsupported host shapes are modeled as declaration/refusal outcomes rather than a declaration-source read state.
- Consumer projections are separated: D10 consumes `HostSurfaceProjection`, D9 consumes `HostApplyGateProjection`, D13 consumes `HostProjectSupportProjection`, and D14 consumes `HostAuthoringBoundaryProjection`. The packet explicitly blocks consumers from recreating host policy from path conventions, package names, schema enums, literals, or thrown strings.
- The parser-owned path model is explicit enough for implementation gating. The design requires distinct concepts for repo-relative, host-declared, generated-surface, protected-surface, apply-root, and docs apply paths, and rejects unbounded optional DTOs, free-form notes, and untyped JSON records for host facts.
- D0 blockers are sufficient for this packet. G-HOST does not claim current D0 rows exist; it blocks source work until concrete D0 rows exist for every touched public/durable surface, including the internal host-policy source location through a preserve/document-only row. D0's accepted packet defines the compatibility matrix and closed handling set that those rows must use.
- Validation gates are falsifying, not demonstrative. The implementation gates require bad-case coverage for missing, unavailable, malformed, conflicting, not-applicable, and unsupported declaration/refusal outcomes, plus D9/D10/D13/D14 consumer tests proving missing or invalid projections block local host-policy computation.

## Validation Run

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`: passed.
- `bun run openspec:validate`: passed, 249 items validated.
- `git diff --check`: passed.

## Residual Risk

The remaining risk is implementation-time only: source work must realize the
design as closed/discriminated TypeScript states and parser-owned path types
rather than flat optional projection DTOs. The packet already captures that as a
source blocker through the later write set, D0/D1 requirements, and validation
tasks, so it is not an unresolved design/specification P1/P2.
