# Map Product Metrics

`@swooper/mapgen-metrics` is the environment-neutral engine for describing a
measured map product and evaluating named product targets against it.

The package owns reusable numeric and component measurements plus closed
`pass | fail` target evaluation. It does not define product provenance, cohort
membership, run recipes, read artifacts, define Swooper thresholds, format or
persist reports, or perform test assertions. A recipe adapter captures and
measures one product; any number of targets may evaluate it without rerunning.

Concrete Swooper measurements and targets live beside the Standard recipe at
`mods/mod-swooper-maps/src/recipes/standard/metrics`. Tests prove those targets
and reporting commands serialize their results.
