import React, { useMemo } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  CloudSun,
  Flag,
  GitBranch,
  Layers3,
  Loader2,
  Mountain,
  Package,
  Route,
  Sprout,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { RecipeDagResult } from "./client";
import { formatArtifactLabel, resolveArtifactGroupDomainId } from "./artifactPresentation";
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
                      <title>{`${edge.fromStageId} provides ${edge.artifacts.join(", ")} to ${edge.toStageId}`}</title>
                    </g>
                  );
                })}
              </svg>

              {layout.edgeGroups.map((edge) => {
                if (!edge.points.length) return null;
                const related = !selectedStageId || edge.fromStageId === selectedStageId || edge.toStageId === selectedStageId;
                return (
                  <ArtifactEdgeLabel
                    key={`${edge.id}:label`}
                    label={edge.label}
                    domainId={resolveArtifactGroupDomainId(edge.artifacts)}
                    title={`${edge.fromStageId} provides ${edge.artifacts.join(", ")} to ${edge.toStageId}`}
                    x={edge.labelX}
                    y={edge.labelY - 14}
                    related={related}
                    lightMode={lightMode}
                  />
                );
              })}

              {layout.phaseBands.map((phase, index) => (
                <PhaseLaneLabel
                  key={`${phase.id}:label`}
                  phaseId={phase.id}
                  x={52}
                  y={phase.y + 16}
                  accent={palette.phaseAccents[index % palette.phaseAccents.length]}
                  lightMode={lightMode}
                />
              ))}

              {dag.stages.map((stage) => {
                const position = layout.positions.get(stage.stageId);
                if (!position) return null;
                const expanded = expandedStageIds.has(stage.stageId);
                const selected = selectedStageId === stage.stageId;
                const dimmed = Boolean(neighborStageIds && !neighborStageIds.has(stage.stageId));
                const stageClass = selected ? palette.stageSelected : dimmed ? palette.stageDimmed : palette.stage;
                const headingClass = dimmed ? palette.headingDimmed : palette.heading;
                const bodyClass = dimmed ? palette.bodyDimmed : palette.body;
                const iconClass = dimmed ? palette.iconDimmed : palette.icon;
                const zIndex = expanded ? 70 : selected ? 50 : dimmed ? 20 : 30;
                const expandedPanelId = `recipe-dag-stage-${stage.stageId}-steps`;
                return (
                  <article
                    key={stage.stageId}
                    className={`absolute rounded-lg border shadow-sm transition-[background-color,border-color,box-shadow,color,transform] duration-200 ${expanded ? "shadow-2xl" : ""} ${stageClass}`}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: position.width,
                      zIndex,
                    }}
                    data-stage-id={stage.stageId}
                    data-stage-selected={selected ? "true" : "false"}
                    data-stage-expanded={expanded ? "true" : "false"}
                  >
                    <div className="flex items-start gap-1.5 px-3 py-2">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-start gap-2 text-left"
                        aria-pressed={selected}
                        onClick={() => onSelectStage(stage.stageId)}
                      >
                        <Boxes className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-[13px] font-semibold ${headingClass}`}>{stage.stageId}</span>
                          <span className={`mt-0.5 block truncate text-[11px] ${bodyClass}`}>
                            Runs {stage.steps.length} {stage.steps.length === 1 ? "step" : "steps"}; creates {stage.artifactProvides.length}; needs {stage.artifactRequires.length}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${palette.expandButton}`}
                        aria-expanded={expanded}
                        aria-controls={expandedPanelId}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${stage.stageId} steps`}
                        onClick={() => {
                          onSelectStage(stage.stageId);
                          onToggleStage(stage.stageId);
                        }}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${iconClass}`} />
                      </button>
                    </div>

                    <div className={`grid grid-cols-3 border-t text-center text-[10px] ${palette.rule}`}>
                      <StageCounter label="In" value={stage.inboundArtifactEdgeCount} />
                      <StageCounter label="Out" value={stage.outboundArtifactEdgeCount} />
                      <StageCounter label="Internal" value={stage.internalArtifactEdgeCount} />
                    </div>

                    <div
                      id={expandedPanelId}
                      aria-hidden={!expanded}
                      className={`origin-top overflow-hidden border-t transition-[max-height,opacity,transform] duration-200 ${palette.rule} ${
                        expanded ? "max-h-[340px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"
                      }`}
                    >
                      <div className="max-h-[320px] overflow-auto px-3 py-2">
                        <ol className="space-y-2">
                          {stage.steps.map((step) => (
                            <li key={step.fullStepId} className={`rounded border px-2 py-1.5 ${palette.step}`}>
                              <div className={`truncate text-[11px] font-medium ${headingClass}`}>
                                Step {step.orderInStage + 1}: {step.stepId}
                              </div>
                              <div className={`mt-1 truncate text-[10px] ${bodyClass}`}>Phase: {step.phase}</div>
                              <ArtifactList label="Needs" values={step.artifactRequires.map((artifact) => artifact.id)} lightMode={lightMode} />
                              <ArtifactList label="Creates" values={step.artifactProvides.map((artifact) => artifact.id)} lightMode={lightMode} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
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
                      <li key={`${diagnostic.kind}-${diagnostic.artifact.id}-${index}`} className="flex min-w-0 items-center gap-1 truncate">
                        <span className="truncate">{diagnostic.kind}</span>
                        <ArtifactInlineIcon domainId={resolveArtifactGroupDomainId([diagnostic.artifact.id])} />
                        <span className="truncate" title={diagnostic.artifact.id}>{formatArtifactLabel(diagnostic.artifact.id)}</span>
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

function ArtifactEdgeLabel(props: {
  label: string;
  domainId: string | null;
  title: string;
  x: number;
  y: number;
  related: boolean;
  lightMode: boolean;
}) {
  const palette = createPalette(props.lightMode);
  const className = props.related ? palette.edgeLabelPill : palette.edgeLabelPillDimmed;
  return (
    <div
      className={`absolute z-10 flex max-w-[180px] cursor-default items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${className}`}
      style={{
        left: props.x,
        top: props.y,
        transform: "translate(-50%, -50%)",
      }}
      title={props.title}
    >
      <ArtifactInlineIcon domainId={props.domainId} />
      <span className="truncate">{props.label}</span>
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
          <span
            key={value}
            className={`flex max-w-full items-center gap-1 truncate rounded border px-1 py-0.5 text-[9px] ${chip}`}
            title={value}
          >
            <ArtifactInlineIcon domainId={resolveArtifactGroupDomainId([value])} />
            <span className="truncate">{formatArtifactLabel(value)}</span>
          </span>
        ))}
        {props.values.length > 5 ? (
          <span className={`rounded border px-1 py-0.5 text-[9px] ${chip}`}>+{props.values.length - 5}</span>
        ) : null}
      </div>
    </div>
  );
}

function ArtifactInlineIcon(props: { domainId: string | null }) {
  const Icon = iconForDomainId(props.domainId);
  return <Icon className="h-2.5 w-2.5 shrink-0 text-current" aria-hidden="true" />;
}

function PhaseLaneLabel(props: {
  phaseId: string;
  x: number;
  y: number;
  accent: string;
  lightMode: boolean;
}) {
  const Icon = iconForDomainId(props.phaseId);
  const className = props.lightMode
    ? "border-white/80 bg-white/88 text-slate-700"
    : "border-white/10 bg-[#0d0d11]/88 text-[#d4d4dc]";
  return (
    <div
      className={`absolute z-10 flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-normal shadow-sm backdrop-blur-sm ${className}`}
      style={{ left: props.x, top: props.y }}
      title={`Phase ${props.phaseId}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: props.accent }} aria-hidden="true" />
      <span>{props.phaseId}</span>
    </div>
  );
}

function iconForDomainId(domainId: string | null): LucideIcon {
  const normalized = domainId?.toLowerCase() ?? "";
  if (normalized.includes("hydro") || normalized.includes("river") || normalized.includes("lake")) return Waves;
  if (normalized.includes("climate") || normalized.includes("temperature") || normalized.includes("rain")) return CloudSun;
  if (normalized.includes("terrain") || normalized.includes("height") || normalized.includes("elevation")) return Mountain;
  if (normalized.includes("biome") || normalized.includes("vegetation") || normalized.includes("resource")) return Sprout;
  if (normalized.includes("route") || normalized.includes("path") || normalized.includes("river")) return Route;
  if (normalized.includes("finish") || normalized.includes("final")) return Flag;
  if (normalized.includes("shape") || normalized.includes("land")) return Layers3;
  return Package;
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
      stageDimmed: "border-gray-200 bg-[#f8fafc] shadow-none",
      step: "border-gray-200 bg-gray-50",
      rule: "border-gray-200 text-gray-500",
      diagnostic: "border-amber-300 bg-amber-50 text-amber-900",
      heading: "text-gray-900",
      headingDimmed: "text-gray-500",
      body: "text-gray-600",
      bodyDimmed: "text-gray-400",
      kicker: "text-cyan-700",
      icon: "text-cyan-700",
      iconDimmed: "text-gray-400",
      expandButton: "border-gray-200 bg-white text-gray-500 hover:border-cyan-300 hover:text-cyan-700",
      edge: "#0891b2",
      edgeLabelPill: "border-cyan-200 bg-white text-cyan-800",
      edgeLabelPillDimmed: "border-slate-200 bg-slate-50 text-slate-500",
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
    stageDimmed: "border-[#24242c] bg-[#0d0d11] shadow-none",
    step: "border-[#30303a] bg-[#15151a]",
    rule: "border-[#2a2a32] text-[#8a8a96]",
    diagnostic: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    heading: "text-[#f0f0f4]",
    headingDimmed: "text-[#747482]",
    body: "text-[#a9a9b5]",
    bodyDimmed: "text-[#696976]",
    kicker: "text-cyan-300",
    icon: "text-cyan-300",
    iconDimmed: "text-[#5f6570]",
    expandButton: "border-[#30303a] bg-[#15151a] text-[#8a8a96] hover:border-cyan-400/50 hover:text-cyan-200",
    edge: "#22d3ee",
    edgeLabelPill: "border-cyan-400/35 bg-[#101014] text-cyan-200",
    edgeLabelPillDimmed: "border-[#24242c] bg-[#101014] text-[#6f7480]",
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
