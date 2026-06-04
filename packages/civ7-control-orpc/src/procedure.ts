import { Layer, ManagedRuntime } from "effect";
import { implementEffect, type EffectImplementer } from "effect-orpc";

import { Civ7ControlOrpcContract } from "./contract";
import type { Civ7ControlOrpcContext } from "./context";

export const civ7ControlOrpcEffectRuntime = ManagedRuntime.make(Layer.empty);

export type Civ7ControlOrpcImplementer = EffectImplementer<
  typeof Civ7ControlOrpcContract,
  Civ7ControlOrpcContext & Record<never, never>,
  Civ7ControlOrpcContext,
  never,
  never
>;

export const civ7ControlOrpcImplementer: Civ7ControlOrpcImplementer =
  implementEffect(
    Civ7ControlOrpcContract,
    civ7ControlOrpcEffectRuntime,
  ).$context<Civ7ControlOrpcContext>();
