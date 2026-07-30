import * as MapGenPublic from "@mapgen";
import * as MapGenContracts from "@mapgen/authoring/contracts.js";
import * as MapGenAuthoring from "@mapgen/authoring/index.js";
import * as MapGenCore from "@mapgen/core/index.js";
import * as MapGenEngine from "@mapgen/engine/index.js";
import * as MapGenTesting from "@mapgen/testing/index.js";
import * as MapGenTrace from "@mapgen/trace/index.js";

void MapGenCore.admitMapSetup;
void MapGenCore.MapSetupSchema;
void MapGenAuthoring.readArtifact;
void MapGenAuthoring.observeArtifact;
void MapGenTesting.createTraceSessionForTest;
void MapGenTrace.TraceEventSchema;
void MapGenPublic.VERSION;

type PublicStepFacetSinks = MapGenPublic.StepFacetSinks;
type PublicStepFacetFailure = MapGenPublic.StepFacetFailure;
type PublicArtifactObservation = MapGenAuthoring.ArtifactObservation<MapGenAuthoring.Artifact>;
type EngineCompletionId = MapGenEngine.CompletionId;

// @ts-expect-error Internal setup-authenticity assertions are not part of the public Core surface.
MapGenCore.assertMapSetupInternal;
// @ts-expect-error Raw artifact storage is private to MapGen Core.
MapGenCore.readMapContextArtifactInternal;
// @ts-expect-error Artifact-observation lifecycle admission is private to MapGen Core.
MapGenCore.assertTerminalMapContextObservationInternal;
// @ts-expect-error Artifact capabilities derive directly from declared authorities per occurrence.
MapGenAuthoring.implementArtifacts;
// @ts-expect-error Terminal artifact observation has no separate internal public capability.
MapGenAuthoring.observeArtifactInternal;
// @ts-expect-error Contract-only modules cannot acquire runtime observation authority.
MapGenContracts.readArtifact;
// @ts-expect-error Contract-only modules cannot acquire runtime observation authority.
MapGenContracts.observeArtifact;
// @ts-expect-error Artifact authors declare exact typed arrays in schemas instead of plumbing helper arrays.
MapGenAuthoring.appendArtifactTypedArrayIssues;
// @ts-expect-error Grid-coordinate semantic issues are emitted through the contextual issue sink.
MapGenAuthoring.appendArtifactGridCoordinateIssues;
// @ts-expect-error Cell count is supplied by Core through refinement facilities.
MapGenAuthoring.artifactCellCount;
// @ts-expect-error Contract-only authoring has no legacy artifact validation helpers.
MapGenContracts.appendArtifactTypedArrayIssues;
// @ts-expect-error Production trace-session construction is not a public trace capability.
MapGenTrace.createTraceSession;
// @ts-expect-error Plan compilation is private to the recipe execution boundary.
MapGenPublic.compileExecutionPlan;
// @ts-expect-error Mutable executor construction is private to recipe modules.
MapGenPublic.PipelineExecutor;
// @ts-expect-error Mutable step registration is private to recipe composition.
MapGenPublic.StepRegistry;
// @ts-expect-error Steps bind operation contracts directly; the retired op-reference wrapper is absent.
MapGenAuthoring.opRef;

// @ts-expect-error Production trace lifecycle types remain private to the executor.
type PublicTraceSession = MapGenTrace.TraceSession;
// @ts-expect-error The retired op-reference wrapper type is not part of public authorship.
type PublicOpRef = MapGenAuthoring.OpRef;
// @ts-expect-error Strategy definitions and descriptors supersede the unused declaration-only shape.
type PublicOpStrategy = MapGenAuthoring.OpStrategy;
// @ts-expect-error Artifact validation issue storage is internal to Core.
type PublicArtifactValidationIssue = MapGenAuthoring.ArtifactValidationIssue;
// @ts-expect-error Artifact refinement callbacks are inferred from defineArtifact.
type PublicArtifactRefinement = MapGenAuthoring.ArtifactRefinement;
// @ts-expect-error Artifact validator plumbing is retained only by canonical artifacts.
type PublicArtifactValidator = MapGenAuthoring.ArtifactValidator;
// @ts-expect-error Validation context is inferred from each artifact's mandatory validate method.
type PublicArtifactValidationContext = MapGenAuthoring.ArtifactValidationContext;

void (undefined as unknown as PublicTraceSession);
void (undefined as unknown as PublicOpRef);
void (undefined as unknown as PublicOpStrategy);
void (undefined as unknown as PublicArtifactValidationIssue);
void (undefined as unknown as PublicArtifactRefinement);
void (undefined as unknown as PublicArtifactValidator);
void (undefined as unknown as PublicArtifactValidationContext);
void (undefined as unknown as PublicStepFacetSinks);
void (undefined as unknown as PublicStepFacetFailure);
void (undefined as unknown as PublicArtifactObservation);
void (undefined as unknown as EngineCompletionId);
