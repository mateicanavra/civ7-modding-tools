/**
 * Shared DOM-id builders for the rjsf form suite.
 *
 * `${id}__error` is a cross-file DOM/ARIA contract: the FieldTemplate renders
 * the validation live region under this id (`rjsfTemplates.tsx`) and every
 * widget points `aria-describedby` at the same id (`rjsfWidgets.tsx`), so
 * assistive tech announces errors against the input. One builder, one
 * definition — the string convention can never drift between the two halves.
 */
export function errorFieldId(fieldId: string): string {
  return `${fieldId}__error`;
}
