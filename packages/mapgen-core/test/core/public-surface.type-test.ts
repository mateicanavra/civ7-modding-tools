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
MapGenAuthoring.implementArtifactModules;
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

// @ts-expect-error Production trace lifecycle types remain private to the executor.
type PublicTraceSession = MapGenTrace.TraceSession;

void (undefined as unknown as PublicTraceSession);
void (undefined as unknown as PublicStepFacetSinks);
void (undefined as unknown as PublicStepFacetFailure);
