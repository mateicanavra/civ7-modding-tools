/**
 * utilities-update-gate.ts
 * @copyright 2022-2024, Firaxis Games
 * @description Utility class serves to easily implement an update() function that can only be called once per frame
 */
export default class UpdateGate {
    /** Tracks the request id from the last requestAnimationFrame calls to prevent duplicate calls */
    private updateEventHandle;
    /** Store the strings passed into call(caller: string) so we can track who requested updates most recently */
    private callers;
    /** Function that will be called at the end of the frame when calls are queued */
    private updateFunction;
    /** What triggered this update. */
    get callTriggers(): string;
    /**
     * @param updateFunction Actually perform update against any queued calls.
     */
    constructor(updateFunction: Function);
    private onEndFrame;
    /**
     * Queue a request to call the update function during the next animation frame
     * @param caller A string used to identify where this call request is coming from. Ideally unique between call locations.
     */
    call(caller: string): void;
}
