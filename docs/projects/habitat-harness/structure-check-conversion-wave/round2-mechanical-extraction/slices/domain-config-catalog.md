# domain-config-catalog Round 2 Slice

Rules: `require_owned_domain_config_catalog_surfaces`
Rows: 4

Owner counts: grit-check=1, package-local-validator=2, existing-rule=1
Status counts: ready-for-implementation=2, ready-to-retain-or-move=2

## Row Index

- milestone-tag-catalog-name-ban: grit-check / ready-for-implementation
- morphology-config-facade-exact-exports: package-local-validator / ready-to-retain-or-move
- op-schema-config-facade-imports: existing-rule / ready-for-implementation
- owner-tag-catalog-token-presence: package-local-validator / ready-to-retain-or-move

## Worker Notes

- Completed. The milestone catalog name ban moved to the shared Grit packet
  `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names`.
- The config facade import row was delegated to the existing
  `prohibit_root_config_facade_imports_in_domain_ops` owner.
- The morphology config facade exact-export and owner tag catalog token rows
  remain package-local validator residuals in the command script.
