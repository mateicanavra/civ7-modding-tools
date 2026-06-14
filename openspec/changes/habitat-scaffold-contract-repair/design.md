# Design - Scaffold And Baseline Contract Repair

## Frame

### Objective

Make Habitat baseline state explicit, typed, and proof-bearing so scaffolded
rules, current checks, Grit proof repair, and future generated patterns all use
the same baseline contract.

### Product Movement

This moves Habitat toward the repo-local executable structural operating system
by replacing hidden baseline convention with inspectable state. Future agents
should be able to tell whether a rule is locked, tracking known debt, missing a
required baseline contract, or consuming an external exception source without
reading old phase prose or parser comments.

### Selection

This frame selects:

- baseline file existence and validation;
- missing-file semantics;
- shrink-only integrity;
- baseline expansion authoring;
- rule-introduction state;
- adapter-boundary debt reconciliation;
- downstream consumers that need baseline state as proof input.

### Foreground

- Explicit baseline state over implicit file absence.
- Baseline owner boundary over scattered exception handling.
- Fakeable contract tests over Git/filesystem-only proof.
- Current command evidence over H2 closure prose.

### Exterior

- Grit parser/projection/apply implementation.
- oclif command shell repair.
- pattern authority/proving metadata beyond baseline file requirements.
- hook side-effect policy.
- Nx/Biome ownership changes.
- product/runtime Civ7 behavior.

### Hard Core

1. Every registered rule has an explicit baseline contract state.
2. Missing, malformed, orphaned, or stale baseline state is a contract failure,
   not green proof.
3. Baseline growth for existing rules is rejected before write and during
   integrity checks.
4. Rule introduction may add an empty or seeded baseline only when the rule is
   new at the comparison base and an accepted rule-introduction baseline
   manifest exists.
5. Baseline policy and mutation stay outside the Grit adapter.
6. Effect is a live implementation-substrate option for this repair when it
   removes recurring manual error, dependency, resource, or command-provenance
   failure classes.

### Structural Alternative Considered

Alternative: keep missing file as empty locked baseline and document that
behavior in README plus tests.

Rejected because it preserves the system dynamic that caused this repair:
absence continues to mean policy. That makes the proof surface depend on
convention rather than auditable state, and it lets future rule additions skip
baseline review by omission. The chosen design promotes baseline state into an
explicit contract and treats absence as a state that must be repaired or
recorded before closure.

### Falsifier

This design fails if implementation can still report a registered rule as
passing when its baseline file is missing without an explicit accepted baseline
state, or if baseline debt can be marked as baselined by a parser path outside
the Habitat baseline contract.

## Current Diagnosis

The current baseline system has four separable behaviors:

| Surface | Current evidence | Design consequence |
| --- | --- | --- |
| Missing baseline | `loadBaseline()` returns an empty set when the file does not exist. | Missing file currently means locked rule by convention, not by explicit record. |
| Locked reporting | `createCheckReport()` marks `locked` when baseline size is zero and `exceptionPath` is `none`. | Locked state is derived from loaded values, not from a typed contract. |
| Debt reporting | `adapter-boundary` currently shows seven baselined diagnostics while only one Habitat baseline key exists. | Some debt is still supplied by parser/legacy exception behavior instead of Habitat baseline state. |
| Shrink-only | `checkBaselineIntegrity()` compares baseline files against merge-base and rejects additions for existing rules. | The core shrink-only loop exists, but write-time refusal, malformed/orphan/missing contract proof, comparison-source failures, and Graphite stack-parent cases are incomplete. |
| Key format | `violationKey()` currently emits `path::message`. H2 prose also references richer rule/path/fingerprint keys. | v1 must lock the current executable key format or open a separate migration before changing it. |

Fresh probes on this branch:

- `bun run habitat:check -- --json --rule adapter-boundary` exits 0, reports
  `adapter-boundary` pass, locked false, seven baselined diagnostics, and
  `baseline-integrity` pass.
- `bun run habitat:check -- --json --rule adapter-boundary --base HEAD` exits
  0, reports seven diagnostics and zero unbaselined findings.
- `bun run habitat:check -- --json --rule workspace-entrypoints` exits 0,
  reports `workspace-entrypoints` pass and locked true with no explicit
  baseline file.
- `bun run --cwd tools/habitat-harness test` passes 14 tests, but the command
  tests mock the command engine and do not prove the baseline contract matrix.

## System Dynamics

Reinforcing loop:

1. A rule lacks an explicit baseline file.
2. Code treats absence as empty locked state.
3. Commands look green or locked.
4. Phase records and generated rules can cite locked state without an auditable
   baseline contract.
5. Future work adds more rules and more implicit policy.

Balancing loop introduced by this repair:

1. Every rule has a typed baseline state.
2. Contract validation runs before proof claims.
3. Missing/malformed/orphan states become explicit diagnostics.
4. Rule introduction and baseline expansion require current proof.
5. Downstream Grit and generator work consume baseline state as data.

## Baseline State Contract

Implementation must introduce a typed contract equivalent to:

```ts
type BaselineState =
  | {
      kind: "explicit-empty";
      ruleId: string;
      path: string;
      locked: true;
      keys: [];
    }
  | {
      kind: "explicit-debt";
      ruleId: string;
      path: string;
      locked: false;
      keys: string[];
    }
  | {
      kind: "external-exception-source";
      ruleId: string;
      sourcePath: string;
      owner: string;
      migrationOwner: string;
      projectedKeys: string[];
    }
  | {
      kind: "contract-failure";
      ruleId?: string;
      path?: string;
      reason:
        | "missing-baseline"
        | "malformed-baseline"
        | "unsorted-baseline"
        | "duplicate-baseline-key"
        | "orphan-baseline"
        | "unmodeled-external-exception"
        | "conflicting-baseline-state"
        | "baseline-growth-existing-rule"
        | "comparison-base-unavailable"
        | "base-rule-registry-missing"
        | "base-rule-registry-malformed"
        | "base-baseline-unreadable";
      message: string;
    };
```

The exact TypeScript names may change, but the implementation must preserve
the state distinctions. A `Set<string>` alone is no longer a sufficient
baseline boundary.

### Explicit Baseline Files

For each registered rule that does not use a modeled external exception source:

- an empty explicit baseline file means the rule is locked;
- a non-empty explicit baseline file means existing debt is tracked;
- entries must be strings, sorted, unique, and stable under `violationKey`;
- a baseline file without a registered rule is a contract failure;
- a registered rule without a required explicit baseline file is a contract
  failure.

Committed baseline files under `tools/habitat-harness/baselines/<rule-id>.json`
are the v1 storage model. A registry-only representation is rejected for this
repair because Grit proof, generator output, and future agents need committed
file paths they can inspect without reimplementing baseline policy.

Closure requires committed empty baseline files for registered rules with no
current debt and no modeled external exception source. Debt baselines remain
committed files with sorted key arrays.

### Baseline Key Format

The v1 key format is current executable behavior: `path::message`.
`ruleId + path + fingerprint` language in older H2 records is historical source
material until a separate accepted key migration changes `violationKey()`,
baseline files, tests, and downstream proof records together.

### External Exception Sources

External exception sources are allowed only when the source remains the owning
mechanism for a rule's debt and the repair records:

- source path;
- owner;
- projected baseline keys;
- current command proof;
- migration owner or durable reason why the source remains outside Habitat
  baselines.

The current required inventory includes:

- `adapter-boundary`:
  `scripts/lint/lint-adapter-boundary.sh#ALLOWLIST (transitional; migrates to baselines/ in H5)`.
- `doc-ambiguity`: `docs/.doc-ambiguity-lint-baseline.json`.

The repair must inventory every current non-`none` `exceptionPath`, then either
move the debt into committed Habitat baseline files or model the source with
the fields above. Parser code may not silently mark debt as baselined without a
baseline state. If a parser projects external exception entries, projected keys
must exactly match diagnostics marked `baselined: true`; any mismatch is a
contract failure.

### Rule-Introduction Baseline Manifest

Rule-introduction baseline writes require an accepted manifest. The manifest is
a design-time and implementation-time contract, not generator authority
metadata. It records:

- OpenSpec change id;
- rule id;
- owner project and owner tool;
- lane and hook-scope decision;
- normative source;
- proving source;
- initial baseline path;
- initial baseline keys;
- comparison base;
- downstream metadata owner.

Missing, malformed, placeholder, or contradicted manifest data blocks baseline
writes. The baseline layer verifies the manifest is present and internally
coherent; it does not decide the rule's architecture authority.

### Baseline Mutation

`--expand-baseline` must become write-guarded by the same contract:

- selector validation must happen before baseline mutation;
- requested rules must be real and non-empty;
- existing-rule baseline growth must be refused before writing;
- rule-introduction writes must record rule id, comparison base, current keys,
  sorted output, and non-claims;
- malformed existing baseline files block mutation;
- no baseline file may be created for an unregistered rule.

This packet depends on command selector truth from
`habitat-oclif-entrypoint-repair`. Selector-sensitive mutation and write-guard
implementation must not proceed until invalid `--rule`, `--tool`, `--owner`,
and empty intersections fail before any write through an accepted selector
boundary. If command selector repair has not landed, this packet may implement
read-only baseline contract validation but must keep baseline mutation
write paths closed.

### Baseline Integrity

`baseline-integrity` must validate both shrink-only growth and contract shape:

- parse current and base `rules.json` structurally instead of relying on string
  inclusion;
- detect added keys for existing rules;
- fail when the comparison base is unavailable;
- fail when base `rules.json` is missing or malformed;
- fail when a base baseline file is unreadable;
- compare against the trusted Graphite stack parent or an explicit trusted
  comparison base when trunk merge-base would make a downstack rule appear new;
- detect orphan baseline files;
- detect missing explicit baseline state for registered rules;
- detect malformed, duplicate, and unsorted baseline arrays;
- report failures through schemaVersion 1 CheckReport data;
- keep proof class separate from Grit current-tree proof.

## Effect Adoption Gate

This packet does not decide against Effect. Implementation must record an
adoption-gate decision before writing the baseline contract code. The decision
compares:

- a plain TypeScript state module with fakeable file, Git, rule-registry, and
  command inputs;
- an Effect service/layer design for `BaselineStore`, `RuleRegistry`,
  `ComparisonBase`, `CommandRunner`, `Clock`, and report assembly.

Effect should be adopted behind the Habitat baseline boundary when it materially
reduces recurring manual failure classes already observed in this recovery:
string/result error conventions, invisible dependency seams, command
provenance loss, comparison-base ambiguity, resource cleanup, or broad module
mocks. Relevant primary and local sources are:

- official Effect services documentation:
  `https://effect.website/docs/requirements-management/services/`;
- official Effect layer/resource/schema documentation from
  `docs/projects/habitat-harness/research/official-docs-effect.md`;
- local fit evidence in
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`;
- accepted `habitat-effect-grit-adapter` BaselineAccess boundary.

The accepted implementation may remain plain TypeScript only when the gate
shows that typed contract states, injected dependencies, command provenance,
and test seams are fully expressed without recreating Effect primitives by
hand. Do not preserve the current imperative structure if it is the source of
the missing-file, silent-green, selector, comparison-base, or test-depth
failures this packet is repairing.

## Write Set

Expected implementation write set:

- `tools/habitat-harness/src/lib/baseline.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/rules/rules.json` only for accepted baseline
  contract metadata
- `tools/habitat-harness/baselines/**`
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/workstream-record.md` only for stale
  baseline/scaffold closure claims
- downstream OpenSpec records named in the realignment ledger

Protected paths:

- `.grit/patterns/**`
- Grit adapter implementation modules from `habitat-effect-grit-adapter`
- hook implementation files
- Nx taxonomy and boundary config
- Biome config
- generated outputs
- product/runtime code

## Test And Proof Design

### Unit Matrix

- explicit empty baseline locks a rule and an unbaselined error fails;
- explicit non-empty baseline marks matching finding baselined and lets
  unmatched errors fail;
- missing baseline for a registered rule emits a contract failure;
- malformed JSON emits a contract failure;
- non-array JSON emits a contract failure;
- duplicate keys emit a contract failure;
- unsorted keys emit a contract failure;
- orphan baseline file emits a contract failure;
- external exception source requires modeled projected keys and exact equality
  with diagnostics marked baselined by parser or native rule code;
- parser-owned `baselined: true` without accepted baseline state emits a
  contract failure;
- existing-rule baseline growth fails;
- new-rule baseline creation passes only when rule-introduction baseline
  manifest proof is present;
- comparison base unavailable emits a contract failure;
- base rule registry missing or malformed emits a contract failure;
- base baseline unreadable emits a contract failure;
- Graphite child-branch growth for a downstack rule is detected against the
  trusted stack parent or explicit comparison base.

### Command Proofs

Record exact command proof for:

- `bun run habitat:check -- --json --rule workspace-entrypoints`;
- `bun run habitat:check -- --json --rule adapter-boundary`;
- a malformed baseline probe under an isolated test fixture or reversible probe;
- an orphan baseline probe under an isolated test fixture or reversible probe;
- a missing explicit baseline probe under an isolated test fixture or reversible
  probe;
- invalid `--rule`, `--tool`, `--owner`, and empty-selector
  `--expand-baseline` no-write probes;
- `--expand-baseline` refusal for existing-rule growth;
- rule-introduction manifest accepted/refused probes;
- comparison-source failure probes for missing merge-base, missing/malformed
  base registry, unreadable base baseline, and Graphite stack ambiguity;
- clean-tree full Habitat check after all explicit states are in place.

Each command proof must record branch/commit or dirty state, argv, cwd, exit
code, output class, rule ids, diagnostic class, and non-claims.

### Downstream Proof Boundaries

- OpenSpec validation proves packet shape only.
- Baseline unit tests prove state-model behavior under test registry inputs.
- Command probes prove current harness command behavior for selected rules.
- Grit native samples do not prove baseline semantics.
- H2 parity claims must split detection parity from ratchet exit semantics:
  raw wrapped checks may remain red while Habitat returns green for accepted
  baselined debt.
- Grit current-tree proof must cite this contract after implementation.
- Generator proof must cite this contract and its own metadata repair.
- `--staged` proof remains file-layer-only unless a future accepted packet
  expands staged behavior per owner tool.

## Review Lanes

- Product/outcome: does the packet move Habitat toward executable structural
  truth rather than records-only cleanup?
- Evidence/system: are proof classes separated and are missing/malformed states
  impossible to hide?
- Baseline/scaffold: is the state machine implementable against current code
  without duplicate owners?
- Generator/Grit consumer: does the packet unblock later generator and Grit
  proof work without pulling their authority decisions into this repair?
