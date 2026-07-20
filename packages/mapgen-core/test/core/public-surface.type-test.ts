import * as MapGenCore from "@mapgen/core/index.js";

void MapGenCore.admitMapSetup;
void MapGenCore.MapSetupSchema;

// @ts-expect-error Internal setup-authenticity assertions are not part of the public Core surface.
MapGenCore.assertMapSetupInternal;
