## 1. Source Graph Repair

- [x] 1.1 Remove game-UI-reachable direct-control root value imports from
  control-oRPC source while preserving bounded error detail and constants.
- [x] 1.2 Rebuild the intelligence bridge package through Nx so dependency
  builds and generated bundle output are produced by scripts.

## 2. Bundle And Test Proof

- [x] 2.1 Scan the regenerated UI bundle for Node builtins, direct-control
  runtime code strings, and RPC transport symbols.
- [x] 2.2 Run the intelligence-bridge package tests that assert the generated
  bundle stays Node/direct-control-runtime-free.
- [x] 2.3 Run control-oRPC check/tests needed to prove the source graph repair
  did not weaken bounded error projection or procedure typing.

## 3. Closure

- [x] 3.1 Update the phase record with exact commands and results.
- [x] 3.2 Validate this OpenSpec change strictly and run `git diff --check`.
