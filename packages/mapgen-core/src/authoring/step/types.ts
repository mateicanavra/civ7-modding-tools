import type { EngineAdapter } from "@civ7/adapter";
import type { MapContext } from "@mapgen/core/map-context.js";
import type { StepFacets } from "@mapgen/engine/step-facets.js";
import type { NormalizeContext } from "@mapgen/engine/types.js";
import type { Static } from "typebox";

import type { Artifact } from "../artifact/contract.js";
import type { ProvidedArtifactRuntime, RequiredArtifactRuntime } from "../artifact/runtime.js";
import type {
  StepArtifactsDecl,
  StepArtifactsDeclAny,
  StepContract,
  StepEngineDecl,
} from "./contract.js";
import type { AuthoredEngineAdapterKey } from "./engine-authority.js";

type ArtifactsByName<T extends readonly Artifact[]> = {
  [Name in T[number]["name"] & string]: Extract<T[number], { name: Name }>;
};

type ArtifactNameOf<T extends readonly Artifact[]> = Extract<keyof ArtifactsByName<T>, string>;

type ArtifactByName<T extends readonly Artifact[], K extends string> = Extract<
  T[number],
  { name: K }
>;

type ArtifactListOrEmpty<T> = T extends readonly Artifact[] ? T : readonly [];

type StepArtifactsSurface<TArtifacts extends StepArtifactsDeclAny | undefined> =
  TArtifacts extends StepArtifactsDecl<infer Requires, infer Provides>
    ? {
        readonly [K in ArtifactNameOf<ArtifactListOrEmpty<Requires>>]: RequiredArtifactRuntime<
          ArtifactByName<ArtifactListOrEmpty<Requires>, K>
        >;
      } & {
        readonly [K in Provides extends readonly Artifact[]
          ? ArtifactNameOf<Provides>
          : never]: ProvidedArtifactRuntime<
          ArtifactByName<Provides extends readonly Artifact[] ? Provides : readonly [], K>
        >;
      }
    : {};

type ContextFirstEngineMethod<K extends AuthoredEngineAdapterKey> = EngineAdapter[K] extends (
  ...args: infer Args
) => infer Result
  ? (context: MapContext, ...args: Args) => Result
  : never;

type StepEngineSurface<Engine extends StepEngineDecl | undefined> = Engine extends StepEngineDecl
  ? Readonly<{
      [K in Engine[number]]: ContextFirstEngineMethod<K>;
    }>
  : Readonly<Record<never, never>>;

/** Exact artifact and engine capabilities admitted for one authored step occurrence. */
export type StepDeps<
  TArtifacts extends StepArtifactsDeclAny | undefined,
  TEngine extends StepEngineDecl | undefined = undefined,
> = Readonly<{
  /**
   * Canonical dependency surface for artifacts.
   *
   * Legacy mutable buffer aliases retire into explicit artifact vintages rather
   * than becoming a second dependency authority.
   */
  artifacts: Readonly<StepArtifactsSurface<TArtifacts>>;
  /** Exact occurrence-scoped engine methods declared by the step contract. */
  engine: StepEngineSurface<TEngine>;
}>;

type StepContractAny = StepContract<any, any, any, any, any>;

type StepConfigOfContract<C extends StepContractAny> = Static<C["schema"]>;

type StepArtifactsDeclOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, infer A, any> ? A : undefined;

type StepEngineDeclOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, any, infer Engine> ? Engine : undefined;

/** Authored step behavior bound to one contract and the canonical map execution context. */
export type StepModule<C extends StepContractAny = StepContractAny, TResult = unknown> = Readonly<{
  contract: C;
  normalize?: (config: unknown, ctx: NormalizeContext) => unknown;
  run: (
    context: MapContext,
    config: unknown,
    ops: unknown,
    deps: StepDeps<StepArtifactsDeclOfContract<C>, StepEngineDeclOfContract<C>>
  ) => TResult | Promise<TResult>;
}> &
  StepFacets<StepConfigOfContract<C>, TResult>;

/** Canonical authored step module accepted by stage composition. */
export type Step<C extends StepContractAny = StepContractAny, TResult = unknown> = StepModule<
  C,
  TResult
>;
