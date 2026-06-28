import type { RecipeDagResult } from "@civ7/studio-server/contract";
import { AlertTriangle, ChevronDown, Loader2, Workflow } from "lucide-react";
import React, { useMemo, useState } from "react";
import { EmptyState } from "../../ui/components/EmptyState";
import { formatArtifactLabel, resolveArtifactGroupDomainId } from "./artifactPresentation";
import {
  chooseRecipeDagDomainId,
  getRecipeDagDomainPresentation,
  getRecipeDagPhaseLaneColors,
} from "./domainPresentation";
import {
  buildArtifactEdgeLabels,
  buildRecipeDagLayout,
  pointsToPath,
  type RoutedStageEdgeGroup,
} from "./layout";
import type { RecipeDagLoadStatus } from "./useRecipeDagQuery";

// ============================================================================
// PIPELINE STAGE — the recipe DAG as a first-class stage view
// (mapgen-studio-dag-tab; re-expresses the merged RecipeDagView chrome)
// ============================================================================
// Chrome is token-driven (single `.dark` class; no lightMode palette forks);
// the ONLY place `isLightMode` survives is the preserved domain presentation
// module, whose lane fills/accents are data color with explicit light/dark
// variants (handoff §2.4 — domain drives color, not phase order).
//
// Everything the handoff lists under §2.3–§2.6 is consumed or reproduced
// verbatim: the headless layout (dependency rank × phase-lane waterfall,
// bundled trunks, deterministic label fanning), the one-icon contract across
// nodes/lanes/pills/chips/diagnostics, stage selection separate from step
// expansion (click-again unselects), selectable per-artifact connector
// labels, focus dimming with active elements rising, and diagnostics.
// ============================================================================

/**
 * Neutral connector ink — the idle-graph chrome color for edges and the SVG
 * furniture. A luminance token (not a hex fork) so it follows the theme;
 * exported for the static-markup behavioral pins.
 */
export const PIPELINE_EDGE_INK = "hsl(var(--muted-foreground) / 0.55)";

export interface PipelineStageProps {
  recipeId: string;
  dag: RecipeDagResult | null;
  status: RecipeDagLoadStatus;
  error: string | null;
  /** Forwarded ONLY to the preserved domain palette (data color variants). */
  isLightMode: boolean;
  expandedStageIds: ReadonlySet<string>;
  selectedStageId: string | null;
  onToggleStage: (stageId: string) => void;
  onSelectStage: (stageId: string) => void;
  /** Clearance (px) under the floating header for the scroll content. */
  topInset: number;
  /** Clearance (px) above the floating footer for the scroll content. */
  bottomInset: number;
}

export function PipelineStage(props: PipelineStageProps) {
  const {
    recipeId,
    dag,
    status,
    error,
    isLightMode,
    expandedStageIds,
    selectedStageId,
    onToggleStage,
    onSelectStage,
    topInset,
    bottomInset,
  } = props;
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const layout = useMemo(() => (dag ? buildRecipeDagLayout(dag) : null), [dag]);
  const phaseIdByStageId = useMemo(() => {
    const ids = new Map<string, string | null>();
    if (!dag) return ids;
    for (const stage of dag.stages) {
      ids.set(stage.stageId, chooseRecipeDagDomainId(stage.phases));
    }
    return ids;
  }, [dag]);
  const edgeLayerGroups = useMemo(() => {
    if (!layout) return [];
    return [...layout.edgeGroups].sort((a, b) => a.id.localeCompare(b.id));
  }, [layout]);
  const baseArtifactLabels = useMemo(
    () => buildArtifactEdgeLabels(edgeLayerGroups),
    [edgeLayerGroups]
  );
  const selectedLabel = useMemo(
    () => baseArtifactLabels.find((label) => label.id === selectedLabelId) ?? null,
    [baseArtifactLabels, selectedLabelId]
  );
  const artifactLabels = useMemo(
    () => buildArtifactEdgeLabels(edgeLayerGroups, selectedLabel ? null : selectedStageId),
    [edgeLayerGroups, selectedLabel, selectedStageId]
  );
  const neighborStageIds = useMemo(() => {
    if (selectedLabel) return new Set([selectedLabel.fromStageId, ...selectedLabel.toStageIds]);
    if (!selectedStageId || !layout) return null;
    const ids = new Set<string>([selectedStageId]);
    for (const edge of layout.edgeGroups) {
      if (edge.fromStageId === selectedStageId) ids.add(edge.toStageId);
      if (edge.toStageId === selectedStageId) ids.add(edge.fromStageId);
    }
    return ids;
  }, [layout, selectedLabel, selectedStageId]);
  const sortedEdgeLayerGroups = useMemo(() => {
    const score = (edge: RoutedStageEdgeGroup) => {
      if (selectedLabel?.edgeIds.includes(edge.id)) return 3;
      if (
        !selectedLabel &&
        selectedStageId &&
        (edge.fromStageId === selectedStageId || edge.toStageId === selectedStageId)
      )
        return 2;
      return 1;
    };
    return [...edgeLayerGroups].sort((a, b) => score(a) - score(b) || a.id.localeCompare(b.id));
  }, [edgeLayerGroups, selectedLabel, selectedStageId]);
  const focusActive = Boolean(selectedLabel || selectedStageId);
  const getStageAccent = (stageId: string) =>
    getRecipeDagPhaseLaneColors(phaseIdByStageId.get(stageId) ?? null, isLightMode).accent;
  const handleSelectStage = (stageId: string, options?: { keepSelected?: boolean }) => {
    setSelectedLabelId(null);
    if (!options?.keepSelected && !selectedLabel && selectedStageId === stageId) {
      onSelectStage("");
      return;
    }
    onSelectStage(stageId);
  };

  return (
    <section
      className="absolute inset-0 overflow-hidden bg-background"
      aria-label={`Recipe dependency graph for ${recipeId}`}
    >
      {/* Luminance grid — same substrate treatment as the map stage. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--muted-foreground) / 0.06) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted-foreground) / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* Pipeline console — the instrument strip (identity + projection counts). */}
      <div
        className="absolute right-4 z-20 inline-flex h-10 items-center gap-3 rounded-lg border border-border bg-popover/95 px-3 backdrop-blur-sm"
        style={{ top: topInset }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <Workflow className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <span className="max-w-[220px] truncate text-label font-semibold uppercase tracking-wider text-muted-foreground">
            {dag?.title ?? recipeId}
          </span>
        </div>
        <div className="w-px h-5 bg-border" />
        <PipelineMetric label="Phases" value={dag?.phases.length ?? 0} />
        <PipelineMetric label="Stages" value={dag?.stages.length ?? 0} />
        <PipelineMetric label="Edges" value={dag?.edges.length ?? 0} />
        <PipelineMetric
          label="Issues"
          value={dag?.diagnostics.length ?? 0}
          warn={Boolean(dag?.diagnostics.length)}
        />
      </div>

      <div
        className="relative flex h-full min-h-0 flex-col"
        style={{ paddingTop: topInset, paddingBottom: bottomInset }}
      >
        <div className="relative min-h-0 flex-1 overflow-auto px-4 pb-4 pt-14 custom-scrollbar">
          {status === "loading" || status === "idle" ? (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <EmptyState
                className="max-w-[420px]"
                icon={<Loader2 className="h-5 w-5 animate-spin" />}
                title={
                  <span className="text-data font-medium text-foreground">
                    Loading recipe pipeline
                  </span>
                }
                message={
                  <span className="text-label text-muted-foreground">
                    Reading authored artifact contracts for the selected recipe.
                  </span>
                }
              />
            </div>
          ) : null}

          {status === "error" ? (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <EmptyState
                className="max-w-[420px]"
                icon={<AlertTriangle className="h-5 w-5" />}
                title={
                  <span className="text-data font-medium text-foreground">
                    Recipe pipeline unavailable
                  </span>
                }
                message={
                  <span className="text-label text-muted-foreground">
                    {error ?? "Studio could not load the dependency graph for this recipe."}
                  </span>
                }
              />
            </div>
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
                    <path d="M0,0 L0,6 L8,3 z" fill="context-stroke" />
                  </marker>
                  <marker
                    id="recipe-dag-arrow-active"
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L8,3 z" fill="context-stroke" />
                  </marker>
                </defs>
                {layout.rankColumns.map((column) => (
                  <g key={column.rank}>
                    <line
                      x1={column.x + 124}
                      y1={48}
                      x2={column.x + 124}
                      y2={layout.height - 58}
                      stroke="hsl(var(--muted-foreground) / 0.25)"
                      strokeWidth="1"
                      strokeDasharray="3 8"
                    />
                    <text
                      x={column.x}
                      y={28}
                      fill="hsl(var(--muted-foreground))"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {column.label}
                    </text>
                  </g>
                ))}
                {layout.phaseBands.map((phase) => {
                  const lane = getRecipeDagPhaseLaneColors(phase.id, isLightMode);
                  return (
                    <g key={phase.id}>
                      <rect
                        x={32}
                        y={phase.y}
                        width={layout.width - 64}
                        height={phase.height}
                        rx={8}
                        fill={lane.fill}
                        stroke="hsl(var(--border))"
                      />
                      <rect
                        x={32}
                        y={phase.y}
                        width={4}
                        height={phase.height}
                        rx={2}
                        fill={lane.accent}
                        opacity="0.9"
                      />
                    </g>
                  );
                })}
                {sortedEdgeLayerGroups.map((edge) => {
                  if (!edge.points.length) return null;
                  const selected = Boolean(selectedLabel?.edgeIds.includes(edge.id));
                  const related = selectedLabel
                    ? selected
                    : !selectedStageId ||
                      edge.fromStageId === selectedStageId ||
                      edge.toStageId === selectedStageId;
                  const edgeAccent = getStageAccent(edge.fromStageId);
                  const stroke = focusActive && related ? edgeAccent : PIPELINE_EDGE_INK;
                  return (
                    <g key={edge.id}>
                      <path
                        d={pointsToPath(edge.points)}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={selected ? "3" : focusActive && related ? "2.4" : "1.35"}
                        markerEnd={
                          focusActive && related
                            ? "url(#recipe-dag-arrow-active)"
                            : "url(#recipe-dag-arrow)"
                        }
                        opacity={
                          selected
                            ? "0.96"
                            : focusActive && related
                              ? "0.82"
                              : focusActive
                                ? "0.22"
                                : "0.42"
                        }
                      />
                      <title>{`${edge.fromStageId} provides ${edge.artifacts.join(", ")} to ${edge.toStageId}`}</title>
                    </g>
                  );
                })}
              </svg>

              {artifactLabels.map((label) => {
                const selected = selectedLabelId === label.id;
                const related = selectedLabel
                  ? selected
                  : !selectedStageId ||
                    label.fromStageId === selectedStageId ||
                    label.toStageIds.includes(selectedStageId);
                const visible = selectedLabel ? selected : !selectedStageId || related;
                if (!visible) return null;
                const edgeAccent = getStageAccent(label.fromStageId);
                return (
                  <ArtifactEdgeLabel
                    key={label.id}
                    label={label.label}
                    domainId={resolveArtifactGroupDomainId(label.artifacts)}
                    title={`${label.fromStageId} provides ${label.artifact} to ${label.toStageIds.join(", ")}`}
                    x={label.labelX}
                    y={label.labelY - 14}
                    related={related}
                    selected={selected}
                    focused={focusActive}
                    accent={focusActive && (selected || related) ? edgeAccent : PIPELINE_EDGE_INK}
                    onSelect={() => setSelectedLabelId(label.id)}
                  />
                );
              })}

              {layout.phaseBands.map((phase) => (
                <PhaseLaneLabel
                  key={`${phase.id}:label`}
                  phaseId={phase.id}
                  x={52}
                  y={phase.y + 16}
                  accent={getRecipeDagPhaseLaneColors(phase.id, isLightMode).accent}
                />
              ))}

              {dag.stages.map((stage) => {
                const position = layout.positions.get(stage.stageId);
                if (!position) return null;
                const expanded = expandedStageIds.has(stage.stageId);
                const selected = !selectedLabel && selectedStageId === stage.stageId;
                const edgeActive = Boolean(selectedLabel && neighborStageIds?.has(stage.stageId));
                const dimmed = Boolean(neighborStageIds && !neighborStageIds.has(stage.stageId));
                const stageClass = dimmed
                  ? "border-border/60 bg-card/70 shadow-none"
                  : "border-border bg-card";
                const headingClass = dimmed ? "text-muted-foreground/70" : "text-foreground";
                const bodyClass = dimmed ? "text-muted-foreground/50" : "text-muted-foreground";
                const iconClass = dimmed ? "text-muted-foreground/50" : "text-muted-foreground";
                const stageDomainId = chooseRecipeDagDomainId(stage.phases);
                const stageAccent = getRecipeDagPhaseLaneColors(stageDomainId, isLightMode).accent;
                const activeNodeAccent = selected || edgeActive ? stageAccent : null;
                const zIndex =
                  selected || edgeActive ? (expanded ? 95 : 85) : expanded ? 70 : dimmed ? 20 : 30;
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
                      borderColor: activeNodeAccent ?? undefined,
                      boxShadow: activeNodeAccent
                        ? `0 0 0 2px ${activeNodeAccent}38, 0 16px 42px ${activeNodeAccent}18`
                        : undefined,
                    }}
                    data-stage-id={stage.stageId}
                    data-stage-selected={selected || edgeActive ? "true" : "false"}
                    data-stage-edge-active={edgeActive ? "true" : "false"}
                    data-stage-expanded={expanded ? "true" : "false"}
                  >
                    <div className="flex items-start gap-1.5 px-3 py-2">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-start gap-2 text-left"
                        aria-pressed={selected}
                        onClick={() => handleSelectStage(stage.stageId)}
                      >
                        <DomainInlineIcon
                          domainId={stageDomainId}
                          className={`mt-0.5 h-4 w-4 ${iconClass}`}
                          style={activeNodeAccent ? { color: activeNodeAccent } : undefined}
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-data font-semibold ${headingClass}`}
                          >
                            {stage.stageId}
                          </span>
                          <span className={`mt-0.5 block truncate text-label ${bodyClass}`}>
                            Runs {stage.steps.length} {stage.steps.length === 1 ? "step" : "steps"};
                            creates {stage.artifactProvides.length}; needs{" "}
                            {stage.artifactRequires.length}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        aria-expanded={expanded}
                        aria-controls={expandedPanelId}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${stage.stageId} steps`}
                        onClick={() => {
                          handleSelectStage(stage.stageId, { keepSelected: true });
                          onToggleStage(stage.stageId);
                        }}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${iconClass}`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 border-t border-border text-center text-label text-muted-foreground">
                      <StageCounter label="In" value={stage.inboundArtifactEdgeCount} />
                      <StageCounter label="Out" value={stage.outboundArtifactEdgeCount} />
                      <StageCounter label="Internal" value={stage.internalArtifactEdgeCount} />
                    </div>

                    <div
                      id={expandedPanelId}
                      aria-hidden={!expanded}
                      className={`origin-top overflow-hidden border-t border-border transition-[max-height,opacity,transform] duration-200 ${
                        expanded
                          ? "max-h-[340px] opacity-100 translate-y-0"
                          : "max-h-0 opacity-0 -translate-y-1"
                      }`}
                    >
                      <div className="max-h-[320px] overflow-auto px-3 py-2 custom-scrollbar">
                        <ol className="space-y-2">
                          {stage.steps.map((step) => (
                            <li
                              key={step.fullStepId}
                              className="rounded border border-border bg-muted/40 px-2 py-1.5"
                            >
                              <div className={`truncate text-label font-medium ${headingClass}`}>
                                Step {step.orderInStage + 1}: {step.stepId}
                              </div>
                              <div
                                className={`mt-1 flex items-center gap-1 truncate text-label ${bodyClass}`}
                              >
                                <DomainInlineIcon domainId={step.phase} className="h-2.5 w-2.5" />
                                <span className="truncate">Phase: {step.phase}</span>
                              </div>
                              <ArtifactList
                                label="Needs"
                                values={step.artifactRequires.map((artifact) => artifact.id)}
                              />
                              <ArtifactList
                                label="Creates"
                                values={step.artifactProvides.map((artifact) => artifact.id)}
                              />
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </article>
                );
              })}

              {dag.diagnostics.length ? (
                <div className="absolute left-[72px] right-[72px] bottom-6 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-label text-foreground">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Artifact diagnostics
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {dag.diagnostics.slice(0, 6).map((diagnostic, index) => (
                      <li
                        key={`${diagnostic.kind}-${diagnostic.artifact.id}-${index}`}
                        className="flex min-w-0 items-center gap-1 truncate"
                      >
                        <span className="truncate">{diagnostic.kind}</span>
                        <DomainInlineIcon
                          domainId={resolveArtifactGroupDomainId([diagnostic.artifact.id])}
                          className="h-2.5 w-2.5"
                        />
                        <span className="truncate" title={diagnostic.artifact.id}>
                          {formatArtifactLabel(diagnostic.artifact.id)}
                        </span>
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

function PipelineMetric(props: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={`text-data font-semibold ${props.warn ? "text-warning" : "text-foreground"}`}
      >
        {props.value}
      </span>
      <span className="text-label uppercase tracking-wider text-muted-foreground/70">
        {props.label}
      </span>
    </div>
  );
}

function StageCounter(props: { label: string; value: number }) {
  return (
    <div className="px-1.5 py-1">
      <div className="text-data font-semibold text-foreground">{props.value}</div>
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
  selected: boolean;
  focused: boolean;
  accent: string;
  onSelect: () => void;
}) {
  const className = props.focused
    ? props.related
      ? "border-border bg-popover text-foreground"
      : "border-border/60 bg-popover/70 text-muted-foreground/60"
    : "border-border bg-popover text-muted-foreground";
  return (
    <button
      type="button"
      className={`absolute flex max-w-[190px] cursor-pointer items-center gap-1 rounded-full border px-[6.5px] py-0.5 text-label font-semibold shadow-sm transition-[left,top,border-color,box-shadow,color,background-color] duration-200 ${className}`}
      style={{
        left: props.x,
        top: props.y,
        zIndex: props.selected ? 98 : props.related ? 62 : 10,
        transform: "translate(-50%, -50%)",
        borderColor: props.focused && props.related ? props.accent : undefined,
        boxShadow: props.selected ? `0 0 0 2px ${props.accent}33` : undefined,
        color: props.focused && props.related ? props.accent : undefined,
      }}
      title={props.title}
      aria-pressed={props.selected}
      aria-label={`Select dependency ${props.label}`}
      data-edge-label-selected={props.selected ? "true" : "false"}
      onClick={props.onSelect}
    >
      <DomainInlineIcon domainId={props.domainId} className="h-[11px] w-[11px]" />
      <span className="truncate">{props.label}</span>
    </button>
  );
}

function ArtifactList(props: { label: string; values: readonly string[] }) {
  if (props.values.length === 0) return null;
  const chip = "border-border bg-muted/40 text-muted-foreground";
  return (
    <div className="mt-1.5">
      <div className="mb-1 text-label font-semibold uppercase opacity-70">{props.label}</div>
      <div className="flex flex-wrap gap-1">
        {props.values.slice(0, 5).map((value) => (
          <span
            key={value}
            className={`flex max-w-full items-center gap-1 truncate rounded border px-1 py-0.5 text-label ${chip}`}
            title={value}
          >
            <DomainInlineIcon
              domainId={resolveArtifactGroupDomainId([value])}
              className="h-2.5 w-2.5"
            />
            <span className="truncate">{formatArtifactLabel(value)}</span>
          </span>
        ))}
        {props.values.length > 5 ? (
          <span className={`rounded border px-1 py-0.5 text-label ${chip}`}>
            +{props.values.length - 5}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DomainInlineIcon(props: {
  domainId: string | null;
  className: string;
  style?: React.CSSProperties;
}) {
  const { Icon, strokeWidth } = getRecipeDagDomainPresentation(props.domainId);
  return (
    <Icon
      className={`shrink-0 text-current ${props.className}`}
      strokeWidth={strokeWidth}
      style={props.style}
      aria-hidden="true"
    />
  );
}

function PhaseLaneLabel(props: { phaseId: string; x: number; y: number; accent: string }) {
  const { Icon, label, strokeWidth } = getRecipeDagDomainPresentation(props.phaseId);
  return (
    <div
      className="absolute z-10 flex items-center gap-1.5 rounded-full border border-border bg-popover/90 px-2 py-1 text-label font-semibold uppercase tracking-normal text-foreground shadow-sm backdrop-blur-sm"
      style={{ left: props.x, top: props.y }}
      title={`Phase ${label}`}
    >
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        strokeWidth={strokeWidth}
        style={{ color: props.accent }}
        aria-hidden="true"
      />
      <span>{props.phaseId}</span>
    </div>
  );
}
