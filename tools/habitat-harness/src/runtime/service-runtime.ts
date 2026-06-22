import { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import { HabitatServiceRuntime } from "@internal/habitat-harness/service/base";
import { Layer, ManagedRuntime } from "effect";

export const HabitatServiceRuntimeLive = Layer.mergeAll(
  HabitatRuntimeLive,
  Layer.succeed(HabitatServiceRuntime, { service: "habitat" as const })
);

export const habitatServiceManagedRuntime = ManagedRuntime.make(HabitatServiceRuntimeLive);
