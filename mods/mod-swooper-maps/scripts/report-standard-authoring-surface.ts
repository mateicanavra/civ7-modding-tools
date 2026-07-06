import type { JsonValue } from "type-fest";
import { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";

interface SchemaLike {
  type?: string;
  const?: JsonValue;
  enum?: JsonValue[];
  anyOf?: SchemaLike[];
  oneOf?: SchemaLike[];
  allOf?: SchemaLike[];
  items?: SchemaLike | SchemaLike[];
  required?: string[];
  properties?: Record<string, SchemaLike>;
  default?: JsonValue;
  minimum?: number;
  maximum?: number;
  description?: string;
}

interface StageLike {
  id: string;
  public?: unknown;
  compile?: unknown;
  knobsSchema?: SchemaLike;
  surfaceSchema?: SchemaLike;
  authoring?: {
    config?: {
      layer?: string;
      focusPathsByStepId?: Record<string, string[]>;
    };
  };
  steps: StepLike[];
}

interface StepLike {
  contract: {
    id: string;
    phase?: string;
    requires?: readonly string[];
    provides?: readonly string[];
    artifacts?: {
      requires?: readonly ArtifactLike[];
      provides?: readonly ArtifactLike[];
    };
    schema?: SchemaLike;
    ops?: Record<string, OpLike>;
  };
}

interface ArtifactLike {
  id?: string;
  name?: string;
}

interface OpLike {
  strategies?: Record<string, unknown>;
  config?: SchemaLike;
  defaultConfig?: JsonValue;
}

interface FlattenedSchemaRow {
  path: string;
  type: string;
  required: boolean;
  default?: JsonValue;
  minimum?: number;
  maximum?: number;
  enum?: JsonValue[];
  description?: string;
  descriptionQuality: "missing" | "weak" | "ok";
  rawEnvelope: boolean;
  strategies?: string[];
}

interface AuthorFieldRow extends FlattenedSchemaRow {
  stageId: string;
  owner: string;
  layer: "knob" | "public" | "internal-as-public" | "internal-envelope";
  whyExposed: string;
  gameplayImpact: string;
  coupledFields: string[];
  compileTarget: string;
  selectedStrategyReachability: string[];
  testsAndDocs: string[];
  changesCompiledConfig: boolean;
  changesRuntimeOutput: "yes" | "likely" | "depends" | "no";
}

interface StageLedgerRow {
  stageId: string;
  layer: string;
  publicSchema: boolean;
  compileOwner: string;
  steps: string[];
  surfaceKeys: string[];
  fieldCount: number;
  rawEnvelopeRows: number;
  missingDescriptions: number;
  weakDescriptions: number;
  boundedNumericLeaves: number;
  numericLeaves: number;
}

const REPO_REFS = {
  standardRecipe: "mods/mod-swooper-maps/src/recipes/standard/recipe.ts",
  standardRuntime: "mods/mod-swooper-maps/src/recipes/standard/runtime.ts",
  generatedMapArtifacts: "mods/mod-swooper-maps/scripts/generate-map-artifacts.ts",
  generatedStudioTypes: "mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts",
  studioCatalog: "apps/mapgen-studio/src/recipes/catalog.ts",
  studioForm: "apps/mapgen-studio/src/App.tsx",
  studioRuntimeRecipe: "apps/mapgen-studio/src/browser-runner/recipeRuntime.ts",
  studioPipelineWorker: "apps/mapgen-studio/src/browser-runner/pipeline.worker.ts",
  sdkCreateMap: "packages/sdk/src/mapgen/createMap.ts",
  coreStage: "packages/mapgen-core/src/authoring/stage.ts",
  coreRecipe: "packages/mapgen-core/src/authoring/recipe.ts",
  coreRecipeCompile: "packages/mapgen-core/src/compiler/recipe-compile.ts",
  standardReference: "docs/system/libs/mapgen/reference/STANDARD-RECIPE.md",
  compilationReference: "docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md",
  schemaPolicy: "docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md",
};

const SHIPPED_CONFIG_REFS = [
  "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
  "mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.json",
  "mods/mod-swooper-maps/src/maps/configs/sundered-archipelago.config.json",
  "mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.json",
  "mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts",
  "mods/mod-swooper-maps/src/maps/presets/realism/old-erosion.config.ts",
  "mods/mod-swooper-maps/src/maps/presets/realism/young-tectonics.config.ts",
  "apps/mapgen-studio/src/ui/data/defaultConfig.ts",
];

const GENERATED_ARTIFACT_REFS = [
  "mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts",
  "mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts",
  "mods/mod-swooper-maps/src/maps/generated/shattered-ring.ts",
  "mods/mod-swooper-maps/src/maps/generated/sundered-archipelago.ts",
  "mods/mod-swooper-maps/src/maps/generated/swooper-desert-mountains.ts",
  "mods/mod-swooper-maps/dist/recipes/standard.schema.json",
  "mods/mod-swooper-maps/dist/recipes/standard.defaults.json",
  "mods/mod-swooper-maps/dist/recipes/standard.presets.json",
  "mods/mod-swooper-maps/dist/recipes/standard.d.ts",
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.js",
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.d.ts",
  "mods/mod-swooper-maps/dist/recipes/standard-map-config.schema.json",
  "mods/mod-swooper-maps/dist/recipes/standard-map-configs.js",
  "mods/mod-swooper-maps/dist/recipes/standard-map-configs.d.ts",
];

const TEST_REFS = [
  "mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts",
  "mods/mod-swooper-maps/test/config/presets-schema-valid.test.ts",
  "mods/mod-swooper-maps/test/config/studio-presets-schema-valid.test.ts",
  "mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts",
  "mods/mod-swooper-maps/test/standard-compile-errors.test.ts",
  "apps/mapgen-studio/test/config/defaultConfigSchema.test.ts",
  "packages/mapgen-core/test/authoring/authoring.test.ts",
  "packages/mapgen-core/test/compiler/recipe-compile.test.ts",
];

const STAGE_IMPACT: Record<string, string> = {
  foundation: "tectonic topology, plate history, crust, and projection seed artifacts",
  "morphology-coasts": "land/water coverage, coast shape, shelf, substrate, and base relief",
  "morphology-routing": "terrain routing fields consumed by erosion and drainage",
  "morphology-erosion": "geomorphic smoothing, incision, deposition, and relief age",
  "morphology-features": "islands, mountain ranges, volcanoes, rough lands, and landmass summaries",
  "hydrology-climate-baseline":
    "baseline temperature, winds, currents, humidity, and precipitation",
  "hydrology-hydrography": "river discharge/network projection and lake planning",
  "hydrology-climate-refine": "refined climate, cryosphere, land-water budget, and diagnostics",
  "ecology-pedology": "soil/resource basin classification inputs for ecology and placement",
  "ecology-biomes": "biome classification and vegetation/aridity bands",
  "ecology-features":
    "feature suitability scores and planned ice/reefs/wetlands/vegetation/effects",
  "map-morphology": "projection of morphology truth into Civ7 plot terrain/features",
  "map-hydrology": "projection/materialization of hydrology truth into Civ7 water artifacts",
  "map-elevation": "projection of elevation truth into Civ7 map height/elevation values",
  "map-rivers": "projection of river truth into Civ7 river edges/classes",
  "map-ecology": "projection of ecology truth into Civ7 biomes/features/effects",
  placement:
    "natural wonders, resources, starts, discoveries, placement surface, and final SDK map output",
};

function asStages(): StageLike[] {
  return STANDARD_STAGES as unknown as StageLike[];
}

function propertiesOf(schema?: SchemaLike): Record<string, SchemaLike> {
  return schema?.properties ?? {};
}

function requiredOf(schema?: SchemaLike): Set<string> {
  return new Set(Array.isArray(schema?.required) ? schema.required : []);
}

function typeOf(schema?: SchemaLike): string {
  if (!schema) return "unknown";
  if (schema.anyOf || schema.oneOf || schema.allOf) return "union";
  if (schema.type) return schema.type;
  if (schema.const !== undefined) return "const";
  return "unknown";
}

function schemaVariants(schema?: SchemaLike): SchemaLike[] | undefined {
  return schema?.anyOf ?? schema?.oneOf ?? schema?.allOf;
}

function enumValues(schema?: SchemaLike): Json[] | undefined {
  if (!schema) return undefined;
  if (schema.const !== undefined) return [schema.const];
  if (schema.enum) return schema.enum;
  const variants = schemaVariants(schema);
  if (variants) {
    const values = variants.flatMap((variant) => enumValues(variant) ?? []);
    return values.length > 0 ? values : undefined;
  }
  return undefined;
}

function descriptionQuality(schema?: SchemaLike): "missing" | "weak" | "ok" {
  const description = typeof schema?.description === "string" ? schema.description.trim() : "";
  if (!description) return "missing";
  if (
    /(impact|controls|sets|determines|affects|used|author|map|gameplay|density|coverage|shape|terrain|biome|river|lake|coast|plate|climate|feature|placement|derived|projection|coordinate)/i.test(
      description
    )
  ) {
    return "ok";
  }
  return "weak";
}

function isRawOpEnvelope(schema?: SchemaLike): boolean {
  if (!schema) return false;
  const variants = schemaVariants(schema) ?? [schema];
  return variants.some((variant) =>
    Boolean(variant.properties?.strategy && variant.properties?.config)
  );
}

function envelopeStrategies(schema?: SchemaLike): string[] {
  if (!schema) return [];
  return (schemaVariants(schema) ?? [schema])
    .map((variant) => variant.properties?.strategy?.const)
    .filter((value): value is string => typeof value === "string");
}

function variantPathSegment(variant: SchemaLike, index: number): string {
  const profile = variant.properties?.profile?.const;
  if (typeof profile === "string") return `profile:${profile}`;
  const strategy = variant.properties?.strategy?.const;
  if (typeof strategy === "string") return `strategy:${strategy}`;
  return `variant:${index + 1}`;
}

function shouldTraverseVariant(variant: SchemaLike): boolean {
  return variant.type === "object" || Boolean(variant.properties || variant.items);
}

function flattenSchema(
  schema: SchemaLike | undefined,
  path: string[],
  rows: FlattenedSchemaRow[],
  required: boolean,
  strategies?: string[]
): void {
  if (!schema) return;

  if (isRawOpEnvelope(schema)) {
    rows.push({
      path: path.join("."),
      type: "op-envelope",
      required,
      default: schema.default,
      description: schema.description,
      descriptionQuality: descriptionQuality(schema),
      rawEnvelope: true,
      strategies: envelopeStrategies(schema),
    });

    for (const variant of schemaVariants(schema) ?? [schema]) {
      const strategy = variant.properties?.strategy?.const;
      const configSchema = variant.properties?.config;
      const requiredConfigKeys = requiredOf(configSchema);
      for (const [key, childSchema] of Object.entries(propertiesOf(configSchema))) {
        if (typeof strategy === "string") {
          flattenSchema(
            childSchema,
            [...path, "strategies", strategy, "config", key],
            rows,
            requiredConfigKeys.has(key),
            [strategy]
          );
        } else {
          flattenSchema(childSchema, [...path, "config", key], rows, requiredConfigKeys.has(key));
        }
      }
    }
    return;
  }

  const variants = schemaVariants(schema);

  const properties = propertiesOf(schema);
  rows.push({
    path: path.join("."),
    type: typeOf(schema),
    required,
    default: schema.default,
    minimum: schema.minimum,
    maximum: schema.maximum,
    enum: enumValues(schema),
    description: schema.description,
    descriptionQuality: descriptionQuality(schema),
    rawEnvelope: false,
    strategies,
  });

  const traversableVariants = variants?.filter(shouldTraverseVariant);
  if (traversableVariants?.length) {
    traversableVariants.forEach((variant, index) => {
      flattenSchema(
        variant,
        [...path, "variants", variantPathSegment(variant, index)],
        rows,
        required,
        strategies
      );
    });
    return;
  }

  const requiredKeys = requiredOf(schema);
  for (const [key, childSchema] of Object.entries(properties)) {
    flattenSchema(childSchema, [...path, key], rows, requiredKeys.has(key), strategies);
  }

  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items.forEach((itemSchema, index) => {
        flattenSchema(itemSchema, [...path, "items", String(index)], rows, false, strategies);
      });
    } else {
      flattenSchema(schema.items, [...path, "items"], rows, false, strategies);
    }
  }
}

function variantForStrategy(
  schema: SchemaLike | undefined,
  strategy: string
): SchemaLike | undefined {
  return (schemaVariants(schema) ?? [schema]).find(
    (variant) => variant?.properties?.strategy?.const === strategy
  );
}

function schemaAtPath(
  root: SchemaLike | undefined,
  pathSegments: string[]
): SchemaLike | undefined {
  let schema = root;
  for (let index = 0; index < pathSegments.length; index += 1) {
    const part = pathSegments[index]!;
    if (part === "strategies") {
      const strategy = pathSegments[index + 1];
      schema = typeof strategy === "string" ? variantForStrategy(schema, strategy) : undefined;
      index += 1;
      continue;
    }
    if (part === "config") {
      const variant = schemaVariants(schema)?.[0] ?? schema;
      schema = variant?.properties?.config;
      continue;
    }
    if (part === "items") {
      const items = schema?.items;
      if (Array.isArray(items)) {
        const itemIndex = Number(pathSegments[index + 1]);
        schema = Number.isInteger(itemIndex) ? items[itemIndex] : items[0];
        if (Number.isInteger(itemIndex)) index += 1;
      } else {
        schema = items;
      }
      continue;
    }
    schema = schema?.properties?.[part];
  }
  return schema;
}

function directSiblingNames(stage: StageLike, path: string): string[] {
  const parts = path.split(".");
  const parentPath = parts.slice(1, -1);
  const schema = schemaAtPath(stage.surfaceSchema, parentPath);
  return Object.keys(schema?.properties ?? {}).filter((name) => name !== parts.at(-1));
}

function stageFieldLayer(
  stage: StageLike,
  path: string,
  rawEnvelope: boolean
): AuthorFieldRow["layer"] {
  const stageRelative = path.split(".").slice(1);
  if (rawEnvelope || stageRelative.includes("config")) return "internal-envelope";
  if (stageRelative[0] === "knobs") return "knob";
  if (stage.public) return "public";
  return "internal-as-public";
}

function ownerFor(stage: StageLike, path: string): string {
  const [surfaceKey, maybeOp] = path.split(".").slice(1);
  if (surfaceKey === "knobs") return `${stage.id}:stage-knobs`;
  const step = stage.steps.find((candidate) => candidate.contract.id === surfaceKey);
  if (!step) return `${stage.id}:stage-public`;
  if (maybeOp && step.contract.ops?.[maybeOp]) return `${stage.id}:${step.contract.id}:${maybeOp}`;
  return `${stage.id}:${step.contract.id}`;
}

function compileTargetFor(stage: StageLike, path: string, layer: AuthorFieldRow["layer"]): string {
  const surfaceKey = path.split(".")[1];
  if (layer === "knob") return `${stage.id}.toInternal knobs merge`;
  if (stage.public) return `${stage.id}.compile(...) -> internal stage config`;
  return `${stage.id}.${surfaceKey} identity -> internal step config`;
}

function whyExposedFor(stage: StageLike, layer: AuthorFieldRow["layer"]): string {
  if (layer === "knob") return "semantic stage-level recipe knob";
  if (stage.public && layer === "public") return "declared product-facing public stage schema";
  if (stage.public && layer === "internal-envelope")
    return "defect candidate: raw step/op envelope is reachable through a public stage schema";
  if (layer === "internal-envelope") return "transitional internal-as-public step/op parameter";
  return "transitional internal-as-public step config surface";
}

function runtimeImpactFor(
  row: FlattenedSchemaRow,
  layer: AuthorFieldRow["layer"]
): AuthorFieldRow["changesRuntimeOutput"] {
  if (row.type === "object") return "depends";
  if (layer === "knob" || layer === "public" || layer === "internal-envelope") return "likely";
  return "depends";
}

function strategyReachabilityFor(stage: StageLike, row: FlattenedSchemaRow): string[] {
  if (row.strategies?.length) return row.strategies;

  const [surfaceKey, opId] = row.path.split(".").slice(1);
  const step = stage.steps.find((candidate) => candidate.contract.id === surfaceKey);
  const strategies = opId ? Object.keys(step?.contract.ops?.[opId]?.strategies ?? {}) : [];
  return strategies;
}

function artifactRefs(artifacts: readonly ArtifactLike[] | undefined): string[] {
  return (artifacts ?? []).map((artifact) =>
    [artifact.name, artifact.id]
      .filter((part): part is string => typeof part === "string")
      .join(":")
  );
}

function buildFieldRows(): AuthorFieldRow[] {
  const rows: AuthorFieldRow[] = [];

  for (const stage of asStages()) {
    const flattened: FlattenedSchemaRow[] = [];
    flattenSchema(stage.surfaceSchema, [stage.id], flattened, false);

    for (const flattenedRow of flattened.filter((row) => row.path !== stage.id)) {
      const layer = stageFieldLayer(stage, flattenedRow.path, flattenedRow.rawEnvelope);
      rows.push({
        ...flattenedRow,
        stageId: stage.id,
        owner: ownerFor(stage, flattenedRow.path),
        layer,
        whyExposed: whyExposedFor(stage, layer),
        gameplayImpact: STAGE_IMPACT[stage.id] ?? "stage-specific map generation output",
        coupledFields: directSiblingNames(stage, flattenedRow.path),
        compileTarget: compileTargetFor(stage, flattenedRow.path, layer),
        selectedStrategyReachability: strategyReachabilityFor(stage, flattenedRow),
        testsAndDocs: [
          REPO_REFS.standardReference,
          REPO_REFS.compilationReference,
          REPO_REFS.schemaPolicy,
          ...TEST_REFS,
        ],
        changesCompiledConfig: flattenedRow.type !== "object",
        changesRuntimeOutput: runtimeImpactFor(flattenedRow, layer),
      });
    }
  }

  return rows;
}

function buildStageRows(fieldRows: AuthorFieldRow[]): StageLedgerRow[] {
  return asStages().map((stage) => {
    const stageFieldRows = fieldRows.filter((row) => row.stageId === stage.id);
    const numericLeaves = stageFieldRows.filter(
      (row) => row.type === "integer" || row.type === "number"
    );
    return {
      stageId: stage.id,
      layer: stage.authoring?.config?.layer ?? "unknown",
      publicSchema: Boolean(stage.public),
      compileOwner: stage.public ? "stage public compile" : "identity internal step config",
      steps: stage.steps.map((step) => step.contract.id),
      surfaceKeys: Object.keys(stage.surfaceSchema?.properties ?? {}),
      fieldCount: stageFieldRows.length,
      rawEnvelopeRows: stageFieldRows.filter(
        (row) => row.rawEnvelope || row.path.includes(".config.")
      ).length,
      missingDescriptions: stageFieldRows.filter((row) => row.descriptionQuality === "missing")
        .length,
      weakDescriptions: stageFieldRows.filter((row) => row.descriptionQuality === "weak").length,
      boundedNumericLeaves: numericLeaves.filter(
        (row) => row.minimum !== undefined || row.maximum !== undefined
      ).length,
      numericLeaves: numericLeaves.length,
    };
  });
}

function buildStepRows(): Array<Record<string, Json>> {
  return asStages().flatMap((stage) =>
    stage.steps.map((step) => {
      const schemaRows: FlattenedSchemaRow[] = [];
      flattenSchema(step.contract.schema, [stage.id, step.contract.id], schemaRows, false);
      return {
        kind: "step",
        stageId: stage.id,
        stepId: step.contract.id,
        phase: step.contract.phase ?? "",
        requires: [...(step.contract.requires ?? [])],
        provides: [...(step.contract.provides ?? [])],
        artifactRequires: artifactRefs(step.contract.artifacts?.requires),
        artifactProvides: artifactRefs(step.contract.artifacts?.provides),
        schemaOwner: `mods/mod-swooper-maps/src/recipes/standard/stages/${stage.id}/`,
        schemaFieldCount: schemaRows.length,
        schemaRawEnvelopeRows: schemaRows.filter(
          (row) => row.rawEnvelope || row.path.includes(".config.")
        ).length,
        schemaRows: schemaRows as unknown as Json,
        opEnvelopes: Object.entries(step.contract.ops ?? {}).map(([opId, op]) => ({
          opId,
          strategies: Object.keys(op.strategies ?? {}),
          defaultConfig: op.defaultConfig as Json,
        })),
      };
    })
  );
}

function buildFocusRows(): Array<Record<string, Json>> {
  return asStages().flatMap((stage) =>
    stage.steps.map((step) => ({
      kind: "studio-focus-path",
      stageId: stage.id,
      stepId: step.contract.id,
      configFocusPathWithinStage: [
        ...(stage.authoring?.config?.focusPathsByStepId?.[step.contract.id] ?? []),
      ],
    }))
  );
}

function buildConsumerRows(): Array<Record<string, Json>> {
  return [
    {
      kind: "generated-schema-default-artifacts",
      owner: "mod-swooper-maps scripts",
      refs: [
        REPO_REFS.generatedMapArtifacts,
        REPO_REFS.generatedStudioTypes,
        ...GENERATED_ARTIFACT_REFS,
      ],
      note: "Generated outputs must be regenerated by scripts; do not hand edit.",
    },
    {
      kind: "shipped-map-and-preset-usage",
      owner: "mod-swooper-maps configs/presets and Studio default config",
      refs: SHIPPED_CONFIG_REFS,
      note: "Each cleanup slice must validate first-party configs and migrate removed or renamed fields.",
    },
    {
      kind: "studio-focus-path-consumer",
      owner: "MapGen Studio",
      refs: [REPO_REFS.generatedStudioTypes, REPO_REFS.studioCatalog, REPO_REFS.studioForm],
      note: "Studio renders recipe artifacts from generated schema/default/uiMeta and configFocusPathWithinStage.",
    },
    {
      kind: "runtime-read-sites",
      owner: "MapGen compiler/runtime and SDK entrypoints",
      refs: [
        REPO_REFS.coreStage,
        REPO_REFS.coreRecipe,
        REPO_REFS.coreRecipeCompile,
        REPO_REFS.standardRuntime,
        REPO_REFS.studioRuntimeRecipe,
        REPO_REFS.studioPipelineWorker,
        REPO_REFS.sdkCreateMap,
      ],
      note: "Authoring config is normalized and compiled before internal step/op configs reach runtime.",
    },
  ];
}

function buildLedger() {
  const fieldRows = buildFieldRows();
  return {
    ledgerVersion: 1,
    source: REPO_REFS.standardRecipe,
    stageRows: buildStageRows(fieldRows),
    fieldRows,
    stepRows: buildStepRows(),
    focusRows: buildFocusRows(),
    consumerRows: buildConsumerRows(),
  };
}

function markdownTable(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => cell.replaceAll("\n", "<br>")).join(" | ")} |`),
  ].join("\n");
}

function renderSummaryMarkdown(ledger: ReturnType<typeof buildLedger>): string {
  const stageTable = markdownTable(
    [
      "stage",
      "layer",
      "public",
      "steps",
      "surface keys",
      "fields",
      "raw envelope rows",
      "desc missing/weak",
      "numeric bounded",
    ],
    ledger.stageRows.map((stage) => [
      stage.stageId,
      stage.layer,
      String(stage.publicSchema),
      String(stage.steps.length),
      stage.surfaceKeys.join(", "),
      String(stage.fieldCount),
      String(stage.rawEnvelopeRows),
      `${stage.missingDescriptions}/${stage.weakDescriptions}`,
      `${stage.boundedNumericLeaves}/${stage.numericLeaves}`,
    ])
  );

  const stepTable = markdownTable(
    [
      "stage",
      "steps",
      "step schema rows",
      "raw envelope rows",
      "op envelopes / strategies",
      "compile owner",
    ],
    asStages().map((stage) => [
      stage.id,
      stage.steps.map((step) => step.contract.id).join(", "),
      ledger.stepRows
        .filter((row) => row.stageId === stage.id)
        .map((row) => `${row.stepId}: ${row.schemaFieldCount}`)
        .join("<br>"),
      ledger.stepRows
        .filter((row) => row.stageId === stage.id)
        .map((row) => `${row.stepId}: ${row.schemaRawEnvelopeRows}`)
        .join("<br>"),
      stage.steps
        .map((step) => {
          const ops = Object.entries(step.contract.ops ?? {}).map(
            ([opId, op]) => `${opId}(${Object.keys(op.strategies ?? {}).join("|") || "none"})`
          );
          return `${step.contract.id}: ${ops.join(", ") || "none"}`;
        })
        .join("<br>"),
      stage.public ? "stage public compile" : "identity internal step config",
    ])
  );

  return [
    "# Standard Recipe Authoring Surface Ledger",
    "",
    `Source: \`${ledger.source}\``,
    "",
    "## Stage Surface Summary",
    "",
    stageTable,
    "",
    "## Step, Op, And Strategy Summary",
    "",
    stepTable,
    "",
    "## Studio Focus Path Summary",
    "",
    markdownTable(
      ["stage", "step", "config focus path within stage"],
      ledger.focusRows.map((row) => [
        String(row.stageId),
        String(row.stepId),
        (row.configFocusPathWithinStage as string[]).join("."),
      ])
    ),
    "",
    "## Consumer And Artifact Summary",
    "",
    markdownTable(
      ["kind", "owner", "refs", "note"],
      ledger.consumerRows.map((row) => [
        String(row.kind),
        String(row.owner),
        (row.refs as string[]).map((ref) => `\`${ref}\``).join("<br>"),
        String(row.note),
      ])
    ),
  ].join("\n");
}

function renderFullMarkdown(ledger: ReturnType<typeof buildLedger>): string {
  const fieldRows = markdownTable(
    [
      "path",
      "layer",
      "owner",
      "type",
      "default",
      "range/enum",
      "desc",
      "why exposed",
      "impact",
      "compile target",
      "strategies",
      "runtime output",
    ],
    ledger.fieldRows.map((row) => [
      `\`${row.path}\``,
      row.layer,
      row.owner,
      row.type,
      row.default === undefined ? "" : JSON.stringify(row.default),
      row.enum
        ? row.enum.map(String).join(", ")
        : [
            row.minimum === undefined ? "" : `min ${row.minimum}`,
            row.maximum === undefined ? "" : `max ${row.maximum}`,
          ]
            .filter(Boolean)
            .join(", "),
      row.descriptionQuality,
      row.whyExposed,
      row.gameplayImpact,
      row.compileTarget,
      row.selectedStrategyReachability.join(", "),
      row.changesRuntimeOutput,
    ])
  );

  return `${renderSummaryMarkdown(ledger)}\n\n## Author-Facing Field Rows\n\n${fieldRows}\n`;
}

function main(): void {
  const formatFlag = process.argv.find((arg) => arg.startsWith("--format="));
  const format = formatFlag?.split("=")[1] ?? "summary";
  const ledger = buildLedger();

  if (format === "json") {
    console.log(JSON.stringify(ledger, null, 2));
    return;
  }
  if (format === "markdown") {
    console.log(renderFullMarkdown(ledger));
    return;
  }
  if (format === "summary") {
    console.log(renderSummaryMarkdown(ledger));
    return;
  }

  throw new Error(`Unknown --format=${format}; expected summary, markdown, or json`);
}

main();
