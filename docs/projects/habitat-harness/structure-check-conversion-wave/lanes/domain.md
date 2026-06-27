# Domain Lane

Status: reviewed, no conversion in this wave.

The domain aggregate scripts contain a few possible file-tree fragments, but
they are entangled with profile auto-detection, explicit exception decisions,
source cleanup bans, exact contract currentness, and existing-rule delegations.
This wave did not guess those scopes into TOML.

Next domain work should start with explicit accepted root lists for any topology
claim, then create narrow structure packets. Existing source predicates should
move to Grit or existing rules, not structure-check.
