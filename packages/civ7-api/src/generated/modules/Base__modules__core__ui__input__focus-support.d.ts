export declare namespace Focus {
    /**
     * Set the focus to a particular element within a context.
     * If the target is in the current active context, it will be focused immediately.
     * Otherswise, it will be set as the initial focus in all slots up the ancestor chain to the context.
     * @param target
     * @param context
     * @returns
     */
    function setContextAwareFocus(target: Element | null, context: Element | null): void;
}
