## 1. Specification

- [x] 1.1 Create the OpenSpec proposal, design, and workstream records.
- [x] 1.2 Run pre-code review against authority, domain boundaries, and API
  shape.

## 2. MapGen Authoring DAG Model

- [x] 2.1 Add JSON-safe recipe DAG DTO types in MapGen authoring core.
- [x] 2.2 Add a pure extractor over authored recipe stages and step contracts.
- [x] 2.3 Cover cross-stage, same-stage, missing-provider, and duplicate-provider
  artifact cases with focused tests.
- [x] 2.4 Export the DAG extractor through the existing authoring public surface
  without widening recipe deep-import paths.

## 3. Studio oRPC + Effect Service

- [x] 3.1 Add Studio-local recipe DAG contract, errors, implementer, service, and
  router using `effect-orpc` patterns.
- [x] 3.2 Add source-backed recipe loading for `mod-swooper-maps/standard`.
- [x] 3.3 Mount the Studio recipe DAG RPC handler without replacing existing
  Vite server endpoints.
- [x] 3.4 Add no-network oRPC tests for success, unknown recipe, and public error
  shaping.

## 4. Studio Full-Screen DAG View

- [x] 4.1 Add client call/state for `recipeDag.get` keyed by selected recipe id.
- [x] 4.2 Add a secondary full-screen tab/view for the pipeline DAG.
- [x] 4.3 Render deterministic phase clusters, stage nodes, artifact edges, and
  expanded step lists from the prepared DTO.
- [x] 4.4 Add accessible loading, diagnostic, and error states.
- [x] 4.5 Add focused component and browser verification for recipe loading and
  stage expansion.
- [x] 4.6 Add compact transparent Studio chrome for the DAG view: toolbar-height
  top shell, right-side view/toolbox stack, and centered DAG stats under the
  world controls.
- [x] 4.7 Replace literal recipe-order spline rendering with a pure
  dependency-ranked layout module, phase lanes, stable ports, and routed edge
  paths while preserving native trackpad scrolling.

## 5. Verification And Realignment

- [x] 5.1 Run package checks/tests for MapGen core and Studio.
- [x] 5.2 Run Studio build.
- [x] 5.3 Run OpenSpec validation for this change and all changes.
- [x] 5.4 Run `git diff --check`.
- [x] 5.5 Update adjacent docs if implementation changes public authoring or
  Studio DAG contracts beyond this OpenSpec design.
- [x] 5.6 Complete review disposition, downstream realignment, closure checklist,
  and Graphite commit.
- [x] 5.7 Verify the follow-on DAG layout/chrome slice with focused tests,
  Studio check/build, OpenSpec validation, browser inspection, diff check, and
  clean Graphite commit.
