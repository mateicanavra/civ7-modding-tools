/**
 * Creates a signal from an existing debug widget.
 * @param id The id of the widget.  If a widget doesn't exist, a signal will still be created.
 * @returns The signal accessor for when the widget's value has changed.
 */
export declare function createSignalFromExistingDebugWidget(id: string): any;
/**
 * Registers a debug widget and returns a signal accessor for when that widget's value changes.
 * NOTE: The widget will be deleted on cleanup.
 * @param widget The definition of the widget
 * @returns The signal accessor for when the widget's value has changed.
 */
export declare function createSignalFromDebugWidget(widget: UIDebugWidgetDefinition): any;
