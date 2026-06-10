import React, { useMemo } from "react";
import { AlertTriangle, Boxes, ChevronDown, GitBranch, Loader2 } from "lucide-react";

import type { RecipeDagResult } from "./client";
import { buildRecipeDagLayout, pointsToPath } from "./layout";

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
  const layout = useMemo(() => (dag ? buildRecipeDagLayout(dag) : null), [dag]);
  const neighborStageIds = useMemo(() => {
    if (!selectedStageId || !layout) return null;
    const ids = new Set([selectedStageId]);
    for (const edge of layout.edgeGroups) {
      if (edge.fromStageId === selectedStageId) ids.add(edge.toStageId);
      if (edge.toStageId === selectedStageId) ids.add(edge.fromStageId);
    }
    return ids;
  }, [layout, selectedStageId]);

  return (
    <section
      className={`absolute inset-0 overflow-hidden ${palette.surface}`}
      style={{ paddingTop: topInset }}
      aria-label={`Recipe dependency graph for ${recipeId}`}
    >
      <div className={`absolute inset-0 pointer-events-none ${palette.grid}`} aria-hidden="true" />
      <div className="relative flex h-full min-h-0 flex-col">
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
                {layout.rankColumns.map((column) => (
                  <g key={column.rank}>
                    <line
                      x1={column.x + 124}
                      y1={48}
                      x2={column.x + 124}
                      y2={layout.height - 58}
                      stroke={palette.rankLine}
                      strokeWidth="1"
                      strokeDasharray="3 8"
                    />
                    <text
                      x={column.x}
                      y={28}
                      fill={palette.phaseText}
                      fontSize="10"
                      fontWeight="700"
                    >
                      {column.label}
                    </text>
                  </g>
                ))}
                {layout.phaseBands.map((phase, index) => (
                  <g key={phase.id}>
                    <rect
                      x={32}
                      y={phase.y}
                      width={layout.width - 64}
                      height={phase.height}
                      rx={8}
                      fill={palette.phaseFills[index % palette.phaseFills.length]}
                      stroke={palette.phaseStroke}
                    />
                    <rect
                      x={32}
                      y={phase.y}
                      width={4}
                      height={phase.height}
                      rx={2}
                      fill={palette.phaseAccents[index % palette.phaseAccents.length]}
                      opacity="0.9"
                    />
                    <text
                      x={52}
                      y={phase.y + 26}
                      fill={palette.phaseText}
                      fontSize="12"
                      fontWeight="700"
                    >
                      {phase.id}
                    </text>
                  </g>
                ))}
                {layout.edgeGroups.map((edge) => {
                  if (!edge.points.length) return null;
                  const related = !selectedStageId || edge.fromStageId === selectedStageId || edge.toStageId === selectedStageId;
                  return (
                    <g key={edge.id}>
                      <path
                        d={pointsToPath(edge.points)}
                        fill="none"
                        stroke={palette.edge}
                        strokeWidth={related ? "2.4" : "1.4"}
                        markerEnd="url(#recipe-dag-arrow)"
                        opacity={related ? "0.82" : "0.22"}
                      />
                      <text
                        x={edge.labelX}
                        y={edge.labelY - 5}
                        fill={palette.edgeLabel}
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                        opacity={related ? "0.9" : "0.25"}
                      >
                        {edge.label}
                      </text>
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
                const dimmed = Boolean(neighborStageIds && !neighborStageIds.has(stage.stageId));
                return (
                  <article
                    key={stage.stageId}
                    className={`absolute overflow-hidden rounded-lg border shadow-sm transition-opacity ${selected ? palette.stageSelected : palette.stage} ${dimmed ? "opacity-45" : "opacity-100"}`}
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
                          Runs {stage.steps.length} {stage.steps.length === 1 ? "step" : "steps"}; creates {stage.artifactProvides.length}; needs {stage.artifactRequires.length}
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
                                Step {step.orderInStage + 1}: {step.stepId}
                              </div>
                              <div className={`mt-1 truncate text-[10px] ${palette.body}`}>Phase: {step.phase}</div>
                              <ArtifactList label="Needs" values={step.artifactRequires.map((artifact) => artifact.id)} lightMode={lightMode} />
                              <ArtifactList label="Creates" values={step.artifactProvides.map((artifact) => artifact.id)} lightMode={lightMode} />
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

export function RecipeDagStatsBar(props: { dag: RecipeDagResult | null; recipeId: string; lightMode: boolean }) {
  const palette = createPalette(props.lightMode);
  return (
    <div className={`flex max-w-[min(760px,calc(100vw-260px))] items-center gap-2 rounded-lg border px-2 py-1 backdrop-blur-md ${palette.panel}`}>
      <div className={`hidden min-w-0 items-center gap-1.5 px-2 text-[11px] font-semibold uppercase md:flex ${palette.kicker}`}>
        <GitBranch className="h-3.5 w-3.5" />
        <span className="truncate">{props.dag?.title ?? props.recipeId}</span>
      </div>
      <Metric label="Phases" value={props.dag?.phases.length ?? 0} lightMode={props.lightMode} />
      <Metric label="Stages" value={props.dag?.stages.length ?? 0} lightMode={props.lightMode} />
      <Metric label="Edges" value={props.dag?.edges.length ?? 0} lightMode={props.lightMode} />
      <Metric label="Issues" value={props.dag?.diagnostics.length ?? 0} lightMode={props.lightMode} tone={props.dag?.diagnostics.length ? "warn" : "normal"} />
    </div>
  );
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
    <div className={`min-w-[64px] rounded border px-2 py-1 text-right ${className}`}>
      <div className="text-[13px] font-semibold leading-4">{props.value}</div>
      <div className="text-[9px] uppercase">{props.label}</div>
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
      panel: "border-white/80 bg-white/78",
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
      edgeLabel: "#0e7490",
      rankLine: "rgba(71,85,105,0.22)",
      phaseFills: [
        "rgba(236,253,245,0.68)",
        "rgba(239,246,255,0.68)",
        "rgba(255,247,237,0.66)",
        "rgba(245,243,255,0.64)",
      ],
      phaseAccents: ["#059669", "#2563eb", "#d97706", "#7c3aed"],
      phaseStroke: "rgba(100,116,139,0.42)",
      phaseText: "#334155",
    } as const;
  }
  return {
    surface: "bg-[#0a0a12]",
    grid: "bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:48px_48px]",
    panel: "border-white/10 bg-[#141418]/72",
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
    edgeLabel: "#67e8f9",
    rankLine: "rgba(148,163,184,0.16)",
    phaseFills: [
      "rgba(6,78,59,0.20)",
      "rgba(30,64,175,0.18)",
      "rgba(146,64,14,0.18)",
      "rgba(91,33,182,0.17)",
    ],
    phaseAccents: ["#34d399", "#60a5fa", "#f59e0b", "#a78bfa"],
    phaseStroke: "rgba(100,116,139,0.42)",
    phaseText: "#d4d4dc",
  } as const;
}
