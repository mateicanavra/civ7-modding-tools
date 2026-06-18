# Downstream Realignment Ledger: D3 Workspace Graph Boundary

## Status

D3 downstream handoffs are accepted for design/specification after final D3
rereview found no unresolved P1/P2 blockers. Downstream packet design may
consume these accepted D3 facts; source implementation that depends on live
graph facts waits for D3 implementation, concrete D0 rows, and D2 graph
projection implementation facts.

## Downstream Consumers

| Downstream | D3 graph facts it may rely on after D3 design acceptance | Non-claims |
| --- | --- | --- |
| D4 Orientation And Routing | `WorkspaceProject`, project root, target availability, unavailable target, aggregate/workspace target, and `GraphRefusal` states for classify/orientation. | D4 may present and route graph facts but may not infer project ownership, target existence, alias validity, or graph-read status locally. |
| D7 Structural Enforcement Pipeline | Available project targets, aggregate/workspace targets, `TargetDependencyDeclaration`, resolved `TargetDependency`, `TargetAlias`, and graph refusal states for execution planning. | D7 may not treat wrapper exit 0 as enforcement success without D3 dependency resolution and may not own dependency declaration construction. |
| D12 Verify Handoff Receipt | `WorkspaceGraphSnapshot` read status, `VerifyTargetPlan`, target availability, dependency resolution, and graph refusal states. | D12 owns receipt schema and handoff wording; D12 may record graph facts but may not construct or repair graph truth. |

## Public Compatibility Dependencies

| Public/durable surface | D3 impact | Required before implementation |
| --- | --- | --- |
| `habitat classify --json` | target facts may distinguish available, unavailable, aggregate, alias, and graph refusal states | Concrete D0 rows for additive/versioned/facade handling. |
| `habitat verify` output/target plan | verify target plan may derive from D3 graph facts | Concrete D0 rows and D12 receipt boundary before public schema changes. |
| Nx inferred targets | `habitat:rule:*`, `habitat:check`, aggregate workspace gates, dependency declaration structure, and resolved dependency relationships | Concrete D0 rows and D3 dependency-resolution validation. |
| Root scripts | scripts that invoke graph-owned targets may inherit corrected target dependencies | Concrete D0 rows for script behavior/compatibility. |
| `@internal/habitat-harness/plugin` export | plugin target inference may consume Workspace Graph contract helpers | Concrete D0 rows for package export compatibility if export shape changes. |
| Docs/examples | guidance may show graph refusal/unavailable target facts | Concrete D0 rows if public examples change. |

## D0/D2 Dependency State

- D3 design may consume accepted D0/D2 design language.
- D3 source implementation remains blocked until concrete D0 rows cover every
  touched public/durable surface.
- D3 source implementation remains blocked until D2 graph projection facts exist
  wherever D3 consumes live registry graph declarations.

## Index Alignment

- D3 is accepted for design/specification only.
- D3 status is `accepted for design/specification; final review found no unresolved P1/P2 blockers; not implementation-complete`.
- D4, D7, and D12 remain draft/blocking until their own per-domino gates close.

## Non-Claims

- This ledger does not make D3 implementation-complete.
- This ledger does not implement graph facts.
- This ledger does not accept, repair, or close D4, D7, or D12.
- This ledger does not authorize source implementation from D3 design alone.
