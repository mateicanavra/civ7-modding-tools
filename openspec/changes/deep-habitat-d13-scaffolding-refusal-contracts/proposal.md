# Proposal: D13 Scaffolding And Refusal Contracts

## Summary

Specify the D13 Scaffolding and Refusal OpenSpec packet for Deep Habitat Phase
2. This packet defines which repo structures Habitat may create, which requests
it must refuse before writes, and which adjacent owner must handle the request
instead. The target outcome is a later implementation with no opportunity to
mistake a project shell, Pattern Authority candidate, host-specific request, or
future Authoring Topology request for a generally supported Habitat capability.

This is design/specification work only. No TypeScript source implementation is
authorized until the packet is accepted for design/specification and the named
source blockers have live implementation facts.

## Authority

- Remediation context router: `$REMEDIATION_DIR/context.md`.
- Remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`.
- Source domino packet: `$D13_SOURCE_PACKET`.
- Domain design packet: `$HABITAT_PROJECT/domain-mapping/domain-design-packet.md`.
- Accepted design/specification packets for D0, D2, and D8.
- Blocking input packet for G-HOST; D13 may design against the dependency, but
  source implementation remains blocked wherever host declarations are needed.
- Current Habitat generator code and tests as present-behavior input, not
  target-domain authority.
- Official Nx generator documentation for generator mechanics; official
  Grit/GritQL documentation where pattern candidate files or registered Grit
  outputs are discussed.

## Product Scenario

An agent asks Habitat to create or prepare a repo structure. Habitat either:

- creates a supported generic uniform project shell;
- creates a Pattern Authority candidate draft that is explicitly not active;
- refuses registered pattern promotion until D8 admission inputs are present;
- refuses unsupported project kinds, host-specific shapes, and Authoring
  Topology requests before writes; or
- returns a recovery action that names the owning domain and next allowed step.

## What Changes

- Define the closed D13 request/outcome model for:
  - supported uniform project creation;
  - project preflight refusal;
  - Pattern Authority candidate draft creation;
  - registered pattern promotion handoff/refusal through D8;
  - unsupported kind refusal;
  - host-policy-gated refusal;
  - Authoring Topology future-work refusal.
- Define generator public surfaces and compatibility blockers that require D0
  rows before source implementation changes.
- Define D13 write/protected paths and validation gates for later
  implementation.
- Define D13's generic refusal envelope for unsupported authoring requests while
  keeping authoring-specific blocked actions, future criteria, and source
  behavior blocked behind D14 early-fence language.

## What Does Not Change

- D13 does not admit patterns, register active Grit checks, accept baselines,
  publish hook eligibility, or approve apply capability; D8 owns those
  decisions.
- D13 does not own registry metadata projections; D2 owns those facts.
- D13 does not own host policy declarations; G-HOST owns them.
- D13 does not implement MapGen or other domain-specific Authoring Topology.
- D13 does not change source behavior in this remediation layer.

## Requires

- D0 accepted design/specification for public compatibility handling. Source
  implementation remains blocked until concrete D0 matrix rows exist for every
  touched generator name, schema, option, error string, output path, package
  export, docs/example, and Nx-discovered surface.
- D2 accepted design/specification for `ruleGovernanceFacts`,
  `ruleGeneratedZoneFacts`, and generator/registry projections. Source
  implementation remains blocked until live projections exist where consumed.
- D8 accepted design/specification for Pattern Governance candidate/admission
  semantics. Source implementation remains blocked until live D8 candidate and
  admission projections exist where consumed.
- G-HOST remains blocking for source behavior that depends on host-specific
  declaration or refusal facts.

## D14 Boundary

- D13 owns the generic refusal envelope and supported scaffolding boundary.
- D14 owns Authoring Topology blocked-action language, future acceptance
  criteria, and authoring-specific recovery semantics.
- Source implementation for authoring-specific refusal behavior remains blocked
  until D14 supplies accepted early-fence language for D13 to cite.

## Affected Owners

- D13 owner: Scaffolding and Refusal Contracts.
- Adjacent owners: D0 Public Compatibility, D2 Rule Registry Metadata, D8
  Pattern Governance, G-HOST Host Policy Boundary, D14 Authoring Topology Fence.
- OpenSpec change root: `$D13_CHANGE`.

## Public Surface Impact

Later implementation may affect these public or durable surfaces only through D0
compatibility handling:

- `@internal/habitat-harness:project` generator name, schema, option enum,
  default handling, description, dry-run output, thrown error strings, and
  generated file layout.
- `@internal/habitat-harness:pattern` generator name, schema, lifecycle option,
  descriptions, candidate/registered behavior, thrown error strings, and
  generated candidate/active paths.
- `tools/habitat-harness/generators.json` descriptions.
- Generated project package names, roots, `package.json` scripts, Nx tags,
  `README.md`, source/test templates, and Nx-discovered target matrix.
- Pattern Authority candidate files, candidate manifests, active Grit pattern
  path, `rules.json` rows, and baseline relation surfaces when pattern
  promotion is involved.
- Habitat docs/examples that tell agents what scaffolding is supported.

## Stop Conditions

- A project request outside the supported project-kind contract can create files.
- A pattern candidate can be read as an active rule, baseline, hook signal,
  diagnostic admission, or apply admission.
- Registered pattern promotion can proceed without D8 admission inputs and D5
  baseline requirements named by D8.
- Host-specific behavior is claimed without a G-HOST declaration/refusal input.
- Authoring Topology requests are routed to generic project/pattern scaffolding.
- The packet leaves the state model, write set, D0 compatibility rows,
  validation oracle, or recovery language for implementation to invent.

## Validation Gates

Design-time gates:

- `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict`
- `bun run openspec:validate`
- `git diff --check`
- Complete-standard wording audit over `$D13_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D13-*.md`.

Later implementation gates:

- `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`
- `bun run nx g @internal/habitat-harness:project <fixture> --kind=plugin --dry-run --no-interactive`
- `bun run nx g @internal/habitat-harness:project <fixture> --kind=mod --dry-run --no-interactive`
- `bun run nx g @internal/habitat-harness:pattern <fixture> --lifecycle=candidate --dry-run --no-interactive`
- `bun run nx g @internal/habitat-harness:pattern <fixture> --lifecycle=registered-advisory --dry-run --no-interactive`
- `nx show project <generated-supported-fixture> --json` after a controlled
  generated-project fixture write, followed by cleanup and `git status --short
  --branch`.
