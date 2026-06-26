# Public Surface Ledger

## Rule

Every later source packet that touches a public surface must cite the concrete
`surface_id` rows from
`docs/projects/habitat-harness/public-surface-compatibility-matrix.md`. A
packet may not replace this with prose such as "CLI behavior" or "exports".

For implementation closure, each cited row must name one handling:
`preserve`, `facade`, `version`, `deprecate`, or `refuse`.

## Command Surface Rows

| Surface family | Required D0 rows |
|---|---|
| Check command and flags | `D0-cli-cmd-check`, `D0-cli-cmd-check-flag-json`, `D0-cli-cmd-check-flag-output`, `D0-cli-cmd-check-flag-owner`, `D0-cli-cmd-check-flag-tool`, `D0-cli-cmd-check-flag-staged`, `D0-cli-cmd-check-flag-expand-baseline`, `D0-cli-cmd-check-flag-base`, `D0-cli-cmd-check-flag-rule`, `D0-cli-cmd-check-rule-baseline-integrity-refused` |
| Classify command | `D0-cli-cmd-classify`, `D0-cli-cmd-classify-arg-path` |
| Verify command | `D0-cli-cmd-verify`, `D0-cli-cmd-verify-flag-base`, `D0-cli-cmd-verify-flag-json` |
| Fix command | `D0-cli-cmd-fix`, `D0-cli-cmd-fix-flag-dry-run`, `D0-cli-cmd-fix-flag-json-refused` |
| Graph command | `D0-cli-cmd-graph`, `D0-cli-cmd-graph-flag-json` |
| Hook command | `D0-cli-cmd-hook`, `D0-cli-cmd-hook-arg-name`, `D0-cli-cmd-hook-flag-base`, `D0-cli-cmd-hook-flag-dry-run-refused` |
| Root forwarding examples | `D0-cli-cmd-check-forwarding-root-alias`, `D0-cli-cmd-check-forwarding-root-habitat`, `D0-cli-cmd-check-forwarding-nested-double-dash` |

## Command JSON Rows

| DTO family | Required D0 rows |
|---|---|
| Check report JSON | `D0-command-json-type-checkreport`, `D0-command-json-type-rulereport`, `D0-command-json-type-habitatdiagnostic`, `D0-command-json-cmd-check-json-selector-failure` |
| Classify JSON | `D0-command-json-type-classification`, `D0-command-json-type-diffclassification`, `D0-command-json-type-classifiedtarget`, `D0-command-json-type-unavailableclassifiedtarget`, `D0-command-json-type-classifyresult`, `D0-command-json-type-classifydiffresult`, `D0-command-json-type-rulerouting`, `D0-command-json-field-classifiedtarget-source` |
| Verify receipt JSON | `D0-command-json-type-verifyreceipt` |

## Hook Rows

| Surface family | Required D0 rows |
|---|---|
| Hook delegates | `D0-hook-hook-pre-commit`, `D0-hook-hook-pre-push`, `D0-hook-hook-unknown-refusal` |
| Hook user-facing lines | `D0-hook-hook-pre-commit-line-hook-runtime-ci-authority`, `D0-hook-hook-pre-commit-line-pass`, `D0-hook-hook-pre-push-line-hook-runtime-ci-authority`, `D0-hook-hook-pre-push-line-affected-base` |

## Root Script Rows

| Surface family | Required D0 rows |
|---|---|
| Habitat root scripts | `D0-root-script-script-habitat`, `D0-root-script-script-habitat-check`, `D0-root-script-script-habitat-fix`, `D0-root-script-script-habitat-verify-refused`, `D0-root-script-script-habitat-init-refused` |
| Root aggregate scripts | `D0-root-script-script-check`, `D0-root-script-script-verify`, `D0-root-script-script-ci`, `D0-root-script-script-lint`, `D0-root-script-script-lint-adapter-boundary`, `D0-root-script-script-lint-domain-refactor-guardrails`, `D0-root-script-script-lint-domain-refactor-guardrails-strict-core`, `D0-root-script-script-lint-mapgen-recipe-imports`, `D0-root-script-script-lint-mapgen-docs` |
| Resource helper scripts | `D0-root-script-script-resources-init`, `D0-root-script-script-resources-publish`, `D0-root-script-script-resources-status`, `D0-root-script-script-resources-unlock` |
| Biome scripts | `D0-root-script-script-biome-format`, `D0-root-script-script-biome-check`, `D0-root-script-script-format-ci` |

## Package Export Row Rules

The D0 package-export plane has 160 rows. Later packets do not need to cite all
160 rows unless they touch the root barrel, package manifest, or export
classification broadly. They must cite the exact row IDs for touched symbols.

Required row families:

- Package subpaths and manifest fields: `D0-package-export-subpath-*`,
  `D0-package-export-file-*`, `D0-package-export-package-script-*`,
  `D0-package-export-package-nx-target-*`.
- Root barrel symbols: `D0-package-export-symbol-*`.
- Host policy facade: `D0-package-export-source-host-policy-internal`.

Current high-risk rows for this Effect substrate train:

| Risk | Required D0 rows |
|---|---|
| Runtime edge export | `D0-package-export-symbol-runhabitateffect` |
| Command/process substrate exports | `D0-package-export-symbol-commandcachepolicy`, `D0-package-export-symbol-gritparsestatus`, `D0-package-export-symbol-habitatcommandkind`, `D0-package-export-symbol-habitatcommandresult`, `D0-package-export-symbol-habitatprocessrequest`, `D0-package-export-symbol-grittoolunavailable`, `D0-package-export-symbol-habitatprocess`, `D0-package-export-symbol-habitatprocesslive`, `D0-package-export-symbol-makehabitatcommandresult`, `D0-package-export-symbol-makefakehabitatprocesslayer` |
| Workspace tool exports | `D0-package-export-symbol-habitattoolexecutionplane`, `D0-package-export-symbol-materializedhabitatcommand`, `D0-package-export-symbol-materializehabitatcommand` |
| Git and graph helper exports | `D0-package-export-symbol-readgitstate`, `D0-package-export-symbol-rungraph` |
| Fix helper export | `D0-package-export-symbol-runfix` handled as `refuse` by the fix service-module slice |
| Check report exports | `D0-package-export-symbol-createcheckreport`, `D0-package-export-symbol-rendercheckreport`, `D0-package-export-symbol-stringifycheckreport`, `D0-package-export-symbol-checkreport`, `D0-package-export-symbol-habitatdiagnostic`, `D0-package-export-symbol-habitatseverity`, `D0-package-export-symbol-rulereport`, `D0-package-export-symbol-validatecheckreport` |
| Classify exports | `D0-package-export-symbol-classifiedtarget`, `D0-package-export-symbol-classifyoptions`, `D0-package-export-symbol-classifypath`, `D0-package-export-symbol-classifytarget`, `D0-package-export-symbol-classifyresult`, `D0-package-export-symbol-pathclassification`, `D0-package-export-symbol-rulerouting`, `D0-package-export-symbol-classifypathresult`, `D0-package-export-symbol-classifytargetresult`, `D0-package-export-symbol-stringifyclassifyresult`, `D0-package-export-symbol-validateclassifyresult`, `D0-package-export-symbol-commandsummary` |
| Verify/proof exports | `D0-package-export-symbol-resolveverifybase`, `D0-package-export-symbol-runaffectedverification`, `D0-package-export-symbol-createverifyreceipt`, `D0-package-export-symbol-readverifytargetplan`, `D0-package-export-symbol-verifyaffectedtargets`, `D0-package-export-symbol-verifyoptions`, `D0-package-export-symbol-verifybaseresolution`, `D0-package-export-symbol-verifyreceipt`, `D0-package-export-symbol-verifyreceiptschema`, `D0-package-export-symbol-validateverifyreceipt`, `D0-package-export-symbol-isverifyreceipt`, `D0-package-export-symbol-stringifyverifyreceipt` |
| Baseline exports | `D0-package-export-symbol-applybaseline`, `D0-package-export-symbol-checkbaselineintegrity`, `D0-package-export-symbol-guardbaselineexpansion`, `D0-package-export-symbol-loadbaseline`, `D0-package-export-symbol-loadbaselinestate`, `D0-package-export-symbol-writebaseline`, `D0-package-export-symbol-violationkey` |
| Rule/pattern exports | `D0-package-export-symbol-harnessrule`, `D0-package-export-symbol-executerule`, `D0-package-export-symbol-rulebyid`, `D0-package-export-symbol-rules`, `D0-package-export-symbol-candidatepatternauthoritymanifest`, `D0-package-export-symbol-patternauthoritymanifest`, `D0-package-export-symbol-validatepatternauthoritymanifest`, `D0-package-export-symbol-patternauthoritycandidateroot`, `D0-package-export-symbol-patternauthoritymanifestpath`, `D0-package-export-symbol-patternauthoritymanifestroot` |
| Refused historical apply exports | `D0-package-export-symbol-gritapplyrewriteinventoryentry`, `D0-package-export-symbol-gritapplytransactionoptions`, `D0-package-export-symbol-gritapplytransactionresult`, `D0-package-export-symbol-classifyapplyrewriteinventory`, `D0-package-export-symbol-parseapplyrewriteinventory`, `D0-package-export-symbol-rungritapplytransaction` |

## Nx Target Rows

Any packet that changes Nx plugin target discovery, generator metadata, root
script target calls, or `NxProvider` behavior must cite exact rows from the D0
`nx-target` plane. At minimum, the Effect substrate train must preserve or
facade:

- `D0-nx-target-target-build-tsc`
- `D0-nx-target-target-build-manifest`
- `D0-nx-target-target-build-bin-mode`
- `D0-nx-target-target-build`
- `D0-nx-target-target-boundaries`
- `D0-nx-target-target-biome-format`
- `D0-nx-target-target-biome-check`
- `D0-nx-target-target-format-ci`
- `D0-nx-target-target-pattern-check`
- `D0-nx-target-target-generated-check`
- `D0-nx-target-target-habitat-check-all`
- `D0-nx-target-target-tools-habitat-harness-habitat-check`
- `D0-nx-target-target-mods-mod-swooper-maps-habitat-check`
- `D0-nx-target-target-packages-mapgen-core-habitat-check`
- `D0-nx-target-target-packages-civ7-control-orpc-habitat-check`
- `D0-nx-target-target-packages-sdk-habitat-check`

Generated per-rule targets must cite their exact `D0-nx-target-target-habitat-rule-*`
rows when touched. The generated nature of those rows is not permission to
change target spelling silently.

## Durable Authored Data Rows

| Surface family | Required D0 rows |
|---|---|
| Baselines | `D0-durable-data-baselines-json-array` |
| Registry metadata | `D0-durable-data-rules-json-metadata` |
| Registered patterns | `D0-durable-data-pattern-check-pattern-files` |
| Native fixtures | `D0-durable-data-native-fixtures` |
