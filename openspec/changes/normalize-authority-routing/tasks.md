## 1. Authority Inventory

- [x] 1.1 Search project docs for root-level architecture-normalization
  decision artifacts and classify each as active packet or source material.
- [x] 1.2 Verify `architecture-normalization-sources/README.md` labels source
  files as provenance, not current authority.
- [x] 1.3 Inspect root and relevant subtree `AGENTS.md` routers for stale
  normalization entrypoints.
- [x] 1.4 Audit canonical docs, OpenSpec specs, standard recipe docs, old
  stage-name references, and source-doc links with patch/no-patch disposition.

## 2. Routing Updates

- [x] 2.1 Patch only routing or source-material labels needed to point future
  work to the packet and OpenSpec change train.
- [x] 2.2 Record any stale canonical docs discovered as downstream work owned
  by later topic slices.

## 3. Verification

- [x] 3.1 Run the authority searches named in the proposal.
- [x] 3.2 Run `bun run openspec -- validate normalize-authority-routing --strict`.
- [x] 3.3 Run `bun run openspec:validate`.
- [x] 3.4 Run `git diff --check`.
