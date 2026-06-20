import { NodeContext } from "@effect/platform-node";
import { Layer } from "effect";
import { GritProviderLive } from "../adapters/grit/provider/index.js";
import { HabitatConfigLive } from "../config/index.js";
import { BaselineAuthorityLive } from "../domains/baseline-authority/service.js";
import { StructuralCheckLive } from "../domains/structural-check/service.js";
import { BiomeProviderLive } from "../providers/biome/index.js";
import { CommandRunnerLive } from "../providers/command/index.js";
import { GitProviderLive } from "../providers/git/index.js";
import { HuskyProviderLive } from "../providers/husky/index.js";
import { NxProviderLive } from "../providers/nx/index.js";
import { HabitatReporterLive } from "../providers/reporter/index.js";

export const HabitatRuntimeLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  CommandRunnerLive,
  GitProviderLive,
  GritProviderLive,
  BiomeProviderLive,
  NxProviderLive,
  HuskyProviderLive,
  HabitatReporterLive,
  BaselineAuthorityLive,
  StructuralCheckLive
);
