## 1. Source Data

- [ ] 1.1 Add tracked `CatalogSourceIndex` source data.
- [ ] 1.2 Define catalog source entry schema and parser.
- [ ] 1.3 Add validator for unique ids, unique paths, and resolvable configs.
- [ ] 1.4 Register the temporary consistency Grit pattern that asserts the
      index matches the current catalog generation source set until cutover.

## 2. Consumers

- [ ] 2.1 Add a Swooper-owned index reader.
- [ ] 2.2 Prepare Studio/server consumers to read catalog source ids from the
      index in later packets.

## 3. Verification

- [ ] 3.1 Add behavior tests for parser and validator behavior.
- [ ] 3.2 Register SA-04 `structure-swooper-catalog-source-index`.
- [ ] 3.3 Register temporary
      `grit-swooper-catalog-index-consistency-temporary` as
      `registered-advisory` over `mods/mod-swooper-maps/src/maps` and
      `mods/mod-swooper-maps/scripts`; assert catalog source ids and config
      paths in `CatalogSourceIndex` match the current catalog generation source
      set; use committed empty baseline, no hook scope, and removal condition
      `swooper-catalog-index-cutover` SA-09 registration.
