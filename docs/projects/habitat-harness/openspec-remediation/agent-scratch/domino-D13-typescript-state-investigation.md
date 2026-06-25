# D13 TypeScript State-Space Investigation

Reviewer: fresh D13 TypeScript/refactoring state-space reviewer.
Scope: design/specification review only. No source, OpenSpec, package, generated,
lockfile, or packet-index edits were made.

## Verdict

**Blocked.** The current D13 OpenSpec packet still permits the later
implementation agent to decide the state model while coding. The source domino
packet asks for discriminated scaffolding requests and explicit refusal states
(`docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:67`),
but the live spec collapses that into one broad requirement and two broad
scenarios (`openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:3`).

The later implementation packet must require a closed, parse-at-boundary
type-state model before writes. Without that, unsupported scaffolds can remain
runtime string refusals, candidate patterns can remain socially distinguished
from registered rules, Nx generator options can keep looking like authority,
host-specific requests can enter generic scaffolding, and Authoring Topology can
be implemented by accident.

Skills used: domain-design, information-design, solution-design,
typescript-refactoring.

## 1. Current TypeScript/code smell inventory and state-space problems

### Project generator: schema admits more states than implementation owns

- `tools/habitat/src/generators/project/schema.json:15` exposes `kind` as
  a string enum containing supported and refused values. The enum includes
  `adapter`, `control`, `engine`, `mod`, `sdk`, `tooling`, and `kind:*` aliases at
  `tools/habitat/src/generators/project/schema.json:18`.
- `tools/habitat/src/generators/project/generator.cjs:4` defines the
  actual write contracts for only `plugin`, `foundation`, and `app`; line 22
  derives `SUPPORTED_KINDS` from those contracts.
- `tools/habitat/src/generators/project/generator.cjs:51` normalizes raw
  `rawOptions.kind` with string replacement, then line 53 throws for unsupported
  kinds.

Smell: primitive obsession and missing parse boundary. The schema and raw
options allow the unsupported-kind state to reach the generator, then rely on a
runtime branch to prevent writes. That may be acceptable current behavior, but
D13 should require the target implementation to parse raw Nx input into a closed
`ProjectScaffoldDecision` before any write path is reachable.

### Project refusal exists as an error string, not a typed refusal outcome

- Unsupported kinds throw a generic `Error` at
  `tools/habitat/src/generators/project/generator.cjs:54` with rationale
  embedded in a string.
- Root and package mismatch refusals are also error strings at
  `tools/habitat/src/generators/project/generator.cjs:66` and
  `tools/habitat/src/generators/project/generator.cjs:72`.
- Tests prove no writes for several cases:
  `tools/habitat/test/generators/project-generator.test.ts:90`,
  `tools/habitat/test/generators/project-generator.test.ts:101`,
  `tools/habitat/test/generators/project-generator.test.ts:116`,
  `tools/habitat/test/generators/project-generator.test.ts:131`, and
  `tools/habitat/test/generators/project-generator.test.ts:148`.

Smell: optional/implicit refusal shape. The source packet requires blocked
action, reason, owner, next safe action, validation category, and non-claims
(`D13-scaffolding-and-refusal-contracts.md:62`), but current code and live spec
do not force a structured refusal DTO. A thrown string can omit owner, recovery,
protected set, and non-claims without the compiler noticing.

### Pattern generator has useful lifecycle language, but generator input is still raw

- `tools/habitat/src/generators/pattern/schema.json:24` exposes
  `lifecycle` as `"candidate" | "registered-advisory" | "registered-enforced"`.
- `tools/habitat/src/generators/pattern/generator.cjs:41` normalizes the
  lifecycle from a raw value and throws for unsupported strings.
- Candidate writes are under
  `tools/habitat/src/generators/pattern/generator.cjs:22`; registered
  promotion is selected by `options.lifecycle !== "candidate"` at
  `tools/habitat/src/generators/pattern/generator.cjs:7`.
- Candidate manifests correctly encode `lifecycle: "candidate"` and
  `registration.accepted: false` at
  `tools/habitat/src/generators/pattern/generator.cjs:101`.
- Pattern Authority already models candidate vs registered manifests as a
  discriminated union at
  `tools/habitat/src/rules/pattern-authority/manifest.ts:67` and
  `tools/habitat/src/rules/pattern-authority/manifest.ts:80`.

Smell: repeated branch plus underused existing model. The manifest module owns a
good closed union, but the generator boundary still branches on raw lifecycle
strings and can reach registration code from the generic pattern generator. D13
should require a narrow projection: candidate generation returns only a
candidate decision; registered promotion consumes an accepted registered manifest
decision from Pattern Authority.

### Candidate/registered collision protections are present but not elevated into D13

- Candidate generation proves it does not write active enforcement state at
  `tools/habitat/test/generators/pattern-generator.test.ts:20`.
- Registered generation refuses missing manifest before writes at
  `tools/habitat/test/generators/pattern-generator.test.ts:57` and
  `tools/habitat/test/generators/pattern-generator.test.ts:71`.
- Promotion writes active `.grit` and `rules.json` only after accepted manifest
  and baseline contract at
  `tools/habitat/test/generators/pattern-generator.test.ts:139`,
  `tools/habitat/test/generators/pattern-generator.test.ts:160`, and
  `tools/habitat/test/generators/pattern-generator.test.ts:209`.
- Candidate collision checks guard existing rule, active pattern, and baseline
  states at `tools/habitat/test/generators/pattern-generator.test.ts:239`,
  `tools/habitat/test/generators/pattern-generator.test.ts:252`, and
  `tools/habitat/test/generators/pattern-generator.test.ts:279`.

Smell: current behavior is stronger than the live D13 spec. The spec does not
require these exact states to remain unrepresentable. A later implementation
could pass the broad D13 scenario while weakening the candidate/registered
separation already present in tests.

### Nx options can be mistaken for authority

- Pattern Authority explicitly rejects Nx generator options as authority at
  `tools/habitat/src/rules/pattern-authority/manifest.ts:258`; the
  corresponding test is
  `tools/habitat/test/rules/pattern-authority-manifest.test.ts:236`.
- The live D13 OpenSpec packet does not promote this invariant into the
  scaffolding contract. `proposal.md` mentions current code names may not become
  target-domain language (`openspec/.../proposal.md:58`), but it does not say
  generator options are never authority.

Smell: authority overlap. Generator schema is command input; Pattern Authority
Manifest is registration authority. D13 must require the implementation to keep
those as separate types and forbid projection from raw Nx options to authority
without Pattern Authority validation.

### Authoring Topology is documented as a gap but not typed as a refusal

- Existing capabilities state Habitat is not a broad MapGen authoring toolkit at
  `tools/habitat/docs/CAPABILITIES.md:10` and lists recipe/domain/op/stage
  generation as assumptions Habitat cannot yet answer at
  `tools/habitat/docs/CAPABILITIES.md:25`.
- Existing gaps list the unsupported authoring structures at
  `tools/habitat/docs/GAPS.md:17` and say the current project and pattern
  generators are not MapGen authoring generators at
  `tools/habitat/docs/GAPS.md:29`.
- Domain mapping frames Future MapGen authoring as a gap, not an implemented
  Habitat context, at `tools/habitat/docs/DOMAIN-MAPPING.md:348`.

Smell: doc-level refusal instead of command-level unrepresentability. The source
packet names Authoring Topology refusal as a required state
(`D13-scaffolding-and-refusal-contracts.md:38`), but the live spec only says
unsupported scaffolds are refused. It does not enumerate Authoring Topology as a
protected refusal variant.

## 2. Target type-state model D13 should require

D13 should require a small closed model, not a broad class hierarchy.

Raw Nx input must be parsed at the boundary:

```ts
type RawGeneratorInput = unknown;

type ScaffoldingRequest =
  | ProjectScaffoldRequest
  | PatternCandidateRequest
  | PatternRegisteredPromotionRequest
  | UnsupportedScaffoldRequest;

type ProjectScaffoldRequest = {
  kind: "project";
  projectKind: "plugin" | "foundation" | "app";
  name: ProjectSlug;
  root: CanonicalProjectRoot;
  packageName: CanonicalPackageName;
};

type PatternCandidateRequest = {
  kind: "pattern-candidate";
  ruleId: RuleId;
  patternName: PatternName;
  ownerProject: NxProjectName;
  openspecChangeId: OpenSpecChangeId;
};

type PatternRegisteredPromotionRequest = {
  kind: "pattern-registered-promotion";
  lifecycle: "registered-advisory" | "registered-enforced";
  manifest: RegisteredPatternAuthorityManifest;
  hookScope: "none" | "pre-commit";
};

type UnsupportedScaffoldRequest =
  | { kind: "unsupported-project-kind"; requestedKind: string; owner: "domain-maintainer" }
  | { kind: "host-specific-request"; requestedKind: string; owner: "host-policy-boundary" }
  | { kind: "authoring-topology-request"; requestedShape: AuthoringTopologyShape; owner: "authoring-topology" }
  | { kind: "preflight-conflict"; conflict: "non-empty-root" | "package-name-collision" | "active-rule-collision" | "active-pattern-collision" | "active-baseline-collision" };
```

Write decisions must also be closed:

```ts
type ScaffoldingDecision =
  | {
      state: "write-project";
      request: ProjectScaffoldRequest;
      writeSet: ProjectWriteSet;
      protectedSet: ProjectProtectedSet;
      followupChecks: readonly ValidationGate[];
    }
  | {
      state: "write-pattern-candidate";
      request: PatternCandidateRequest;
      writeSet: CandidatePatternWriteSet;
      protectedSet: RegisteredPatternProtectedSet;
      nonClaims: readonly ["not-registered-rule", "not-active-grit-check", "not-baselined", "not-hook-scoped"];
    }
  | {
      state: "promote-registered-pattern";
      request: PatternRegisteredPromotionRequest;
      writeSet: RegisteredPatternWriteSet;
      proof: PatternAuthorityAcceptedProof;
    }
  | {
      state: "refuse";
      refusal: ScaffoldRefusal;
    };

type ScaffoldRefusal = {
  blockedAction: string;
  reason:
    | "unsupported-project-kind"
    | "host-specific-unsupported"
    | "authoring-topology-unsupported"
    | "pattern-registration-requires-manifest"
    | "pattern-authority-rejected"
    | "preflight-conflict";
  owner: "scaffolding-and-refusal" | "pattern-governance" | "host-policy-boundary" | "authoring-topology" | "domain-maintainer";
  nextSafeAction: string;
  proofClass: "no-write-preflight" | "candidate-only" | "registered-authority-required";
  nonClaims: readonly string[];
  protectedSet: readonly string[];
};
```

Required invariant: only `state: "write-project"`, `state:
"write-pattern-candidate"`, and `state: "promote-registered-pattern"` may reach
write functions. `state: "refuse"` must carry no write callback or write set.
That is the state-space collapse D13 needs: unsupported scaffolds cannot write
files because the type has no write path.

## 3. Refactor moves from the TypeScript skill that apply

- **Replace type code with discriminated union + exhaustive `never`.** Apply to
  `kind`, pattern `lifecycle`, preflight conflict kinds, and refusal reasons.
  The implementation packet should require exhaustive handling for every
  `ScaffoldingDecision.state` and every `ScaffoldRefusal.reason`.
- **Parse at the boundary.** Raw Nx JSON options remain command input only. The
  core generator should consume parsed request/decision objects; unsafety and
  raw string normalization live in one boundary function.
- **Introduce parameter object / narrow projections.** Do not pass raw generator
  options through the call graph. Project writer takes `ProjectScaffoldRequest`;
  candidate writer takes `PatternCandidateRequest`; registered promotion takes a
  `RegisteredPatternAuthorityManifest` accepted by Pattern Authority.
- **Delete before rearrangement.** Do not add alternate generators for unsupported
  kinds. Unsupported host/domain/Authoring Topology paths should collapse into
  `state: "refuse"` rather than creating placeholder files or extension hooks.
- **Reuse canonical owner modules.** Reuse
  `tools/habitat/src/rules/pattern-authority/manifest.ts` for registered
  manifest validation. Do not duplicate Pattern Authority types inside the
  generator.
- **State-space collapse, not broad rewrite.** No class hierarchy is needed.
  Closed unions and write/refusal decision functions are enough.
- **Indirection audit.** A generic "scaffold transaction" layer is not earned
  unless at least two concrete write decisions share real behavior and the swap
  test fails. Start concrete with project, candidate pattern, and registered
  promotion projections.

## 4. Concrete write set and protected set recommendations

Later implementation write set should be explicit and narrow:

- `tools/habitat/src/generators/project/generator.cjs`
- `tools/habitat/src/generators/project/schema.json`
- `tools/habitat/src/generators/pattern/generator.cjs`
- `tools/habitat/src/generators/pattern/schema.json`
- `tools/habitat/src/generators/pattern/registration.cjs`, only if
  registered promotion boundary needs a narrower input projection
- `tools/habitat/src/rules/pattern-authority/manifest.ts`, only to reuse
  or tighten accepted manifest projection, not to weaken validation
- `tools/habitat/test/generators/project-generator.test.ts`
- `tools/habitat/test/generators/pattern-generator.test.ts`
- `tools/habitat/test/rules/pattern-authority-manifest.test.ts`, only if
  manifest projection behavior changes
- `tools/habitat/docs/CAPABILITIES.md`,
  `tools/habitat/docs/GAPS.md`, and
  `tools/habitat/docs/DOMAIN-MAPPING.md`, only to align command-facing
  guidance with implementation facts

Protected set for D13 implementation:

- `packages/mapgen-core/src/authoring/**`
- `mods/mod-swooper-maps/src/**/steps/**`
- `mods/mod-swooper-maps/src/**/stages/**`
- `mods/mod-swooper-maps/src/**/domains/**`
- recipe, domain, operation, stage, step, Studio artifact, and registry files
  outside Habitat Harness
- `.habitat/patterns/active/checks/**` except paths produced by an accepted
  registered-pattern promotion decision
- `tools/habitat/src/rules/rules.json` except through the accepted
  registered-pattern promotion decision
- `tools/habitat/baselines/**` except pre-existing baseline contract
  verification; D13 should not invent or grow baselines
- `tools/habitat/src/rules/pattern-authority/candidates/**` except
  candidate-pattern writes
- `dist/**`, `mod/**`, `packages/cli/oclif.manifest.json`, lockfiles, and other
  generated artifacts
- OpenSpec packet files, packet index rows, and package metadata unless the
  accepted implementation packet explicitly names them

## 5. Validation gates that falsify the state-space risks

Required gates for later implementation:

- Unit tests for raw input parsing:
  - supported `plugin`, `foundation`, `app` parse to `state: "write-project"`;
  - `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling`, `host-specific`,
    and all Authoring Topology shapes parse to `state: "refuse"`;
  - malformed lifecycle values parse to refusal and do not reach write code.
- No-write preflight tests:
  - unsupported project kind writes no project files;
  - host-specific scaffold request writes no files;
  - Authoring Topology request writes no MapGen authoring files;
  - missing registered manifest writes no `.grit`, `rules.json`, baseline, or
    candidate artifacts.
- Candidate/registered separation tests:
  - candidate generation writes only candidate manifest and candidate pattern
    draft;
  - candidate manifest validates with `authorityAccepted: false`;
  - registered promotion refuses candidate manifests and Nx-option-shaped
    authority;
  - registered promotion writes active `.grit` and `rules.json` only after an
    accepted registered manifest and baseline contract.
- Protected-set tests:
  - supported project writes exactly `package.json`, `tsconfig.json`,
    `src/index.ts`, `test/index.test.ts`, and `README.md` under its canonical
    root;
  - candidate pattern writes exactly the candidate `.md` and candidate manifest;
  - refusal decisions expose an empty write set.
- Exhaustiveness/static gate:
  - every `ScaffoldingDecision.state` and refusal reason has an exhaustive
    `never` check in the dispatcher.
- Existing command gates should be corrected and extended:
  - keep `bun run --cwd tools/habitat test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`;
  - replace `bun run habitat generate --help` with an actual Nx generator help
    or dry-run command, because current Habitat commands are `check`, `verify`,
    `classify`, `fix`, `graph`, and `hook` (`tools/habitat/docs/CAPABILITIES.md:34`);
  - require `nx g @habitat/cli:project unsupported-scratch --kind=mod --dry-run` to fail before writes;
  - require an explicit Authoring Topology dry-run/refusal test, even if that is
    a thin unit test around the parser rather than an Nx command.

## 6. P1/P2 findings against current packet

### P1: Live spec does not require the closed type-state model D13 depends on

Evidence:

- Source packet requires discriminated scaffolding requests and enumerates
  supported project, candidate pattern, unsupported kind, authoring topology, and
  preflight conflict states at
  `docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:67`.
- Live spec reduces this to "supported uniform shapes" and "unsupported project,
  pattern, or host-specific requests" at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:5`.
- Live tasks say "Define supported scaffold contracts and unsupported refusal
  shape" at `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:14`,
  but do not require parse-at-boundary, closed unions, write/refusal decision
  separation, or exhaustive handling.

Why this blocks: implementation can satisfy the packet with current-style string
branches and thrown `Error`s. That leaves unsupported writes prevented by
convention and tests, not made unrepresentable.

Required repair: add normative requirements/scenarios for a closed
`ScaffoldingDecision` union, structured `ScaffoldRefusal`, and the invariant that
only write decisions carry write sets.

### P1: Authoring Topology is not a named refusal variant in the live packet

Evidence:

- Source packet explicitly requires an Authoring Topology refusal/future trigger
  at
  `docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:38`.
- Live proposal non-goals only say "No Civ-specific generator assumptions in
  generic Habitat" at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:35`;
  this does not identify MapGen recipe/domain/op/stage/step topology as a
  protected refusal state.
- Existing Habitat docs list unsupported MapGen authoring structures at
  `tools/habitat/docs/GAPS.md:17` and state the current generators are
  not MapGen authoring generators at `tools/habitat/docs/GAPS.md:29`.

Why this blocks: a later implementation could add a "helpful" generic topology
scaffold and still claim it avoided "Civ-specific assumptions." The state that
must be impossible is broader and more concrete: Habitat must not create MapGen
recipe/domain/op/stage/step topology under D13.

Required repair: add a normative Authoring Topology refusal scenario with
protected paths, owner `Authoring Topology`, next safe action, and non-claim
"D13 does not implement MapGen authoring."

### P1: Candidate pattern generation and registered promotion are not separated in the live spec

Evidence:

- Source packet says candidate pattern generation does not register a rule at
  `docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:104`.
- Current tests prove candidate generation writes no active `.grit`, no
  baseline, and no `rules.json` entry at
  `tools/habitat/test/generators/pattern-generator.test.ts:20`.
- Live spec has no scenario for candidate-only output or registered promotion
  requiring accepted Pattern Authority Manifest
  (`openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:7`).
- The generator schema description currently says the pattern generator
  scaffolds "a Habitat Grit pattern and matching rule-pack entry" at
  `tools/habitat/generators.json:14`, which is false for candidate
  lifecycle and shows why the distinction needs to be normative.

Why this blocks: the packet does not preserve the strongest existing invariant:
candidate artifacts are not registered enforcement state.

Required repair: add separate scenarios for `pattern-candidate` and
`pattern-registered-promotion`. Candidate must write only candidate artifacts and
carry non-claims; registered promotion must consume accepted Pattern Authority
state and baseline contract before active writes.

### P2: Refusal DTO shape is too underspecified to preserve owner/recovery/non-claims

Evidence:

- Source packet requires blocked action, reason, owner, next safe action, proof
  class, and non-claims at
  `docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md:62`.
- Live proposal stop condition only says refusals must have owner, reason, and
  recovery path at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:71`.
- Live spec says owner, reason, and recovery guidance at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:5`,
  omitting validation category, blocked action, non-claims, and protected/write set.

Risk: later implementation can keep unstructured thrown errors. That preserves
some user-facing text while losing machine-checkable refusal states.

Required repair: make `ScaffoldRefusal` a required structured contract with
blocked action, reason, owner, next safe action, validation category, non-claims, and
empty write set.

### P2: Validation gates include a command that does not match current command surface

Evidence:

- Live proposal requires `bun run habitat generate --help` at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md:76`.
- Live tasks repeat it at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:21`.
- Current command docs list `check`, `verify`, `classify`, `fix`, `graph`, and
  `hook`, not `generate`, at `tools/habitat/docs/CAPABILITIES.md:34`.
- Current command files are `check.ts`, `classify.ts`, `graph.ts`, `hook.ts`,
  `fix.ts`, and `verify.ts`; generator usage is via Nx
  (`tools/habitat/generators.json:5`).

Risk: the validation packet can pass review with a non-falsifying or nonexistent
gate, while the real risk is Nx generator dry-run/write behavior.

Required repair: replace with actual Nx generator help/dry-run gates and no-write
bad-case gates.

### P2: Write set and protected set are deferred rather than specified

Evidence:

- Design says implementation needs a concrete write set and protected path list
  before starting at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:49`.
- Tasks require recording the concrete write set later at
  `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md:9`.
- No current packet artifact enumerates the actual write set/protected set.

Risk: implementation can discover/edit authority surfaces opportunistically,
including Authoring Topology or Pattern Authority surfaces that should be
protected unless a closed decision authorizes them.

Required repair: put the write set and protected set in the packet before
acceptance, then make source edits outside that set a stop condition.

### P2: Nx generator options becoming authority is not a D13 invariant

Evidence:

- Pattern Authority rejects Nx-option-shaped authority at
  `tools/habitat/src/rules/pattern-authority/manifest.ts:258`.
- The test for that invariant is
  `tools/habitat/test/rules/pattern-authority-manifest.test.ts:236`.
- D13 proposal/design do not name "Nx generator options are command input only,
  not authority" as a non-claim or requirement.

Risk: a future implementation may treat schema enum values, CLI flags, or dry-run
metadata as enough to promote pattern or scaffold authority.

Required repair: add a normative requirement that generator options are parsed
only into request/refusal decisions and cannot become Pattern Authority,
Host Policy, or Authoring Topology authority.
