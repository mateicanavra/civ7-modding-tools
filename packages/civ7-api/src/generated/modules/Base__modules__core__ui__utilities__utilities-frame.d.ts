/**
 * @file utilities-frame.ts
 * @copyright 2023, Firaxis Games
 * @description Utilties for customizing UI frames
 */
/**
 * Add this to any panel extension to add the ability to drag the window around the screen by grabbing the header with Right Click. Returns a function to remove event listeners.
 * @param root the root of the element you wish to make draggable. All that is required is a header.
 * @param selector the query of the element you wish to click and drag for dragability.
 */
export declare function MakeDraggable(root: HTMLElement, selector: string): () => void;
/**
 * Add this to any panel extension to add the ability to resize the window by clicking on the bottom-right corner. Returns a function to remove event listeners.
 * @param root the root of the element you wish to make draggable.
 */
export declare function MakeResizeable(root: ComponentRoot): () => void;
