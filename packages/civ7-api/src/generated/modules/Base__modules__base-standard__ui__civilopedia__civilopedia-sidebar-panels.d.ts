export declare abstract class PediaSidebarPanel extends Component {
    private boundRefresh;
    private sectionID;
    private pageID;
    private rafID;
    onAttach(): void;
    onDetach(): void;
    onAttributeChanged(name: string, _oldValue: string | null, newValue: string | null): void;
    protected queueRefresh(): void;
    protected abstract refresh(sectionId: string, pageId: string): void;
    private doRefresh;
}
