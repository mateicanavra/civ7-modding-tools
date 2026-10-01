import type { catalog } from "../../src/catalog.js";
import type { provenance } from "../../src/provenance.js";

type Catalog = typeof catalog;
type Provenance = typeof provenance;
type SchemaVersions = [Catalog["schemaVersion"], Provenance["schemaVersion"]];
declare const schemaVersions: SchemaVersions;
void schemaVersions;
