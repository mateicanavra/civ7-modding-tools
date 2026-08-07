import type { catalog } from "../../src/catalog.js";
import type { provenance } from "../../src/provenance.js";

type Catalog = typeof catalog;
type Provenance = typeof provenance;
const admitted: [Catalog["schemaVersion"], Provenance["schemaVersion"]] = [1, 1];
void admitted;
