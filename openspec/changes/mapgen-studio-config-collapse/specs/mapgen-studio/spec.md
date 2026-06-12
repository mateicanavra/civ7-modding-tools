## ADDED Requirements

### Requirement: Config Objects Collapse With A Per-Object Header

Every titled config object in the form SHALL render a per-object header row
(stage cards, group and array wells, subgroup headings) — a chevron+title
disclosure button (`aria-expanded`, `aria-controls`) plus a trailing
object-local action zone — and SHALL render collapsed by default with manual
expand, in focused and unfocused modes alike. The focused stage root defaults
expanded. Expansion state is keyed by the object's JSON pointer and survives
switching between modes. Templates rendered without a collapse context (unit
mounts, bare reuse) keep today's always-expanded markup.

#### Scenario: Objects render collapsed by default
- **WHEN** the config form renders in unfocused mode with no prior expansion choices
- **THEN** every stage card renders as a single header row with its content hidden
- **AND** expanding a stage reveals its loose fields and its child group headers, themselves collapsed

#### Scenario: Focused stage root is shown, children still collapse
- **WHEN** the form renders in focused mode for a selected stage
- **THEN** that stage renders expanded while its child groups render collapsed until expanded manually

#### Scenario: Disclosure is accessible
- **WHEN** any config-object header renders
- **THEN** the chevron+title is one button with `aria-expanded` reflecting state and `aria-controls` referencing the content region

#### Scenario: Array actions live in the header action zone
- **WHEN** a mutable array object renders its header
- **THEN** the Add affordance renders in the header's trailing action zone

### Requirement: Sticky Auto-Expand Is An Opt-In Config Toolbar Toggle

The config toolbar SHALL offer an auto-expand-on-scroll toggle
(`aria-pressed`, default OFF). When ON, the object whose header has most
recently passed the focus line expands — cascading along its ancestor chain —
and objects scrolled past collapse; the reading position never visibly jumps.
When OFF, scrolling never changes expansion.

#### Scenario: Default is manual
- **WHEN** the config form loads fresh
- **THEN** the toggle is off and scrolling changes no expansion state

#### Scenario: Scroll drives the expansion chain when enabled
- **WHEN** the toggle is on and the user scrolls a collapsed object's header past the focus line
- **THEN** that object (and its ancestors) expand while previously active objects outside the chain collapse
