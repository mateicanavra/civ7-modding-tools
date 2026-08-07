/**
 * @file utilities-validation.ts
 * @copyright 2023, Firaxis Games
 * @description Simple functions for validating data. We likely don't need many validation utilities, but if we find this growing large we should consider moving to a library.
 */
interface NumberParams {
    value: number | string | null | undefined;
    min?: number;
    max?: number;
    defaultValue?: number;
}
/**
 * number returns a validated number based on the provided parameters.
 *
 * Useful for parsing numbers stored in strings, such as attributes.
 *
 * @example
 * ```ts
 * const index = Validation.number({ value: element.getAttribute('index'), min: 0, max: 10, defaultValue: 0 });
 * ```
 */
export declare const number: ({ value, min, max, defaultValue }: NumberParams) => number;
export {};
