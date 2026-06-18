## ADDED Requirements

### Requirement: Scaffold Requests Resolve To Closed Pre-Write Decisions

Habitat scaffolding SHALL parse raw generator input into a closed D13 request
model before any file mutation. The resulting pre-write decision SHALL be one of
project scaffold write, pattern candidate draft write, registered-pattern
promotion handoff, or scaffold refusal. Only write decisions SHALL carry a
non-empty write set.

#### Scenario: Supported project request parses to write decision
- **WHEN** a request names project kind `plugin`, `foundation`, or `app` and
  supplies canonical root/package inputs
- **THEN** Habitat classifies it as a supported project scaffold request
- **AND** the decision names the supported project kind, canonical root,
  canonical package name, write set, and follow-up checks

#### Scenario: Unsupported project kind parses to refusal
- **WHEN** a request names any project kind outside the supported D13 project
  set and no accepted upstream owner declares it supported
- **THEN** Habitat classifies it as an unsupported project kind request
- **AND** the decision is a scaffold refusal with an empty write set

#### Scenario: Malformed request parses to refusal
- **WHEN** required fields are missing, invalid, contradictory, or cannot be
  normalized into a supported request class
- **THEN** Habitat refuses before writes
- **AND** the refusal names `malformed-request` or the more specific closed
  reason that applies

### Requirement: Supported Project Scaffolds Are Uniform And Bounded

D13-supported project scaffolding SHALL be limited to the accepted project-kind
set `plugin`, `foundation`, and `app` until another accepted owner extends the
contract. A supported scaffold SHALL write only its canonical root layout and
SHALL report a scaffold receipt with written paths, contract identity,
follow-up checks, consumed upstream projections, and non-claims.

#### Scenario: Supported plugin scaffold dry-run is requested
- **WHEN** an agent runs `bun run nx g @internal/habitat-harness:project d13-plugin-smoke --kind=plugin --dry-run --no-interactive`
- **THEN** the command exits 0
- **AND** dry-run output lists only the supported plugin scaffold paths
- **AND** no files are persisted by the dry-run
- **AND** the receipt does not claim package, application, product, or runtime
  behavior is proven

#### Scenario: Canonical root or package input is contradicted
- **WHEN** a supported project request supplies a root or package name that does
  not match the D13 contract
- **THEN** Habitat refuses before writes
- **AND** the refusal names the expected and received values
- **AND** existing files remain unchanged

#### Scenario: Target root or package name already exists
- **WHEN** a supported project request collides with a non-empty root or an
  existing package name
- **THEN** Habitat refuses before writes
- **AND** the refusal identifies the conflicting path or package
- **AND** the retry condition tells the agent to choose a new name or remove the
  stale target intentionally

### Requirement: Unsupported Project And Host-Owned Kinds Refuse Before Writes

Habitat SHALL refuse unsupported, host-owned, or upstream-unowned scaffold kinds
before writes. Current schema-admitted but runtime-unsupported names SHALL be
treated as intentional compatibility/refusal surfaces only after D0 rows exist;
they SHALL NOT become generic Habitat taxonomy by accident.

#### Scenario: Schema-admitted unsupported kind reaches Habitat refusal
- **WHEN** an agent runs `bun run nx g @internal/habitat-harness:project d13-mod-refusal --kind=mod --dry-run --no-interactive`
- **THEN** the command exits nonzero through Habitat's refusal path
- **AND** the refusal names the unsupported kind, owning authority or unknown
  owner, recovery action, retry condition, and no-write result
- **AND** no `mods/**`, package, or source files are written

#### Scenario: Host-specific scaffold request lacks accepted host policy
- **WHEN** a scaffold request requires host-owned declaration or path/gate policy
  and G-HOST does not provide an accepted live declaration
- **THEN** Habitat refuses before writes with `host-policy-missing`
- **AND** the refusal names G-HOST as owning authority
- **AND** the command does not infer Civ, MapGen, or other host semantics

### Requirement: Authoring Topology Requests Are Refused Through D14 Boundary

Habitat SHALL NOT route recipe, domain, operation, stage, step, contract,
default, schema, registry, Studio, or similar Authoring Topology requests through
generic project or pattern scaffolding. D13 SHALL provide the generic refusal
shape, while D14 owns authoring-specific blocked action language and future
acceptance criteria.

#### Scenario: Authoring topology request is made before D14 live implementation
- **WHEN** a request asks D13 to create Authoring Topology structures
- **THEN** Habitat refuses before writes
- **AND** the refusal names D14 or future Authoring Topology as owning authority
- **AND** no MapGen authoring files, recipe/domain/op/stage/step files, or
  Studio artifacts are written
- **AND** the refusal states D13 does not implement Authoring Topology

### Requirement: Pattern Candidate Drafts Are Not Active Pattern Authority

Candidate pattern generation SHALL create only candidate draft surfaces. It
SHALL NOT create active Grit patterns, rule registry rows, baseline state, hook
eligibility, diagnostic admission, local-feedback admission, or apply
capability.

#### Scenario: Candidate pattern draft is requested
- **WHEN** an agent runs `bun run nx g @internal/habitat-harness:pattern grit-d13-candidate --lifecycle=candidate --openspecChangeId=deep-habitat-d13-scaffolding-refusal-contracts --dry-run --no-interactive`
- **THEN** the command exits 0
- **AND** dry-run output lists only candidate draft and candidate manifest paths
- **AND** no active `.grit/patterns/habitat/checks/**`,
  `tools/habitat-harness/src/rules/rules.json`, baseline, hook,
  local-feedback, diagnostic, or apply surface is written
- **AND** the receipt states registration requires D8 Pattern Governance

#### Scenario: Candidate draft collides with existing candidate or active surface
- **WHEN** candidate generation would collide with an existing candidate pattern,
  candidate manifest, active Grit pattern, active rule row, or baseline
- **THEN** Habitat refuses before writes
- **AND** the refusal identifies the conflicting surface and owner

### Requirement: Registered Pattern Promotion Is D8-Owned

D13 SHALL NOT admit or register patterns by itself. Registered advisory/enforced
promotion requests SHALL either route through D8 Pattern Governance using live
D8 projections or refuse before active writes with a D8-owned reason projection.

#### Scenario: Registered advisory request omits manifest
- **WHEN** an agent runs `bun run nx g @internal/habitat-harness:pattern grit-d13-advisory --lifecycle=registered-advisory --dry-run --no-interactive`
- **THEN** Habitat refuses before active writes
- **AND** the refusal names the missing Pattern Authority manifest and D8
  recovery action
- **AND** no active Grit pattern, rule row, baseline, hook, or apply surface is
  written

#### Scenario: Registered promotion manifest is rejected
- **WHEN** D8 validation rejects the Pattern Authority manifest, baseline
  relation, hook relation, source relation, or rule reference
- **THEN** Habitat refuses before active writes
- **AND** the refusal projects the D8 reason without weakening D8 authority

#### Scenario: Registered promotion inputs are accepted by D8
- **WHEN** D8 live projections provide accepted Pattern Authority, baseline,
  hook, and source facts for the requested lifecycle
- **THEN** D13 may route the request to governed promotion
- **AND** the handoff record states D8 owns registration/admission semantics

### Requirement: Public Surface Changes Are Blocked Behind D0 Rows

Later D13 source implementation SHALL cite concrete D0 compatibility rows before
changing generator names, schemas, options, descriptions, dry-run output, error
strings, generated layout, package exports, public docs/examples, or
Nx-discovered surfaces. Without the row, the source step is blocked.

#### Scenario: Generator schema changes without D0 row
- **WHEN** implementation would change project or pattern generator schema,
  option enum, option description, default, or lifecycle wording
- **THEN** the implementation step stops until a D0 row identifies the
  compatibility handling

#### Scenario: Pattern generator public description changes
- **WHEN** implementation fixes the candidate/registered wording in
  `tools/habitat-harness/generators.json`
- **THEN** the change cites a D0 row for generator description/help
  compatibility
- **AND** the description does not imply candidate generation creates active
  rule-pack state
