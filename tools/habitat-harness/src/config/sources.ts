import { type HabitatConfigValue, makeHabitatConfig } from "./habitat-config.js";

export interface HabitatConfigSource {
  readonly load: () => HabitatConfigValue;
}

export const defaultHabitatConfigSource: HabitatConfigSource = {
  load: () => makeHabitatConfig(),
};
