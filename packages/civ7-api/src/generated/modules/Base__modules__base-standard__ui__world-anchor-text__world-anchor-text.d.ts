/**
 * @file world-anchor-text.ts
 * @copyright 2021-2022, Firaxis Games
 * @description A text object that is attached to the 3D world and floats up.
 */
import { AnchorTextInterface } from "/base-standard/ui/world-anchor-text/world-anchor-text-manager.js";
export declare class AnchorText extends Component implements AnchorTextInterface {
    static ANCHOR_OFFSET: {
        x: number;
        y: number;
        z: number;
    };
    private _worldAnchorHandle;
    private trackingID;
    private animationEndListener;
    getID(): number;
    setID(newid: number): void;
    onAttach(): void;
    onDetach(): void;
    private onAnimationEnd;
    private makeWorldAnchor;
    private destroyWorldAnchor;
}
