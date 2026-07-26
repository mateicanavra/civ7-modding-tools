import * as MapGenPublic from "@mapgen";
import * as MapGenContracts from "@mapgen/authoring/contracts.js";
import * as MapGenAuthoring from "@mapgen/authoring/index.js";
import * as MapGenCore from "@mapgen/core/index.js";
import * as MapGenEngine from "@mapgen/engine/index.js";
import * as MapGenTesting from "@mapgen/testing/index.js";
import * as MapGenTrace from "@mapgen/trace/index.js";

void MapGenCore.admitMapSetup;
void MapGenCore.MapSetupSchema;
void MapGenAuthoring.readValidatedArtifact;
void MapGenAuthoring.observeValidatedArtifact;
void MapGenEngine.TagRegistry;
void MapGenTesting.createTraceSessionForTest;
void MapGenTrace.TraceEventSchema;
void MapGenPublic.VERSION;

type PublicStepFacetSinks = MapGenPublic.StepFacetSinks;
type PublicStepFacetFailure = MapGenPublic.StepFacetFailure;

// @ts-expect-error Internal setup-authenticity assertions are not part of the public Core surface.
MapGenCore.assertMapSetupInternal;
// @ts-expect-error Raw artifact storage is private to MapGen Core.
MapGenCore.readMapContextArtifactInternal;
// @ts-expect-error Artifact-observation lifecycle admission is private to MapGen Core.
MapGenCore.assertTerminalMapContextObservationInternal;
// @ts-expect-error Runtime artifact construction is private to recipe composition.
MapGenAuthoring.implementArtifacts;
// @ts-expect-error In-run artifact observation is private to executor dependency predicates.
MapGenAuthoring.observeValidatedArtifactInternal;
// @ts-expect-error Contract-only modules cannot acquire runtime observation authority.
MapGenContracts.readValidatedArtifact;
// @ts-expect-error Contract-only modules cannot acquire runtime observation authority.
MapGenContracts.observeValidatedArtifact;
// @ts-expect-error Tag satisfaction is executor-owned rather than a public engine command.
MapGenEngine.isDependencyTagSatisfied;
// @ts-expect-error Satisfaction-state construction is executor-owned.
MapGenEngine.computeInitialSatisfiedTags;
// @ts-expect-error Production trace-session construction is not a public trace capability.
MapGenTrace.createTraceSession;
// @ts-expect-error Plan compilation is private to the recipe execution boundary.
MapGenPublic.compileExecutionPlan;
// @ts-expect-error Mutable executor construction is private to recipe modules.
MapGenPublic.PipelineExecutor;
// @ts-expect-error Mutable step registration is private to recipe composition.
MapGenPublic.StepRegistry;
// @ts-expect-error Mutable dependency-tag registration is private to recipe composition.
MapGenPublic.TagRegistry;
// @ts-expect-error Steps bind operation contracts directly; the retired op-reference wrapper is absent.
MapGenAuthoring.opRef;

// @ts-expect-error Production trace lifecycle types remain private to the executor.
type PublicTraceSession = MapGenTrace.TraceSession;
// @ts-expect-error The retired op-reference wrapper type is not part of public authorship.
type PublicOpRef = MapGenAuthoring.OpRef;
// @ts-expect-error Strategy definitions and descriptors supersede the unused declaration-only shape.
type PublicOpStrategy = MapGenAuthoring.OpStrategy;

void (undefined as unknown as PublicTraceSession);
void (undefined as unknown as PublicOpRef);
void (undefined as unknown as PublicOpStrategy);
void (undefined as unknown as PublicStepFacetSinks);
void (undefined as unknown as PublicStepFacetFailure);
