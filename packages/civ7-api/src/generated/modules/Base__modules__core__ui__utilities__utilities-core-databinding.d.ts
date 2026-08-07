/**
 * @file utilities-core-databinding.ts
 * @copyright 2020-2022, Firaxis Games
 * @description Helpers for formatting, injecting, and extracting infomation from the databinding attribute.
 * @link https://coherent-labs.com/Documentation/cpp-gt/df/dfb/_h_t_m_l_data_binding.html
 */
declare class Databind {
    /**
     * Bind an attribute to a value
     * @param {HTMLElement} target Target element
     * @param {string} label Name of the attribute
     * @param {string} value Value to bind to the attribute
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static attribute(target: HTMLElement, label: string, value: string, verbose?: boolean): void;
    /**
     * Create a DOM node for each element in the target array
     * @param {HTMLElement} target Parent element of the new nodes
     * @param {string} targetArray Nodes will be created for each element in this array
     * @param {string} iterator Iterator for the each new node
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static for(target: HTMLElement, targetArray: string, iterator: string, verbose?: boolean): void;
    /**
     * Helper function to create dropdown items with data bound key/value pairs
     * @param {HTMLElement} target Parent element of the new nodes
     * @param {string} targetArray Nodes will be created for each element in this array
     * @param {string} iterator Iterator for the each new node
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static dropdownItems(target: HTMLElement, targetArray: string, iterator: string, verbose?: boolean): void;
    /**
     * Displays the target element based on the condition
     * @param {HTMLElement} target Element to display if the condition is true
     * @param {string} condition If true, display the target element
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static if(target: HTMLElement, condition: string, verbose?: boolean): void;
    /**
     * Sets the target element's textContent to the data bound value
     * @param {HTMLElement} target Element that will have it's textContent bound to the value
     * @param {string} value Value to be bound to the element's textContent
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static value(target: HTMLElement, value: string, verbose?: boolean): void;
    /**
     * Insert the input HTML into the target DOM element
     * @param {HTMLElement} target Target element
     * @param {string} value HTML to be inserted into the target element
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static html(target: HTMLElement, value: string, verbose?: boolean): void;
    static loc(target: HTMLElement, value: string, verbose?: boolean): void;
    /**
     * Add/remove a class to the target element based on a condition
     * @param {HTMLElement} target
     * @param {string} className
     * @param {string} condition Condition may contain a data-bound iterator from elsewhere, using double-curly notation, e.g. "{{yieldIndex}} % 2 == 0"
     */
    static classToggle(target: HTMLElement, className: string, condition: string): void;
    /**
     * Useful for alternating row styling.
     * @param {HTMLElement} target
     * @param {string} styleName
     * @param {string} databoundIndex Specifically the string used in a wrapper databind for iterating in an array.
     */
    static alternatingClassStyle(target: HTMLElement, styleName: string, databoundIndex: string): void;
    /**
     * Access a specific style element within an object, and not the entire style class.
     * @param {HTMLElement} target
     * @param {string} styleWithDashes Expected to contain any dashes to correspond to CoHTML styles. "background-image" for example.
     * @param {string} value
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static style(target: HTMLElement, styleWithDashes: string, value: string, verbose?: boolean): void;
    /**
     * Databind to text using the magic-handshake Coherent l;ocalized text look up.
     * @param {HTMLElement} target
     * @param {string} value String key used to reference a localized string
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static locText(target: HTMLElement, value: string, verbose?: boolean): void;
    /**
     * Databind the background image using Coherent's special style define
     * @param {HTMLElement} target
     * @param {string} value The URL for an imaged to be set as the target's background-image
     * @param {boolean} verbose Optional. If true, output debug console messages
     */
    static bgImg(target: HTMLElement, value: string, verbose?: boolean): void;
    /**
     * Clear the target element's 'data-bind-attribute' attribute
     * @param {HTMLElement} target
     */
    static clearAttributes(target: HTMLElement): void;
    /**
     * Clear the target element's 'data-bind-class-toggle' attribute
     * @param {HTMLElement} target
     */
    static clearClassToggle(target: HTMLElement): void;
    /**
     * Databind simple tooltip text
     * @param {HTMLElement} target
     * @param {string} value Text to be bound to the element's tooltip
     */
    static tooltip(target: HTMLElement, value: string, verbose?: boolean): void;
}
export { Databind as default };
