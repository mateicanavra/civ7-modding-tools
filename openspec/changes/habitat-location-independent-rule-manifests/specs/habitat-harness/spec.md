## ADDED Requirements

### Requirement: Rule Manifests Are The Source Of Live Rule Identity

Habitat SHALL identify every live rule by `rule.json.id`. The current file path
and packet directory name SHALL NOT be required to determine the rule id.

#### Scenario: Manifest moves without identity change

- **WHEN** a `rule.json` file is moved to another `.habitat` location without
  changing `id`
- **THEN** Habitat inventories the same rule id
- **AND** rule selection by that id still selects the moved rule
- **AND** reports use the manifest title and message rather than a title derived
  from the directory name

#### Scenario: Duplicate ids are present

- **WHEN** two discovered manifests declare the same `id`
- **THEN** Habitat refuses the registry before executing rules
- **AND** the refusal identifies both conflicting manifest paths

### Requirement: Rule Manifests Declare Current Placement As Inventory Metadata

Habitat SHALL read current rule belonging from `rule.json.placement`.
`placement` SHALL describe current inventory placement only. It SHALL NOT define
future admission authority or require the manifest to live under a matching
tree path.

#### Scenario: Placement differs from physical path

- **WHEN** a manifest's physical path does not match its declared placement
- **THEN** Habitat still inventories the rule from the manifest
- **AND** any mismatch report is advisory or separately classified
- **AND** the mismatch does not make physical path the identity source

#### Scenario: Admission language appears in manifest schema

- **WHEN** a manifest adds admission-specific fields outside the accepted schema
- **THEN** Habitat rejects the manifest as schema-invalid
- **AND** the implementation does not treat `placement` as admission evidence

### Requirement: Rule Manifests Declare Explicit Runner Entrypoints

Habitat SHALL execute each rule from explicit `rule.json.runner` facts. Habitat
SHALL NOT derive live runner identity from sibling file presence.

#### Scenario: Grit runner declares pattern file

- **WHEN** a manifest declares `runner.name: "grit"` and a pattern file
- **THEN** Habitat runs the rule through Grit using the declared pattern file
- **AND** moving the manifest does not change the pattern file unless the
  manifest reference changes

#### Scenario: Habitat structure runner declares structure file

- **WHEN** a manifest declares `runner.name: "habitat"`, `mode: "structure"`,
  and a structure file
- **THEN** Habitat runs the structure check using the declared structure file
- **AND** it does not search siblings to find `structure.toml`

#### Scenario: Habitat script runner declares script file

- **WHEN** a manifest declares `runner.name: "habitat"`, `mode: "script"`, a
  script file, and runtime
- **THEN** Habitat invokes the declared script with the declared runtime
- **AND** it does not infer runtime from sibling file naming

#### Scenario: Referenced runner file is missing

- **WHEN** a manifest references a runner file that does not exist
- **THEN** Habitat refuses the registry before rule execution
- **AND** the refusal names the manifest path and missing referenced file

### Requirement: Rule Manifests Declare Consumed Rule Artifacts

Habitat SHALL locate current rule authority files that affect behavior from manifest
facts or from a deliberately global id-based contract. Subject-local artifact
search by packet grammar SHALL NOT be required for current rules.

#### Scenario: Baseline artifact is declared

- **WHEN** a rule has a subject-local baseline artifact
- **THEN** the manifest declares the baseline authority path
- **AND** baseline integrity reads the current baseline through that declaration
- **AND** moving the manifest does not disconnect the rule from its baseline

#### Scenario: Baseline artifact is missing

- **WHEN** a manifest declares a baseline authority path that does not exist
- **THEN** Habitat refuses the registry or baseline projection before baseline
  comparison
- **AND** the refusal names the manifest path and missing baseline path

### Requirement: Registry Discovery Is Location Independent Under Habitat

Habitat SHALL discover live rules by finding `.habitat/**/rule.json` and
parsing each manifest. Current packet grammar SHALL NOT be required for live
discovery.

#### Scenario: Manifest is not under a blueprints packet path

- **WHEN** `.habitat/<some-other-location>/rule.json` declares a valid manifest
- **THEN** Habitat includes it in the registry inventory
- **AND** consumers receive the same facts they would receive from a packet-path
  manifest

#### Scenario: Stale prefixed rule file exists

- **WHEN** a stale `<packet>.rule.json` file exists
- **THEN** Habitat rejects it as stale shape
- **AND** it does not parse the stale file as a live rule or compatibility input

### Requirement: Current Consumers Use Manifest Facts

Habitat SHALL update registry consumers to use manifest facts rather than
packet-path grammar or sibling inference.

#### Scenario: Baseline reads current rule id

- **WHEN** baseline integrity compares current rules
- **THEN** it reads rule ids from manifests
- **AND** path-regex extraction is limited to bounded git-history fallback for
  old commits

#### Scenario: Artifact routing handles changed runner files

- **WHEN** a changed file matches a manifest path or a declared runner file
- **THEN** Habitat maps the changed file to the owning rule id through manifest
  inventory
- **AND** it does not require the changed path to contain
  `/blueprints/<blueprint>/<category>/<kind>/<packet>/`

#### Scenario: Nx inputs are generated

- **WHEN** Nx target inputs are generated for a rule
- **THEN** they include the manifest path and declared runner and rule artifact
  files
- **AND** they do not use `.habitat/**/<rule-id>/**` as the primary
  invalidation relation

#### Scenario: Old public runner names are requested

- **WHEN** a user requests `--runner command-check`, `--runner structure-check`,
  `--runner file-layer`, `--runner format-check`, `--runner source-check`, or
  `--runner grit-check`
- **THEN** Habitat refuses the selector as non-canonical
- **AND** `--runner habitat` remains the public selector for Habitat-native
  structure, script, and file-layer modes

### Requirement: Location Independence Has Closure Guards

Habitat SHALL include tests and closure scans that prevent reintroducing live
path-derived identity or sibling-derived runner inference.

#### Scenario: Path-derived identity returns

- **WHEN** live discovery requires `isPacketRulePath`,
  `packetLocationFromArtifactPath`, or equivalent packet grammar to load current
  rules
- **THEN** the implementation is not closed

#### Scenario: Sibling-derived runner returns

- **WHEN** live registry loading determines runner from sibling role filenames
  rather than `rule.json.runner`
- **THEN** the implementation is not closed
