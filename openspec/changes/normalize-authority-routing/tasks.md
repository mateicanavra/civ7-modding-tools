## 1. Authority Inventory

- [ ] 1.1 Search project docs for root-level architecture-normalization
  decision artifacts and classify each as active packet or source material.
- [ ] 1.2 Verify `architecture-normalization-sources/README.md` labels source
  files as provenance, not current authority.
- [ ] 1.3 Inspect root and relevant subtree `AGENTS.md` routers for stale
  normalization entrypoints.
- [ ] 1.4 Audit canonical docs, OpenSpec specs, standard recipe docs, old
  stage-name references, and source-doc links with patch/no-patch disposition.

## 2. Routing Updates

- [ ] 2.1 Patch only routing or source-material labels needed to point future
  work to the packet and OpenSpec change train.
- [ ] 2.2 Record any stale canonical docs discovered as downstream work owned
  by later topic slices.

## 3. Verification

- [ ] 3.1 Run the authority searches named in the proposal.
- [ ] 3.2 Run `bun run openspec -- validate normalize-authority-routing --strict`.
- [ ] 3.3 Run `bun run openspec:validate`.
- [ ] 3.4 Run `git diff --check`.
