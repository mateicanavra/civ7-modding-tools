/**
 * @file screen-credits.ts
 * @copyright 2024, Firaxis Games
 * @description Credits roll.
 *
 * Credits are represented by lines with a CRLF used to separate.
 * A default style is applied to each line unless a modifer is at the front of the line.
 * A modifier is specified in brackets: []
 * A comma between modifiers to specify more than one: [3,r]
 * Sometimes a modifier will mean to not display the line after it, but instead use that line as input: [m]BUILDING_TACO_GONG
 *
 * The list of modifiers are as follows:
 * 	0	no style
 * 	1	title style
 * 	2	sub-title style
 * 	3	role style
 * 	4	name style
 *  l	left align (models only)
 * 	c	center align (models only)
 * 	r	right align (models only)
 *  i	image
 *	m	model
 *	rm	remove model (deprecated)
 *	x	remove model
 *	s	scroll (NOT IMPL, default)
 *	f	fade (NOT IMPL)
 */
export declare const ScreenCreditsOpenedEventName: "screen-credits-opened";
declare class ScreenCreditsOpenedEvent extends CustomEvent<never> {
    constructor();
}
export declare const ScreenCreditsClosedEventName: "screen-credits-closed";
declare class ScreenCreditsClosedEvent extends CustomEvent<never> {
    constructor();
}
declare global {
    interface HTMLElementEventMap {
        [ScreenCreditsOpenedEventName]: ScreenCreditsOpenedEvent;
        [ScreenCreditsClosedEventName]: ScreenCreditsClosedEvent;
    }
}
export {};
