import React, { useMemo } from "react";
import { AlertTriangle, Boxes, ChevronDown, GitBranch, Loader2 } from "lucide-react";

import type { RecipeDagResult } from "./client";

type RecipeDagLoadStatus = "idle" | "loading" | "ready" | "error";

export interface RecipeDagViewProps {
  recipeId: string;
  dag: RecipeDagResult | null;
  status: RecipeDagLoadStatus;
  error: string | null;
  lightMode: boolean;
  expandedStageIds: ReadonlySet<string>;
  selectedStageId: string | null;
  onToggleStage: (stageId: string) => void;
  onSelectStage: (stageId: string) => void;
  topInset: number;
}

type StagePosition = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

type StageEdgeGroup = Readonly<{
  id: string;
  fromStageId: string;
  toStageId: string;
  artifacts: readonly string[];
}>;

const STAGE_WIDTH = 232;
const STAGE_HEIGHT = 116;
const STAGE_GAP_X = 86;
const PHASE_GAP_Y = 218;
const GRAPH_PAD_X = 72;
const GRAPH_PAD_TOP = 98;
const GRAPH_PAD_BOTTOM = 112;

export function RecipeDagView(props: RecipeDagViewProps) {
  const {
    recipeId,
    dag,
    status,
    error,
    lightMode,
    expandedStageIds,
    selectedStageId,
    onToggleStage,
    onSelectStage,
    topInset,
  } = props;
  const palette = useMemo(() => createPalette(lightMode), [lightMode]);
  const layout = useMemo(() => (dag ? buildLayout(dag) : null), [dag]);

  return (
    <section
      className={`absolute inset-0 overflow-hidden ${palette.surface}`}
      style={{ paddingTop: topInset }}
      aria-label="Recipe dependency graph"
    >
      <div className={`absolute inset-0 pointer-events-none ${palette.grid}`} aria-hidden="true" />
      <div className="relative flex h-full min-h-0 flex-col">
        <div className={`mx-4 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 backdrop-blur-sm ${palette.panel}`}>
          <div className="min-w-0">
            <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase ${palette.kicker}`}>
              <GitBranch className="h-4 w-4" />
              Recipe DAG
            </div>
            <h2 className={`mt-1 truncate text-[18px] font-semibold ${palette.heading}`}>
              {dag?.title ?? recipeId}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Metric label="Phases" value={dag?.phases.length ?? 0} lightMode={lightMode} />
            <Metric label="Stages" value={dag?.stages.length ?? 0} lightMode={lightMode} />
            <Metric label="Artifact edges" value={dag?.edges.length ?? 0} lightMode={lightMode} />
            <Metric label="Diagnostics" value={dag?.diagnostics.length ?? 0} lightMode={lightMode} tone={dag?.diagnostics.length ? "warn" : "normal"} />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto px-4 pb-4">
          {status === "loading" || status === "idle" ? (
            <CenteredState
              lightMode={lightMode}
              icon={<Loader2 className="h-5 w-5 animate-spin" />}
              title="Loading recipe DAG"
              message="Reading authored artifact contracts for the selected recipe."
            />
          ) : null}

          {status === "error" ? (
            <CenteredState
              lightMode={lightMode}
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Recipe DAG unavailable"
              message={error ?? "Studio could not load the dependency graph for this recipe."}
            />
          ) : null}

          {status === "ready" && dag && layout ? (
            <div
              className="relative mx-auto"
              style={{ width: layout.width, height: layout.height }}
              data-testid="recipe-dag-canvas"
            >
              <svg
                className="absolute inset-0"
                width={layout.width}
                height={layout.height}
                role="img"
                aria-label={`${dag.title} artifact dependency edges`}
              >
                <defs>
                  <marker
                    id="recipe-dag-arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L8,3 z" fill={palette.edge} />
                  </marker>
                </defs>
                {layout.phaseBands.map((phase) => (
                  <g key={phase.id}>
                    <rect
                      x={32}
                      y={phase.y - 52}
                      width={layout.width - 64}
                      height={PHASE_GAP_Y - 30}
                      rx={8}
                      fill={palette.phaseFill}
                      stroke={palette.phaseStroke}
                    />
                    <text
                      x={52}
                      y={phase.y - 24}
                      fill={palette.phaseText}
                      fontSize="12"
                      fontWeight="700"
                    >
                      {phase.id}
                    </text>
                  </g>
                ))}
                {layout.edgeGroups.map((edge, index) => {
                  const from = layout.positions.get(edge.fromStageId);
                  const to = layout.positions.get(edge.toStageId);
                  if (!from || !to) return null;
                  const x1 = from.x + from.width;
                  const y1 = from.y + 42 + (index % 4) * 10;
                  const x2 = to.x;
                  const y2 = to.y + 42 + (index % 4) * 10;
                  const dx = Math.max(42, Math.abs(x2 - x1) * 0.42);
                  return (
                    <g key={edge.id}>
                      <path
                        d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={palette.edge}
                        strokeWidth="2"
                        markerEnd="url(#recipe-dag-arrow)"
                        opacity="0.76"
                      />
                      <title>{`${edge.fromStageId} provides ${edge.artifacts.join(", ")} to ${edge.toStageId}`}</title>
                    </g>
                  );
                })}
              </svg>

              {dag.stages.map((stage) => {
                const position = layout.positions.get(stage.stageId);
                if (!position) return null;
                const expanded = expandedStageIds.has(stage.stageId);
                const selected = selectedStageId === stage.stageId;
                return (
                  <article
                    key={stage.stageId}
                    className={`absolute overflow-hidden rounded-lg border shadow-sm ${selected ? palette.stageSelected : palette.stage}`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: position.width,
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-start gap-2 px-3 py-2 text-left"
                      aria-expanded={expanded}
                      onClick={() => {
                        onSelectStage(stage.stageId);
                        onToggleStage(stage.stageId);
                      }}
                    >
                      <Boxes className={`mt-0.5 h-4 w-4 shrink-0 ${palette.icon}`} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] font-semibold ${palette.heading}`}>{stage.stageId}</span>
                        <span className={`mt-0.5 block truncate text-[11px] ${palette.body}`}>
                          {stage.steps.length} steps, {stage.artifactProvides.length} provides, {stage.artifactRequires.length} requires
                        </span>
                      </span>
                      <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""} ${palette.icon}`} />
                    </button>

                    <div className={`grid grid-cols-3 border-t text-center text-[10px] ${palette.rule}`}>
                      <StageCounter label="In" value={stage.inboundArtifactEdgeCount} />
                      <StageCounter label="Out" value={stage.outboundArtifactEdgeCount} />
                      <StageCounter label="Internal" value={stage.internalArtifactEdgeCount} />
                    </div>

                    {expanded ? (
                      <div className={`max-h-[320px] overflow-auto border-t px-3 py-2 ${palette.rule}`}>
                        <ol className="space-y-2">
                          {stage.steps.map((step) => (
                            <li key={step.fullStepId} className={`rounded border px-2 py-1.5 ${palette.step}`}>
                              <div className={`truncate text-[11px] font-medium ${palette.heading}`}>
                                {step.orderInStage + 1}. {step.stepId}
                              </div>
                              <div className={`mt-1 truncate text-[10px] ${palette.body}`}>{step.phase}</div>
                              <ArtifactList label="Requires" values={step.artifactRequires.map((artifact) => artifact.id)} lightMode={lightMode} />
                              <ArtifactList label="Provides" values={step.artifactProvides.map((artifact) => artifact.id)} lightMode={lightMode} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </article>
                );
              })}

              {dag.diagnostics.length ? (
                <div className={`absolute left-[72px] right-[72px] bottom-6 rounded-lg border px-3 py-2 text-[11px] ${palette.diagnostic}`}>
                  <div className="mb-1 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Artifact diagnostics
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {dag.diagnostics.slice(0, 6).map((diagnostic, index) => (
                      <li key={`${diagnostic.kind}-${diagnostic.artifact.id}-${index}`} className="truncate">
                        {diagnostic.kind}: {diagnostic.artifact.id}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function buildLayout(dag: RecipeDagResult): {
  width: number;
  height: number;
  positions: Map<string, StagePosition>;
  phaseBands: readonly { id: string; y: number }[];
  edgeGroups: readonly StageEdgeGroup[];
} {
  const phaseIndexById = new Map(dag.phases.map((phase, index) => [phase.id, index]));
  const positions = new Map<string, StagePosition>();
  for (const stage of dag.stages) {
    const phaseId = stage.phases[0] ?? dag.phases[0]?.id ?? "unphased";
    const phaseIndex = phaseIndexById.get(phaseId) ?? 0;
    positions.set(stage.stageId, {
      x: GRAPH_PAD_X + stage.order * (STAGE_WIDTH + STAGE_GAP_X),
      y: GRAPH_PAD_TOP + phaseIndex * PHASE_GAP_Y,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });
  }
  const width = Math.max(980, GRAPH_PAD_X * 2 + dag.stages.length * STAGE_WIDTH + Math.max(0, dag.stages.length - 1) * STAGE_GAP_X);
  const height = Math.max(520, GRAPH_PAD_TOP + Math.max(1, dag.phases.length) * PHASE_GAP_Y + GRAPH_PAD_BOTTOM);
  return {
    width,
    height,
    positions,
    phaseBands: dag.phases.map((phase) => ({
      id: phase.id,
      y: GRAPH_PAD_TOP + (phaseIndexById.get(phase.id) ?? 0) * PHASE_GAP_Y,
    })),
    edgeGroups: groupStageEdges(dag),
  };
}

function groupStageEdges(dag: RecipeDagResult): StageEdgeGroup[] {
  const groups = new Map<string, { fromStageId: string; toStageId: string; artifacts: Set<string> }>();
  for (const edge of dag.edges) {
    if (edge.internal) continue;
    const key = `${edge.from.stageId}->${edge.to.stageId}`;
    const existing = groups.get(key) ?? {
      fromStageId: edge.from.stageId,
      toStageId: edge.to.stageId,
      artifacts: new Set<string>(),
    };
    existing.artifacts.add(edge.artifact.id);
    groups.set(key, existing);
  }
  return Array.from(groups.entries()).map(([id, group]) => ({
    id,
    fromStageId: group.fromStageId,
    toStageId: group.toStageId,
    artifacts: Array.from(group.artifacts).sort(),
  }));
}

function Metric(props: { label: string; value: number; lightMode: boolean; tone?: "normal" | "warn" }) {
  const tone = props.tone ?? "normal";
  const className = props.lightMode
    ? tone === "warn"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-gray-200 bg-white text-gray-800"
    : tone === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
      : "border-[#2a2a32] bg-[#111116] text-[#e8e8ed]";
  return (
    <div className={`min-w-[86px] rounded border px-2 py-1 text-right ${className}`}>
      <div className="text-[15px] font-semibold leading-5">{props.value}</div>
      <div className="text-[10px] uppercase">{props.label}</div>
    </div>
  );
}

function StageCounter(props: { label: string; value: number }) {
  return (
    <div className="px-1.5 py-1">
      <div className="text-[12px] font-semibold">{props.value}</div>
      <div className="uppercase">{props.label}</div>
    </div>
  );
}

function ArtifactList(props: { label: string; values: readonly string[]; lightMode: boolean }) {
  if (props.values.length === 0) return null;
  const chip = props.lightMode
    ? "border-gray-200 bg-gray-50 text-gray-600"
    : "border-[#30303a] bg-[#16161c] text-[#a9a9b5]";
  return (
    <div className="mt-1.5">
      <div className="mb-1 text-[9px] font-semibold uppercase opacity-70">{props.label}</div>
      <div className="flex flex-wrap gap-1">
        {props.values.slice(0, 5).map((value) => (
          <span key={value} className={`max-w-full truncate rounded border px-1 py-0.5 text-[9px] ${chip}`}>
            {value}
          </span>
        ))}
        {props.values.length > 5 ? (
          <span className={`rounded border px-1 py-0.5 text-[9px] ${chip}`}>+{props.values.length - 5}</span>
        ) : null}
      </div>
    </div>
  );
}

function CenteredState(props: {
  lightMode: boolean;
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  const className = props.lightMode
    ? "border-gray-200 bg-white/95 text-gray-700"
    : "border-[#2a2a32] bg-[#141418]/95 text-[#d4d4dc]";
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className={`max-w-[420px] rounded-lg border p-4 text-center shadow-sm ${className}`}>
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-current/20">
          {props.icon}
        </div>
        <div className="text-[14px] font-semibold">{props.title}</div>
        <div className="mt-1 text-[12px] opacity-75">{props.message}</div>
      </div>
    </div>
  );
}

function createPalette(lightMode: boolean) {
  if (lightMode) {
    return {
      surface: "bg-[#f5f5f7]",
      grid: "bg-[linear-gradient(rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[length:48px_48px]",
      panel: "border-gray-200 bg-white/95",
      stage: "border-gray-200 bg-white",
      stageSelected: "border-cyan-500 bg-white ring-2 ring-cyan-500/30",
      step: "border-gray-200 bg-gray-50",
      rule: "border-gray-200 text-gray-500",
      diagnostic: "border-amber-300 bg-amber-50 text-amber-900",
      heading: "text-gray-900",
      body: "text-gray-600",
      kicker: "text-cyan-700",
      icon: "text-cyan-700",
      edge: "#0891b2",
      phaseFill: "rgba(255,255,255,0.68)",
      phaseStroke: "rgba(148,163,184,0.55)",
      phaseText: "#475569",
    } as const;
  }
  return {
    surface: "bg-[#0a0a12]",
    grid: "bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:48px_48px]",
    panel: "border-[#2a2a32] bg-[#141418]/95",
    stage: "border-[#2a2a32] bg-[#101014]",
    stageSelected: "border-cyan-400 bg-[#101014] ring-2 ring-cyan-400/30",
    step: "border-[#30303a] bg-[#15151a]",
    rule: "border-[#2a2a32] text-[#8a8a96]",
    diagnostic: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    heading: "text-[#f0f0f4]",
    body: "text-[#a9a9b5]",
    kicker: "text-cyan-300",
    icon: "text-cyan-300",
    edge: "#22d3ee",
    phaseFill: "rgba(20,20,24,0.68)",
    phaseStroke: "rgba(68,68,78,0.82)",
    phaseText: "#a9a9b5",
  } as const;
}
