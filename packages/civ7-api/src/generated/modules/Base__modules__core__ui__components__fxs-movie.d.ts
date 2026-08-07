/**
 * @file fxs-movie.ts
 * @copyright 2023, Firaxis Games
 * @description Full screen panel designed to display "movie" animations
 */
import FxsActivatable from "/core/ui/components/fxs-activatable.js";
declare class FxsMovie extends FxsActivatable {
    private readyStateListener;
    private movieSkipListener;
    private moviePlayingListener;
    private movieEndedListener;
    private playbackStalledListener;
    private playbackResumedListener;
    private movieTimeUpdateListener;
    private movieErrorListener;
    private rafCheckReadyState;
    private currentMovie;
    private currentMovieSubtitles;
    private currentMovieType;
    private currentDisplayedSubtitle;
    private displayLocale;
    private displayResolution;
    private videoElement;
    private subtitleElement;
    private movieVariants;
    private showSubtitles;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    private onActivated;
    private onSkipMovie;
    private onCheckReadyState;
    private onMovieReadyToPlay;
    private onMoviePlaying;
    private onMovieTimeUpdate;
    private onMovieEnded;
    private onPlaybackStalled;
    private onPlaybackResumed;
    private onMovieError;
    private addVideoElement;
    private removeVideoElement;
    private addSubtitleElement;
    private clearMovie;
    private movieSort;
    private getMovieVariants;
    private playNextVariant;
    private playMovie;
    private updateBackdrop;
    private onAppInBackground;
    private onAppInForeground;
    private fetchSubtitles;
}
declare global {
    interface HTMLElementTagNameMap {
        "fxs-movie": ComponentRoot<FxsMovie>;
    }
}
export { FxsMovie as default };
