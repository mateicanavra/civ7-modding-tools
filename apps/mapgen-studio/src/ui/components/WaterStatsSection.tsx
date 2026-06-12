import React from 'react';
// ============================================================================
// WATER STATS SECTION
// ============================================================================
// Hydrology/lake/floodplain run statistics inside the ExplorePanel dock.
// Presentational only — the numbers come from the riverLakeInspector summary
// (manifest-derived counts). This is a STATS surface, not a proof ledger:
// claim/acceptance bookkeeping lives in the semantic module and the project
// docs, never in product chrome. What earns a row here is information — how
// the run compares to its baseline (plan vs engine counts, mismatches) plus
// jump-to-layer chips for the underlying evidence.
// ============================================================================
import { ChevronDown, Droplets } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui';
import type {
  RiverLakeFloodplainInspectorSummary,
  RiverLakeInspectorLayerRef } from
'../../features/viz/riverLakeInspector';

// ============================================================================
// Props
// ============================================================================
export interface WaterStatsSectionProps {
  /** Inspector summary built from the current viz manifest (null = no run). */
  summary: RiverLakeFloodplainInspectorSummary | null | undefined;
  /** Jump the explore selection to an evidence layer. */
  onLayerSelect?: (ref: RiverLakeInspectorLayerRef) => void;
  /** Whether the row list is expanded (controlled). */
  expanded: boolean;
  /** Callback when the disclosure toggles. */
  onExpandedChange: (expanded: boolean) => void;
}

// Inventory keys ('how many layers exist / are shown / are debug') are
// manifest bookkeeping, not run information — only semantic counts render.
const INVENTORY_COUNT_KEYS = new Set(['layers', 'default', 'debug']);

/**
 * Baseline-matching emphasis: counts that MEASURE divergence from the plan
 * (mismatches, rejections) are the signal this section exists for — nonzero
 * means the run diverged from its baseline and warrants a look.
 */
const isDivergenceCount = (key: string): boolean => /mismatch|reject|drift/i.test(key);

const formatLayerButtonLabel = (ref: RiverLakeInspectorLayerRef): string => {
  if (ref.dataTypeKey.includes('projectedRiverMask')) return 'projected';
  if (ref.dataTypeKey.includes('plannedMinorRiverMask')) return 'minor';
  if (ref.dataTypeKey.includes('plannedMajorRiverMask')) return 'major';
  if (ref.dataTypeKey.includes('engineRiverMask')) return 'terrain';
  if (ref.dataTypeKey.includes('Metadata')) return 'metadata';
  if (ref.dataTypeKey.includes('engineMinorRiverMask')) return 'minor meta';
  if (ref.dataTypeKey.includes('riverMismatchMask')) return 'mismatch';
  if (ref.dataTypeKey.includes('lakePlan')) return 'lake plan';
  if (ref.dataTypeKey.includes('plannedLakeMask')) return 'planned';
  if (ref.dataTypeKey.includes('engineLakeMask')) return 'engine';
  if (ref.dataTypeKey.includes('rejectedLakeMask')) return 'rejected';
  if (ref.dataTypeKey.includes('featureType')) return 'features';
  if (ref.dataTypeKey.includes('rejectionMask')) return 'rejects';
  const parts = ref.dataTypeKey.split('.');
  return parts[parts.length - 1] ?? ref.dataTypeKey;
};

// ============================================================================
// Component
// ============================================================================
/**
 * Water stats: one compact line per hydrology/lake/floodplain data family,
 * showing the run's semantic counts (rivers planned, engine readbacks, lakes
 * intent vs engine, floodplains applied/rejected) with divergence counts
 * (mismatch/rejected) emphasized when nonzero — that is the at-a-glance
 * "does this run match its baseline?" signal. Each line carries jump chips
 * to the evidence layers (module-owned data colors). Rows with no counts and
 * no layers (closure bookkeeping the manifest cannot inform) do not render.
 */
export const WaterStatsSection: React.FC<WaterStatsSectionProps> = ({
  summary,
  onLayerSelect,
  expanded,
  onExpandedChange
}) => {
  const allRows = summary?.rows ?? [];
  const rows = allRows
    .map((row) => ({
      rowKey: row.rowKey,
      label: row.label,
      counts: Object.entries(row.counts).filter(([key]) => !INVENTORY_COUNT_KEYS.has(key)),
      layerRefs: row.layerRefs
    }))
    .filter((row) => row.counts.length > 0 || row.layerRefs.length > 0);
  if (rows.length === 0) return null;

  const textSecondary = 'text-muted-foreground';
  const textMuted = 'text-muted-foreground/70';
  const borderSubtle = 'border-border-subtle';
  const hoverBg = 'hover:bg-accent';

  const divergenceTotal = rows.reduce(
    (total, row) =>
      total + row.counts.reduce((sum, [key, value]) => (isDivergenceCount(key) ? sum + value : sum), 0),
    0
  );
  const collapsedSummary = divergenceTotal > 0 ? `${divergenceTotal} mismatched` : 'matches baseline';

  return (
    <>
      <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          aria-expanded={expanded}
          aria-controls="explore-water-stats-list"
          className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Droplets className={`w-3.5 h-3.5 shrink-0 ${textSecondary}`} />
            <span className={`text-data font-semibold ${textSecondary} uppercase tracking-wider`}>
              Water stats
            </span>
            {!expanded ? (
              <span className={`text-label truncate ${divergenceTotal > 0 ? 'text-warning' : textMuted}`}>
                {collapsedSummary}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-label ${textMuted}`}>{rows.length}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${textMuted} transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </button>
      </div>
      {expanded ? (
        <div
          id="explore-water-stats-list"
          className={`flex-shrink-0 border-b ${borderSubtle} max-h-[220px] overflow-y-auto custom-scrollbar`}>
          {rows.map((row) => (
            <div
              key={row.rowKey}
              className={`px-3 py-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-b last:border-b-0 ${borderSubtle}`}>
              <span className={`text-data min-w-[88px] ${textSecondary}`}>{row.label}</span>
              {row.counts.map(([key, value]) => {
                const diverged = isDivergenceCount(key) && value > 0;
                return (
                  <span
                    key={key}
                    className={`rounded px-1.5 py-0.5 text-label ${
                      diverged
                        ? 'border border-warning/40 text-warning'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}>
                    {key} {value}
                  </span>
                );
              })}
              {row.layerRefs.slice(0, 4).map((ref) => {
                const refTitle = `${ref.label} · ${ref.presentation.categoryLabel}`;
                return (
                  <Tooltip key={ref.layerKey}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onLayerSelect?.(ref)}
                        aria-label={refTitle}
                        className="inline-flex max-w-[112px] items-center gap-1 truncate rounded px-1.5 py-0.5 text-label transition-colors bg-input-background border border-border-subtle text-muted-foreground hover:bg-accent hover:text-foreground">
                        {/* Module-owned DATA color: the palette hue travels with
                            the semantic layer ref (it matches how the mask renders
                            on the map), so an inline style is legal here per the
                            system.md data-color rule — it is matter, not chrome. */}
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: ref.presentation.palette.activeColor }}
                        />
                        <span className="truncate">{formatLayerButtonLabel(ref)}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{refTitle}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </>);

};
