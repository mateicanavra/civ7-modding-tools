import { Accessor, Setter } from "solid-js";
export type Mutator<T> = (mutator: (value: T) => void) => void;
export type ArraySignal<T> = [
    value: Accessor<T[]>,
    mutate: Mutator<T[]>
];
/**
 * Creates a mutable array reactive state with a setter and mutator
 * ```ts
 * const [state, mutate] = createArraySignal<string>(["one", "two"]);
 * console.log(state()); // ["one", "two"]
 * mutate(vals => vals.push("three"));
 * console.log(state()); // ["one", "two", "three"]
 * ```
 * @param defaultValue Initial value of the state. If not set, will default to an empty array
 * @returns
 */
export declare function createArraySignal<T>(defaultValue?: T[]): ArraySignal<T>;
/**
 * An element reference used in component props
 */
export type PropsRef<T> = T | ((ref: T) => void) | undefined;
/**
 * Creates a signal that intercepts HTMLElement refs in component properties
 * ```tsx
 * interface props = {ref: PropsRef<HTMLDivElement>}
 * const [state, setState] = createPropRefSignal(props.ref);
 * return <div ref={setState}></div>;
 * ```
 * For more information about property refs, see {@link https://docs.solidjs.com/concepts/refs Refs}
 * @param propsRef The props.ref value you want to set
 * @returns The [getter, setter] of the referenced HTMLElement
 */
export declare function createPropsRefSignal<T>(propsRef: () => PropsRef<T>): [
    Accessor<T | undefined>,
    Setter<T | undefined>
];
/**
 * Creates an accessor that returns true when the component layout is complete
 * ```ts
 * const layoutComplete = createLayoutComplete();
 * ```
 * @returns An accessor that is true when the component layout is complete
 */
export declare function createLayoutComplete(): any;
export declare function useRenderMount(action: () => void): void;
/**
 * Creates a memo with that must be tracked and disposed of manually.
 * ```tsx
 * const [memo, disposeMemo] = createDisposableMemo(() => props.value + 1);
 * ```
 * NOTE: This will not be automatically tracked or cleaned up. It should only be used in cases where manual unsubscriptions are required.
 * @param fn The memo update function
 * @param initialValue The initial value (optional)
 * @returns
 */
export declare function createDisposableMemo<T>(fn: (v: T) => T, initialValue?: T): [
    Accessor<T>,
    () => void
];
export declare function createPolledSignal<T>(fn: (prev: T | undefined) => T, intervalMs: number): [
    Accessor<T>,
    () => void
];
/**
 * Creates a signal useful for animations
 * @param animationDurationMs Accessor getting the duration of the animation. For manually controlled start/stop, do not set. Default: undefined
 * @param autoStart Should the animation automatically start? Default: false
 * @returns [Accessor(animationTimeElapsed), Accessor(isAnimating), Setter(isAnimating)]
 */
export declare function createAnimationSignal(animationDurationMs?: Accessor<number>, autoStart?: boolean): [
    Accessor<number>,
    Accessor<boolean>,
    Setter<boolean>
];
export declare function createElementEventSignal<T extends keyof HTMLElementEventMap, E extends HTMLElementEventMap[T]>(element: HTMLElement, eventName: T): Accessor<E | undefined>;
export declare function createWindowEventSignal<T extends keyof WindowEventMap, E extends WindowEventMap[T]>(eventName: T): Accessor<E | undefined>;
/**
 * Creates a signal that only updates after a period of time has elapsed without changing
 * @param fn
 * @param intervalMs
 * @returns [Accessor<T>, Setter<T>, Accessor<T>, Accessor<T>] = [debounced value, live setter, is debouncing, live value]
 */
export declare function createDebouncedSignal<T>(intervalMs: number, initialValue: T): [
    Accessor<T>,
    Setter<T>,
    Accessor<boolean>,
    Accessor<T>
];
/**
 * Reactive utility to add a window event listener that automatically cleans up on component unmount
 * @param type The type of the window event
 * @param listener The event listener function
 * @param options Optional event listener options
 */
export declare function useWindowListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, //eslint-disable-line @typescript-eslint/no-explicit-any -- Window event listeners can have any return type
options?: boolean | AddEventListenerOptions): void;
