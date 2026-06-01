## 1. Direct-Control Boundary

- [x] 1.1 Add setup-row visibility result/input types.
- [x] 1.2 Implement `ensureCiv7SetupMapRowVisible` with read-only fast path
  and approved shell/App UI reload path.
- [x] 1.3 Reuse package-owned App UI command constants instead of caller raw
  command strings.
- [x] 1.4 Guard App UI snapshots when `Autoplay` is unavailable in shell.

## 2. Studio Integration

- [x] 2.1 Route disposable Run in Game row proof through direct-control row
  visibility refresh.
- [x] 2.2 Keep durable rows read-only unless the row is missing.
- [x] 2.3 Return structured reload-required errors if shell reload cannot make
  the row visible.

## 3. Verification

- [x] 3.1 Add direct-control mock socket coverage for hidden disposable row
  refresh.
- [x] 3.2 Run `bun run --cwd packages/civ7-direct-control test`.
- [x] 3.3 Run `bun run verify:studio-run-in-game`.
- [x] 3.4 Run `bun run openspec:validate`.
- [x] 3.5 Run live Studio disposable Run in Game proof and record the request id.
