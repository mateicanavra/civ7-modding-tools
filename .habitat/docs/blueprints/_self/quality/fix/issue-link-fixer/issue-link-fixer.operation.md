# Issue Link Fixer Operation

Operation: `fix`

This subject is a Habitat-owned docs operation, not a registered read-only
check. The current Toolkit registry has no typed operation manifest schema for
fix operations, so this Markdown file is the provisional identity record.

The operation performs controlled docs mutations under a selected
`docs/projects/<project>` tree:

- rewrite issue ID links to canonical relative issue-file paths;
- normalize `blocked` and `blocked_by` dependency fields from the selected
  source of truth;
- dry-run by default, mutating only when invoked with `--write`.

Missing integration: replace this provisional Markdown identity with the final
typed Habitat operation manifest when the Toolkit admits `fix` operations as a
first-class manifest kind.
