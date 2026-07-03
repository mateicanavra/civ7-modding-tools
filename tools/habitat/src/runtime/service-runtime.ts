import { HabitatRuntimeLive } from "@habitat/cli/runtime/layers";
import { HabitatServiceRuntime } from "@habitat/cli/service/base";
import { Layer, ManagedRuntime } from "effect";

export const HabitatServiceRuntimeLive = Layer.mergeAll(
  HabitatRuntimeLive,
  Layer.succeed(HabitatServiceRuntime, { service: "habitat" as const })
);

export const habitatServiceManagedRuntime = ManagedRuntime.make(HabitatServiceRuntimeLive);
