import { JSX } from "solid-js";
export declare class GameSetupStringCache {
    private stringCache;
    private composeCache;
    private stylizeCache;
    resolve(handle: GameSetupStringHandle): Record<number, string>;
    compose(handle: GameSetupStringHandle): Record<number, string>;
    stylize(handle: GameSetupStringHandle): Record<number, string>;
}
export declare const GameSetupStringCacheContext: any;
export declare function useGameSetupStringCacheContext(): any;
export interface GameSetupLocaleProps {
    handle: GameSetupStringHandle;
}
export type GameSetupStylizeProps = GameSetupLocaleProps & JSX.BaseHTMLAttributes<HTMLDivElement>;
/**
 * A collection of localiation components for game setup parameters
 */
export declare const L10nGameSetup: {
    /**
     * Compose game setup text using the Locale.Compose.
     * Generate text given a localization-syntax string
     * ```tsx
     * <L10n.Compose handle={param.name} />
     * ```
     * Default implementation: {@link Compose}
     * @param {GameSetupLocaleProps} props See {@link GameSetupLocaleProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {GameSetupStringHandle} props.handle The game setup string handle to compose.
     */
    Compose: any;
    /**
     * Compose text using the Locale.Stylize.
     * Convert a string or localized text containing stylized markup into HTML formatted text.
     * ```tsx
     * <L10n.Stylize handle={param.description} />
     * ```
     * Default implementation: {@link Stylize}
     * @param {GameSetupStylizeProps} props See {@link GameSetupStylizeProps} for a full list of properties
     *
     * Commonly Used Properties:
     * @param {GameSetupStringHandle} props.handle The  game setup string handle to stylize.
     */
    Stylize: any;
};
