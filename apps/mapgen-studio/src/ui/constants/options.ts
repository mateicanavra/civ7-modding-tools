// ============================================================================
// OPTIONS
// ============================================================================
// Static option definitions for dropdowns and selectors.
// These are default options that can be overridden via props.
// ============================================================================

import type {
  WorldMode,
  MapSize,
  ResourceMode,
  SelectOption,
  DataTypeOption,
  RenderModeOption,
  KnobOptionsMap } from
'../types';

// ============================================================================
// World Settings Options
// ============================================================================

export interface MapSizeOption extends SelectOption<MapSize> {
  dimensions: string;
  width: number;
  height: number;
}

export const WORLD_MODE_OPTIONS: readonly SelectOption<WorldMode>[] = [
{ value: 'browser', label: 'Browser' },
{ value: 'dump', label: 'Dump' }] as
const;

export const MAP_SIZE_OPTIONS: readonly MapSizeOption[] = [
{
  value: 'MAPSIZE_TINY',
  label: 'Tiny',
  dimensions: '60×38',
  width: 60,
  height: 38
},
{
  value: 'MAPSIZE_SMALL',
  label: 'Small',
  dimensions: '74×46',
  width: 74,
  height: 46
},
{
  value: 'MAPSIZE_STANDARD',
  label: 'Standard',
  dimensions: '84×54',
  width: 84,
  height: 54
},
{
  value: 'MAPSIZE_LARGE',
  label: 'Large',
  dimensions: '96×60',
  width: 96,
  height: 60
},
{
  value: 'MAPSIZE_HUGE',
  label: 'Huge',
  dimensions: '106×66',
  width: 106,
  height: 66
}] as
const;

export const PLAYER_COUNT_OPTIONS = [
2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as
const;

export const RESOURCE_MODE_OPTIONS: readonly SelectOption<ResourceMode>[] = [
{ value: 'balanced', label: 'Balanced' },
{ value: 'strategic', label: 'Strategic' }] as
const;

// ============================================================================
// Recipe Options (defaults - can be overridden via props)
// ============================================================================

export const DEFAULT_RECIPE_OPTIONS: readonly SelectOption[] = [
{ value: 'mod-swooper-maps/standard', label: 'Standard' },
{ value: 'mod-swooper-maps/browser-test', label: 'Browser Test' }] as
const;

export const DEFAULT_PRESET_OPTIONS: readonly SelectOption[] = [
{ value: 'none', label: 'None' }] as
const;

// ============================================================================
// View Options (defaults - can be overridden via props)
// ============================================================================

/** Default data type options (what data is being visualized) */
export const DEFAULT_DATA_TYPE_OPTIONS: readonly DataTypeOption[] = [
{ value: 'mesh', label: 'Mesh' },
{ value: 'crust', label: 'Crust' },
{ value: 'tectonics', label: 'Tectonics' }] as
const;

/** Default render mode options (how data is rendered/transformed) */
export const DEFAULT_RENDER_MODE_OPTIONS: readonly RenderModeOption[] = [
{ value: 'hexagonal', label: 'Hexagonal', icon: 'hexagon' },
{ value: 'points', label: 'Points', icon: 'points' },
{ value: 'fields', label: 'Fields', icon: 'fields' },
{ value: 'heatmap', label: 'Heatmap', icon: 'heatmap' }] as
const;

// ============================================================================
// Knob Options (defaults - can be overridden via props)
// ============================================================================

export const DEFAULT_KNOB_OPTIONS: KnobOptionsMap = {
  plateCount: ['sparse', 'normal', 'dense'],
  plateActivity: ['low', 'normal', 'high'],
  seaLevel: ['land-heavy', 'earthlike', 'water-heavy'],
  erosion: ['low', 'normal', 'high'],
  coastRuggedness: ['smooth', 'normal', 'rugged'],
  dryness: ['wet', 'mix', 'dry'],
  temperature: ['cold', 'temperate', 'hot'],
  seasonality: ['low', 'normal', 'high'],
  oceanCoupling: ['weak', 'earthlike', 'strong']
} as const;
