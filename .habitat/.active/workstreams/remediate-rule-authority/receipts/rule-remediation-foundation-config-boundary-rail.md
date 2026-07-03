# Foundation Config Boundary Rail

Status: closed on `codex/habitat-foundation-config-boundary-rail`

## Purpose

Close the implementation-ready boundary-inversion slice for foundation
contract config-bag guards without moving static source authority into package
tests or Habitat scripts.

## Selected Rows

| Rule id | Outcome |
| --- | --- |
| `prohibit_foundation_op_contract_config_bags` | Preserved as foundation domain rule; widened from retired root config-bag token pressure to a contract-source Grit rail against root/foundation config facade imports and `FoundationConfigSchema`. |
| `prohibit_foundation_step_contract_config_bags` | Preserved as Swooper Maps standard recipe foundation-stage rule; widened to the same contract-source Grit rail for foundation recipe step contracts. |

## Tooling Correction

Habitat source Grit execution now materializes selected packet-local
`runner.files.pattern` bodies into an isolated native Grit workspace and runs
the pinned workspace Grit binary from that workspace. This keeps Grit as the
source-pattern authority instead of converting static import/source assertions
to MJS scripts.

The Grit provider executes the repo-local pinned binary directly so request
`cwd` is honored. Native diagnostic metadata still normalizes the executable
identity to `grit`.

## Semantic Decision

Foundation implementation files may still use the live foundation config
facade. Foundation operation contracts and foundation recipe step contracts
must instead own local typed contract schemas and must not import the root
config bag or the foundation config facade into contract surfaces.

The matching static package-test assertions in
`mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` were removed.
They duplicated the Habitat Grit authority and kept package tests acting as a
junk drawer for source-shape enforcement.

## Verification

- `bun run --cwd tools/habitat test test/lib/grit-provider.test.ts`
- injected bad import probe failed for `prohibit_foundation_op_contract_config_bags`
- injected bad import probe failed for `prohibit_foundation_step_contract_config_bags`
- `bun habitat check --rule prohibit_foundation_op_contract_config_bags --json`
- `bun habitat check --rule prohibit_foundation_step_contract_config_bags --json`
- `bun habitat check --rule require_public_domain_surfaces_in_recipes_and_maps --json`
- `bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts`

## Record

The canonical operational record is
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`; this receipt
does not duplicate the action matrix.
