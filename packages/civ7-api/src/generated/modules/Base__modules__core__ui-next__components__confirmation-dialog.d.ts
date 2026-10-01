import { JSX } from "solid-js";
export interface ConfirmationDialogProps {
    /** The name of the tooltip. This is used for triggers and querries so it is not reactive and should not be changed after being set */
    name: string;
    /** The text to show on the accept button. Default: LOC_GENERIC_OK */
    acceptText?: string;
    /** The handler that gets called when this popup is accept */
    onAccept?: () => void;
    /** The text to show on the cancel button.  Default: LOC_GENERIC_CANCEL */
    cancelText?: string;
    /** The handler that gets called when this popup is canceled */
    onCancel?: () => void;
    /** The title to display in the popup */
    title?: JSX.Element;
    /** The content to display in the popup */
    content?: JSX.Element;
    /** Should this popup be auto-accepted and not shown? */
    autoAccept?: boolean;
}
export declare const ConfirmationDialog: any;
