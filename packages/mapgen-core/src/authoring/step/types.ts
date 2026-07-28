import type { EngineAdapter } from "@civ7/adapter";
import type { MapContext } from "@mapgen/core/map-context.js";
import type { StepFacets } from "@mapgen/engine/step-facets.js";
import type { NormalizeContext } from "@mapgen/engine/types.js";
import type { Static } from "typebox";

import type { Artifact, ArtifactReadValueOf, ArtifactValueOf } from "../artifact/contract.js";
import type { InitialSetupDefinition, InitialSetupValueOf } from "../initial-setup/definition.js";
import type { StepContract, StepDependencyList, StepEngineDecl } from "./contract.js";
import type { AuthoredEngineAdapterKey } from "./engine-authority.js";

type ArtifactDependencyOf<T extends StepDependencyList> = Extract<T[number], Artifact>;

type ArtifactNameOf<T extends StepDependencyList> = ArtifactDependencyOf<T>["name"] & string;

type ArtifactByName<T extends StepDependencyList, K extends string> = Extract<
  ArtifactDependencyOf<T>,
  { name: K }
>;

/** Reads one declared artifact through the currently active step occurrence. */
export type ArtifactReader<A extends Artifact> = Readonly<{
  read: () => ArtifactReadValueOf<A>;
}>;

/** Publishes one declared artifact through the currently active step occurrence. */
export type ArtifactPublisher<A extends Artifact> = Readonly<{
  publish: (value: ArtifactValueOf<A>) => ArtifactReadValueOf<A>;
}>;

type StepArtifactsSurface<
  Requires extends StepDependencyList,
  Provides extends StepDependencyList,
> = {
  readonly [K in ArtifactNameOf<Requires>]: ArtifactReader<ArtifactByName<Requires, K>>;
} & {
  readonly [K in ArtifactNameOf<Provides>]: ArtifactPublisher<ArtifactByName<Provides, K>>;
};

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

type StepInitialSetupSurface<InitialSetup extends InitialSetupDefinition | undefined> =
  InitialSetup extends InitialSetupDefinition
    ? Readonly<{ initialSetup: InitialSetupValueOf<InitialSetup> }>
    : Readonly<Record<never, never>>;

/** Invocation context visible to one step, including only its declared initial-setup authority. */
export type StepContext<InitialSetup extends InitialSetupDefinition | undefined = undefined> =
  MapContext & StepInitialSetupSurface<InitialSetup>;

/** Exact artifact and engine capabilities admitted for one step occurrence. */
export type StepDeps<
  TRequires extends StepDependencyList,
  TProvides extends StepDependencyList,
  TEngine extends StepEngineDecl | undefined = undefined,
> = Readonly<{
  /**
   * Canonical dependency surface for artifacts.
   *
   * Legacy mutable buffer aliases retire into explicit artifact vintages rather
   * than becoming a second dependency authority.
   */
  artifacts: Readonly<StepArtifactsSurface<TRequires, TProvides>>;
  /** Exact occurrence-scoped engine methods declared by the step contract. */
  engine: StepEngineSurface<TEngine>;
}>;

type StepContractAny = StepContract<any, any, any, any, any, any, any>;

type StepConfigOfContract<C extends StepContractAny> = Static<C["schema"]>;

type StepRequiresOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, infer Requires, any, any, any> ? Requires : readonly [];

type StepProvidesOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, any, infer Provides, any, any> ? Provides : readonly [];

type StepEngineDeclOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, any, any, infer Engine, any> ? Engine : undefined;

type StepInitialSetupOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, any, any, any, infer InitialSetup>
    ? InitialSetup
    : undefined;

/** Authored step behavior bound to one contract and the canonical map execution context. */
export type StepModule<C extends StepContractAny = StepContractAny, TResult = unknown> = Readonly<{
  contract: C;
  normalize?: (config: unknown, ctx: NormalizeContext) => unknown;
  run: (
    context: StepContext<StepInitialSetupOfContract<C>>,
    config: unknown,
    ops: unknown,
    deps: StepDeps<
      StepRequiresOfContract<C>,
      StepProvidesOfContract<C>,
      StepEngineDeclOfContract<C>
    >
  ) => TResult | Promise<TResult>;
}> &
  StepFacets<StepConfigOfContract<C>, TResult>;

/** Canonical authored step module accepted by stage composition. */
export type Step<C extends StepContractAny = StepContractAny, TResult = unknown> = StepModule<
  C,
  TResult
>;
