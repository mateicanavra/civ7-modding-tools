import { NodeContext } from "@effect/platform-node";
import { Layer } from "effect";
import { HabitatConfigLive } from "../config/index.js";
import { BiomeProviderLive } from "../providers/biome/index.js";
import { CommandRunnerLive } from "../providers/command/index.js";
import { GitProviderLive } from "../providers/git/index.js";
import { GritProviderLive } from "../providers/grit/index.js";
import { HuskyProviderLive } from "../providers/husky/index.js";
import { NxProviderLive } from "../providers/nx/index.js";
import { HabitatReporterLive } from "../providers/reporter/index.js";
import {
  HabitatClockLive,
  HabitatFileSystemLive,
  HabitatWriteSetLive,
  ResourceScopeLive,
  WorkspaceLockLive,
} from "../resources/index.js";

export const HabitatRuntimeLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  HabitatClockLive,
  HabitatFileSystemLive,
  ResourceScopeLive,
  HabitatWriteSetLive,
  WorkspaceLockLive,
  CommandRunnerLive,
  GitProviderLive,
  GritProviderLive,
  BiomeProviderLive,
  NxProviderLive,
  HuskyProviderLive,
  HabitatReporterLive
);
