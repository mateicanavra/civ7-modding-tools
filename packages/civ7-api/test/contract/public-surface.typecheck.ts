import { catalog, provenance } from "../../src/index.js";

const catalogSchemaVersion: number = catalog.schemaVersion;
const provenanceSchemaVersion: number = provenance.schemaVersion;
void [catalogSchemaVersion, provenanceSchemaVersion];
