export declare interface SidebarChooserProps {
    context: string;
    id: string;
    name: string;
    title: string;
    closeButtonAudioGroup: string | undefined;
    class?: string;
    /** Set to true when the chooser should close. */
    closing: boolean;
    /** Called when the close button is activated. */
    onClose?: () => void;
}
export declare const SidebarChooser: any;
