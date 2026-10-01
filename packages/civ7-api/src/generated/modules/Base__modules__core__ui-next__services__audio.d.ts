/**
 * Plays a sound
 * @param id The sound id to play
 * @param group The sound group to play - if none is specified "audio-base" will be used
 * @returns true if the sound was able to be played
 */
export declare function playSound(id: string, group?: string): boolean;
export declare class AudioGroupProvider {
    private groupName;
    private parent?;
    constructor(groupName: string, parent?: AudioGroupProvider | undefined);
    /**
     * Plays a sound for the given audio group context.
     * If the sound is overridden on the element, play it directly.
     * Otherwise, look it up in the audio data and play that.
     * If the sound is still unable to be played, try again in the parent context.
     * @param id The sound id to play
     * @param element the element playing the sound
     */
    playSound(id: string, element?: HTMLElement): void;
}
export declare const AudioGroupContext: any;
