# Design - Pattern Generator Metadata Repair

## Frame

### Objective

Make the Habitat pattern generator produce proof-bearing Grit rule candidates
and registered rules, so generation becomes an authority gate rather than a
shortcut around the Grit corpus, baseline, and hook-scope contracts.

### Product Movement

This moves Habitat toward the repo-local executable structural operating system
by making generated structural rules carry the same authority and proof records
future agents are expected to read before authoring. A generated rule should be
more trustworthy than hand-written pattern drift, not a way to harden an
unproven pattern faster.

### Selection

This frame selects:

- pattern generator schema and behavior;
- generated Grit rule metadata;
- `rules.json` registration readiness;
- Pattern Authority Manifest shape;
- baseline manifest and hook-scope dependencies;
- stale README/AGENTS guidance around generated Grit rules.

### Foreground

- Authority/proof metadata before enforcement.
- Candidate generation separate from registered rule hardening.
- Grit official metadata for Grit concerns, Habitat manifests for Habitat
  authority.
- Baseline and hook scope as dependent contracts, not generator defaults.

### Exterior

- Implementing new Grit rules or codemods.
- Proving all 22 current Grit rules.
- Rebuilding the Grit adapter.
- Baseline engine repair.
- Classify target-existence repair.
- Product/runtime Civ7 behavior.

### Hard Core

1. A generated Grit-backed rule cannot become enforced from placeholder
   authority, placeholder proof, or inferred scan roots.
2. Pattern creation and rule registration are separate states with separate
   proofs.
3. Habitat authority metadata is validated by Habitat-owned structured data,
   not by Grit prose conventions alone.
4. Hook scope is an accepted proof decision, not a generator default.
5. Baseline files and baseline mutation remain owned by the scaffold/baseline
   contract.

### Structural Alternative Considered

Alternative: keep the existing single generator and simply require callers to
pass better `--scope`, `--forbids`, `--why`, and `--message` strings.

Rejected because the current failure is structural. Better strings still leave
authority source, proving source, scan roots, false-positive model,
current-tree scan, baseline policy, and hook-scope decision outside the
validated state machine. The chosen design introduces explicit candidate and
registered states plus a manifest that later checks can validate.

### Falsifier

This design fails if implementation can still run the pattern generator with
only a `ruleId` and produce an enforced `rules.json` entry, committed baseline,
or pre-commit-scoped rule.

## Current Diagnosis

| Surface | Current evidence | Design consequence |
| --- | --- | --- |
| Schema | `schema.json` requires only `ruleId`; all human authority fields have defaults. | Required data is not aligned with product proof. |
| Rule registration | `generator.cjs` always writes `rules.json` for a new rule. | Candidate creation and enforcement are coupled. |
| Lane and hook | `ruleEntry()` always emits `lane: "enforced"` and `hookScope: "pre-commit"`. | The generator hardens rules before scan, baseline, false-positive, and hook evidence. |
| Baseline | `generator.cjs` writes an empty baseline file immediately. | Baseline state can be created before the accepted rule-introduction manifest exists. |
| Pattern body | generated pattern matches a synthetic identifier call and carries scaffold rationale. | Native fixture presence does not prove architecture authority or current-tree scan behavior. |
| Rule metadata | `HarnessRule` lacks authority/proving/scan-root/fixture/false-positive/baseline-policy fields. | Downstream agents cannot tell whether a rule is accepted or merely generated. |
| README | README describes the generator as the path for new Grit-backed rules. | Agent guidance can be read as approving hardening by generator invocation. |

Fresh dry-run evidence:

```text
bun run nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run
```

reports creation of `.grit/patterns/habitat/checks/dra_metadata_probe.md`,
creation of `tools/habitat-harness/baselines/grit-dra-metadata-probe.json`,
and an update to `tools/habitat-harness/src/rules/rules.json`. The command
made no file changes because Nx dry-run was active, but it proves the current
generator couples sparse candidate input to all three registered artifact
classes this repair must separate.

## System Dynamics

Reinforcing loop:

1. Agent sees a desired rule.
2. Generator creates a pattern, baseline, enforced rule, and hook scope from
   sparse input.
3. The rule appears as Habitat-owned structural truth.
4. Future agents cite the rule pack and README as authority.
5. Placeholder or under-proven rules become harder to challenge.

Balancing loop introduced by this repair:

1. Generator first creates a candidate or validates a registration request.
2. Manifest records authority, proof plan, scan roots, fixture strategy,
   false-positive model, baseline policy, and hook-scope decision.
3. Registration refuses missing or placeholder proof data.
4. Enforced and pre-commit states require accepted current-tree and baseline
   contracts.
5. Future agents consume the manifest before trusting the generated rule.

## Implementation Sequencing Boundary

This packet is implementation-ready only as a contract once reviewed. It must
not be selected as the next registered-rule implementation stream until these
predecessor contracts are executable:

- command selector truth from `habitat-oclif-entrypoint-repair`;
- rule-introduction and committed-baseline behavior from
  `habitat-scaffold-contract-repair`;
- Grit current-tree, fixture, injected-violation, and apply-proof semantics
  from `habitat-grit-proof-repair`;
- classify target-existence proof from `habitat-classify-generator-repair`
  where README or agent guidance crosses from pattern generation into target
  guidance.

Candidate generation may be implemented before those predecessors only if it
creates no registered rule, no baseline, no hook scope, and no active Habitat
check. Any registered advisory or registered enforced write path remains
blocked until its upstream proof contracts are real, callable, and tested.

## Pattern Authority Manifest

Implementation must introduce a structured manifest equivalent to:

```ts
type PatternAuthorityManifest = {
  schemaVersion: 1;
  ruleId: string;
  patternName: string;
  lifecycle: "candidate" | "registered-advisory" | "registered-enforced";
  openspecChangeId: string;
  ownerProject: string;
  ownerTool: "grit-check" | "grit-apply";
  normativeSources: Array<{
    kind: "frame" | "taxonomy" | "canonical-doc" | "accepted-spec" | "adr" | "agent-router";
    pathOrUrl: string;
    claim: string;
  }>;
  provingSources: Array<{
    kind: "native-grit-sample" | "current-tree-scan" | "injected-violation" | "retired-mechanism" | "test" | "manual-review";
    pathOrCommand: string;
    claim: string;
  }>;
  language: {
    gritLanguage: string;
    parserVariant: string;
    officialDocsSource: string;
    localProofCommand: string;
  };
  scanRoots: {
    include: string[];
    exclude: string[];
    gritignorePolicy: string;
  };
  fixtureStrategy: {
    positive: string[];
    negative: string[];
    parserEdge: string[];
    falsePositive: string[];
  };
  falsePositiveModel: {
    risk: string[];
    controls: string[];
    suppressionPolicy: string;
  };
  currentTreeScan: {
    command: string;
    resultClass: "zero-findings" | "accepted-baseline" | "findings-block-registration";
    evidencePath: string;
  };
  baselineContract: {
    baselinePath: string;
    ruleIntroductionManifest: string;
    baselineAction: "committed-empty" | "committed-debt" | "blocked";
  };
  hookScope: {
    decision: "none" | "pre-commit";
    rationale: string;
    costAndScopeEvidence: string;
  };
  applySafety:
    | { kind: "not-apply"; rationale: string }
    | {
        kind: "apply";
        dryRunCommand: string;
        noWriteProof: string;
        appliedDiffProof: string;
        rollbackProof: string;
        typeAndTestProof: string;
      };
};
```

The exact TypeScript names may change, but implementation must preserve the
state distinctions and refusal behavior.

### Manifest Location

The v1 design should store manifests as structured source artifacts adjacent to
the rule pack, for example:

```text
tools/habitat-harness/src/rules/pattern-authority/<rule-id>.json
```

`rules.json` should reference the manifest for generated Grit rules rather than
copying the full authority record into the rule entry. This keeps the runtime
rule pack readable while making the authority record inspectable and
schema-validatable.

Grit markdown frontmatter should carry Grit-native metadata such as `level` and
`tags`. It must not be the sole Habitat authority source because official Grit
metadata does not model Habitat's owner layer, baseline policy, current-tree
proof, or hook-scope decision.

Generator option schema, Grit-native metadata, and Habitat authority metadata
must stay separate:

- Nx generator schema validates command options and CLI/Nx Console prompting.
- Grit frontmatter configures Grit diagnostics and grouping.
- Habitat authority manifests decide whether the repo may treat the generated
  pattern as an accepted structural rule.

Using any one of those layers as a substitute for the others is a design
failure.

## Generator States

Implementation must split the generator into explicit output states:

### Candidate State

Candidate generation may create a pattern draft and manifest draft in a
non-enforcing location. It must not:

- add a `rules.json` entry;
- create a Habitat baseline file;
- add hook scope;
- produce an enforced `level: error` pattern under the active Habitat check
  directory;
- mark any proof as accepted.

### Registered Advisory State

Registered advisory output may enter the rule pack only when the manifest has
accepted authority and proof fields, scan roots, fixture strategy, and
false-positive model. Advisory registration still consumes the baseline
contract for rule introduction because it appears in Habitat reports.

### Registered Enforced State

Registered enforced output requires:

- accepted Pattern Authority Manifest;
- accepted scaffold/baseline rule-introduction manifest;
- native Grit fixture plan and proof command;
- current-tree scan result and baseline action;
- false-positive controls;
- explicit hook-scope decision;
- downstream realignment entries for README, AGENTS, corpus ledger, and any
  pattern-specific OpenSpec workstream.

`hookScope: "pre-commit"` requires `registered-enforced`. A registered rule can
remain outside hooks when full-repo proof is accepted but staged pre-commit
scope, cost, parser behavior, or side-effect risk is not accepted.

## Refusal Conditions

Generator registration must refuse before writing any pattern, manifest,
baseline, or `rules.json` change when:

- required manifest fields are absent;
- any authority/proof field still contains scaffold/default language;
- `ruleId` or `patternName` collides with existing files or rules;
- scan roots are broad prose instead of concrete paths and exclusions;
- language/parser support is not tied to official Grit docs plus local proof;
- current-tree scan status is missing or blocks registration;
- baseline manifest status is missing or blocks registration;
- `hookScope: "pre-commit"` is requested without enforced registration proof;
- apply mode is requested without dry-run no-write, applied-diff, rollback, and
  type/test proof plans.

No-write proof is part of the implementation acceptance: refused registration
must not create, rewrite, or delete pattern files, manifest files, baseline
files, or `rules.json`.

## Official Documentation Constraints

Nx official docs support generators as a way to encode repository practices and
create/update files, with dry-run workflows and file-write APIs. That supports
using a Habitat Nx generator as the structured authoring path. It does not make
Nx the authority for Grit semantics, baseline policy, or hook scope.

Grit official docs support pattern frontmatter, `level`, `tags`, `.grit`
pattern files, explicit language declarations, and native pattern tests. That
supports generated Grit syntax and sample layout. It does not supply Habitat's
repo-local authority metadata, shrink-only baseline contract, current-tree
proof, or false-positive model.

Effect official docs support typed success/error/requirements, tagged errors,
service Layers, scoped acquisition/release, platform commands with argv/env/cwd
and stdout/stderr/exit-code data, and runtime execution at program edges. Local
Habitat evidence shows the current code collapses command failures, selector
failure, baseline policy, parse failure, and multi-file state into manual
control flow. That is the same structural weakness this repair is meant to
remove from generated rules.

Effect is therefore a mandatory implementation decision point for registered
promotion, not a background preference. Candidate draft generation may remain a
plain Nx generator over the Nx virtual tree because it does not need external
commands, temp resources, baseline mutation, hook scope, or current-tree proof.
Registered advisory and registered enforced promotion are different: if the
implementation performs command proof, dry-run/no-write proof, scoped file
transactions, temp workspace work, rollback/diff proof, baseline manifest
consumption, or hook-scope proof orchestration, it must first run the active
Effect adoption gate from the recovery frame and local Effect evidence packs.

If that gate proves Effect fits the slice, registered promotion must use the
accepted Effect-backed services or adapter rather than growing another manual
orchestration routine. Required service boundaries are:

- `PatternManifestStore` for manifest read/validate/write planning;
- `RulePackStore` for `rules.json` read/validate/write planning;
- `BaselineIntroductionStore` for consuming the baseline manifest contract;
- `CommandRunner` for Grit/Nx/Biome/Git proof commands with argv/env/cwd,
  stdout, stderr, exit code, duration, and failure class;
- `RepoFileSystem` for candidate artifacts, scratch paths, and no-write proof;
- `Clock` and `Reporter` for deterministic proof records.

If the gate rejects Effect for this packet, implementation must stop and record
the rejection with local proof before proceeding. The accepted non-Effect design
must still provide typed failure classes, provenance-preserving command records,
service substitution in tests, scoped cleanup for scratch resources, and
no-write proof equivalent to the Effect design. Shipping both orchestration
substrates is not accepted.

Effect does not supply Habitat authority. It may own orchestration mechanics and
provenance only. Nx still owns generator mechanics, Grit still owns pattern
syntax and native samples, Biome still owns formatting semantics, and Habitat
manifests still own authority, baseline, current-tree proof, false-positive
model, and hook-scope acceptance.

## Write Set

Expected implementation write set:

- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/schema.json`
- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/rules/pattern-authority/**`
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- downstream OpenSpec records named in the realignment ledger

Protected paths:

- existing `.grit/patterns/habitat/checks/**` rule corpus unless a generated
  fixture or candidate path is explicitly selected;
- `.grit/patterns/habitat/apply/**`;
- Grit adapter implementation modules;
- baseline engine internals;
- hook implementation files;
- Nx taxonomy and boundary config;
- Biome config;
- generated outputs;
- product/runtime source.

## Test And Proof Design

### Unit Matrix

- candidate generation writes only candidate artifacts and no enforcing state;
- registered advisory requires accepted manifest fields;
- registered enforced requires accepted manifest, baseline manifest, current
  scan, and hook-scope proof;
- missing manifest fields refuse before write;
- placeholder manifest values refuse before write;
- duplicate `ruleId` refuses before write;
- duplicate `patternName` refuses before write;
- scan roots without concrete includes/exclusions refuse before write;
- language/parser without official-doc source and local proof command refuses;
- hook pre-commit request without enforced proof refuses;
- apply request without apply-safety proof plan refuses;
- `rules.json` reference to a missing manifest fails validation;
- manifest without matching `rules.json` entry is classified as candidate or
  orphan according to lifecycle.

### Command Proofs

Implementation must record exact command proof for:

- candidate generation dry run;
- candidate generation write and resulting file list;
- refused registration with missing metadata and no file changes;
- refused registration with scaffold values and no file changes;
- accepted registered advisory generation;
- accepted registered enforced generation in an isolated scratch path;
- native `grit patterns test` for generated registered samples;
- Habitat check proof showing registered advisory/enforced behavior aligns with
  lane and baseline state;
- README/AGENTS guidance scan proving no old "generator invocation is enough"
  instruction remains.

Each command proof must record branch/commit or dirty state, argv, cwd, exit
code, output class, touched paths, and non-claims.

## Downstream Proof Boundaries

- OpenSpec validation proves packet shape only.
- Nx generator dry-run proof proves generator file effects, not Grit semantics.
- Native Grit samples prove pattern syntax and sample behavior, not current-tree
  scan, baseline policy, or hook scope.
- Baseline state proof remains owned by `habitat-scaffold-contract-repair`.
- Grit current-tree and injected-violation proof remain owned by
  `habitat-grit-proof-repair` and per-pattern workstreams.
- README/AGENTS updates prevent stale agent behavior but do not prove generator
  implementation.

## Review Lanes

- Product/outcome: does generated structure become safer and more truthful for
  agents?
- Evidence/system: are authority, proof, baseline, hook, and Grit semantics
  separated without bypasses?
- Generator/Nx: is the generator state machine implementable with Nx generator
  mechanics and no-write proof?
- Grit consumer: can per-pattern packets consume this manifest without
  duplicating metadata or weakening Grit proof?
