// ============================================================================
// FORM FIELDS INDEX
// ============================================================================
// `FieldRow` is the only field primitive still in use — it lays out the
// label/input pairs in the rjsf config-form templates (`rjsfTemplates.tsx`).
// The former concrete field components (String/Number/Boolean/Select/Array) and
// their `getInputStyles(lightMode)` raw-hex helper were dead (the live form is
// driven by the token-based rjsf widgets) and have been removed.
// ============================================================================

export { FieldRow } from './FieldRow';
