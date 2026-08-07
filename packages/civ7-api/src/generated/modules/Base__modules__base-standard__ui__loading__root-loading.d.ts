/**
 * @file root-loading.ts
 * @copyright 2020-2022, Firaxis Games
 * @description Full screen content to show between shell and game states.
 */
interface RequiredLoadingComponent {
    id: number;
    value: number;
}
declare const requiredLoadingComponents: RequiredLoadingComponent[];
declare const totalRequiredLoadingComponentsValue: any;
declare const rootLoadingRequiredLoadingComponentIds: any[];
declare function getRootGameLoadingInitialLoadingRatio(): number;
declare const completedUIGameLoadingProgressStates: any;
declare const rootGameLoadingInitialLoadingRatio: number;
declare function shouldTransition(): boolean;
declare function updateLoadingBarWidthRatio(numerator: number, denominator: number): void;
declare function onUIGameLoadingProgressChanged({ UIGameLoadingProgressState }: UIGameLoadingProgressChangedData): void;
declare function setRootLoadingSafeMargins(): void;
