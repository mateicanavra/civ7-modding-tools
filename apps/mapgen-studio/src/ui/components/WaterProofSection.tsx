import React from 'react';
// ============================================================================
// WATER PROOF SECTION
// ============================================================================
// River/Lake/Floodplain inspector rows inside the ExplorePanel dock.
// Presentational only — the semantic summary is built by
// features/viz/riverLakeInspector and passed in fully formed.
// ============================================================================
import { ChevronDown, Droplets } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui';
import type {
  RiverLakeFloodplainInspectorSummary,
  RiverLakeInspectorClaimStatus,
  RiverLakeInspectorLayerRef } from
'../../features/viz/riverLakeInspector';

// ============================================================================
// Props
// ============================================================================
export interface WaterProofSectionProps {
  /** Inspector summary built from the current viz manifest (null = no run). */
  summary: RiverLakeFloodplainInspectorSummary | null | undefined;
  /** Jump the explore selection to an evidence layer. */
  onLayerSelect?: (ref: RiverLakeInspectorLayerRef) => void;
  /** Whether the row list is expanded (controlled). */
  expanded: boolean;
  /** Callback when the disclosure toggles. */
  onExpandedChange: (expanded: boolean) => void;
}

// ============================================================================
// Claim-status presentation (status-dot idiom, GameConsole vocabulary)
// ============================================================================
// HARD RULE (anti-masquerade): status comes ONLY from `row.claimStatus` — the
// semantic module's verdict. Never derive status from layer presence (a row
// can have plenty of layers and still be unresolved; a debug mask being
// present proves nothing). The dot is aria-hidden; the WORD is the accessible
// signal.
const CLAIM_STATUS_DOT: Readonly<Record<RiverLakeInspectorClaimStatus, string>> = {
  pass: 'bg-success',
  available: 'bg-primary',
  fail: 'bg-destructive',
  unresolved: 'bg-warning',
  'out-of-scope': 'bg-muted-foreground'
};
const CLAIM_STATUS_WORD: Readonly<Record<RiverLakeInspectorClaimStatus, string>> = {
  pass: 'ready',
  available: 'inspect',
  fail: 'fail',
  unresolved: 'open',
  'out-of-scope': 'skip'
};

const formatCountLabel = (key: string): string => {
  switch (key) {
    case 'layers':
      return 'layers';
    case 'default':
      return 'shown';
    case 'debug':
      return 'debug';
    default:
      return key;
  }
};

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
 * Water-proof inspector: one row per truth-class claim about rivers, lakes,
 * and floodplains, grouped into 8 lanes (Hydrology, Projection, Terrain,
 * Metadata, Lakes, Floodplains, Rendered, Acceptance). Each lane answers a
 * DIFFERENT question — "did Hydrology compute rivers?" is not "did the engine
 * accept them?" is not "does the player see them?" — so a green check on one
 * lane must never masquerade as proof of another.
 *
 * That is why projection-class evidence never renders success-green: a
 * projection plan being PRESENT only makes it `available` (inspectable,
 * `bg-primary`); `pass`/`bg-success` is reserved for claims the semantic
 * module actually verified. Rows whose proof cannot come from Studio manifest
 * layers at all (rendered Civ visibility, product acceptance) stay
 * `unresolved`/`open` until same-run external evidence closes them.
 */
export const WaterProofSection: React.FC<WaterProofSectionProps> = ({
  summary,
  onLayerSelect,
  expanded,
  onExpandedChange
}) => {
  const rows = summary?.rows ?? [];
  if (!summary || rows.length === 0) return null;

  const textSecondary = 'text-muted-foreground';
  const textMuted = 'text-muted-foreground/70';
  const borderSubtle = 'border-border-subtle';
  const hoverBg = 'hover:bg-accent';

  const evidenceCount = rows.filter(
    (row) => row.claimStatus === 'available' || row.claimStatus === 'pass'
  ).length;
  const openCount = rows.filter(
    (row) => row.claimStatus === 'unresolved' || row.claimStatus === 'fail'
  ).length;
  const collapsedSummary = `${evidenceCount} evidence · ${openCount} open`;

  return (
    <>
      <div className={`flex-shrink-0 border-b ${borderSubtle}`}>
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          aria-expanded={expanded}
          aria-controls="explore-water-proof-list"
          className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${hoverBg}`}>

          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Droplets className={`w-3.5 h-3.5 shrink-0 ${textSecondary}`} />
            <span className={`text-data font-semibold ${textSecondary} uppercase tracking-wider`}>
              Water proof
            </span>
            {!expanded ? (
              <span className={`text-label ${textMuted} truncate`}>
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
          id="explore-water-proof-list"
          className={`flex-shrink-0 border-b ${borderSubtle} max-h-[260px] overflow-y-auto custom-scrollbar`}>
          {rows.map((row) => (
            <div key={row.rowKey} className={`px-3 py-2 border-b last:border-b-0 ${borderSubtle}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`text-label uppercase tracking-wider ${textMuted}`}>
                    {row.laneLabel}
                  </div>
                  <div className="text-data font-medium text-foreground truncate" title={row.displayStatus}>
                    {row.label}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${CLAIM_STATUS_DOT[row.claimStatus]}`}
                  />
                  <span className={`text-label font-semibold uppercase tracking-wider ${textSecondary}`}>
                    {CLAIM_STATUS_WORD[row.claimStatus]}
                  </span>
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {Object.entries(row.counts).map(([key, value]) => (
                  <span key={key} className="rounded px-1.5 py-0.5 text-label bg-muted/50 text-muted-foreground">
                    {formatCountLabel(key)} {value}
                  </span>
                ))}
                {row.layerRefs.slice(0, 4).map((ref) => {
                  const refTitle = `${ref.label} · ${ref.presentation.categoryLabel} · ${row.proofClass}`;
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
            </div>
          ))}
        </div>
      ) : null}
    </>);

};
