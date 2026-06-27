# docs-reference Round 2 Slice

Rules: `validate_mapgen_docs_anchors_and_references`
Rows: 5

Owner counts: package-local-validator=3, grit-check=2
Status counts: ready-to-retain-or-move=3, ready-for-implementation=2

## Row Index

- mapgen-doc-anchor-target-existence: package-local-validator / ready-to-retain-or-move
- mapgen-doc-ground-truth-anchors-heading: grit-check / ready-for-implementation
- mapgen-doc-local-term-definition-policy: package-local-validator / ready-to-retain-or-move
- mapgen-doc-mini-toc-shape: grit-check / ready-for-implementation
- mapgen-doc-workspace-alias-warning-policy: package-local-validator / ready-to-retain-or-move

## Worker Notes

- Completed. The two Markdown/source-shape rows moved to Grit packets:
  `require_mapgen_doc_ground_truth_anchors_heading` and
  `require_mapgen_doc_mini_toc_shape`.
- Retained the anchor target existence, local term definition policy, and
  workspace alias warning policy branches as docs-validator residuals in the
  command script.
- Focused Grit proofs passed. The residual command rule remains red on known
  missing anchor/reference findings.
