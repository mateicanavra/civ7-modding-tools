# Habitat Proof Classes

## Evidence Labels

Use exact labels in reports, ledgers, phase records, and closure notes:

- **Spec validation**: OpenSpec packet shape, task syntax, and change-record consistency.
- **Unit behavior**: package-level tests for functions, modules, adapters, or fixtures.
- **Native tool behavior**: Grit, Biome, Nx, Git, shell, or oclif behavior outside Habitat wrappers.
- **Habitat wrapper behavior**: current-tree behavior through Habitat commands, scripts, or adapters.
- **Injected violation proof**: a known-bad case fails for the intended reason.
- **Clean sample proof**: a known-good case avoids the intended diagnostic or transformation.
- **Baseline proof**: generated or maintained baselines shrink or become explicitly owned.
- **Apply safety proof**: dry run, applied diff, rollback/cleanup, idempotence, and write-scope evidence.
- **Runtime/product proof**: an end-to-end command path protects Habitat's product outcome in this repo.
- **Record truth proof**: docs, ledgers, phase records, generated records, and downstream records match current behavior.

## Non-Claim Rules

When reporting a proof, state what it does not prove:

- OpenSpec validation does not prove command behavior.
- Native Grit fixtures do not prove Habitat wrapper scans.
- A green wrapper scan does not prove injected violation behavior.
- A clean command does not prove safe apply semantics.
- A generated manifest does not prove hand-authored source truth.
- A cached Nx result does not prove fresh command behavior.
- A hook success does not prove all enforcement surfaces.
- A local command does not prove product outcome beyond the named path and proof class.

## Closure Language

Use claim language that names the proof class:

- "Native Grit fixture proof passed for `<row>`."
- "Habitat wrapper proof passed for `<scan root>`."
- "Injected violation proof failed because `<reason>`; row remains open."
- "Record truth proof updated `<ledger>` to match current behavior."

Avoid umbrella phrases like "green", "done", or "validated" without the proof label and scope.
