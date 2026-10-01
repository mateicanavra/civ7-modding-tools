/**
 * @file tutorial-dialog.ts
 * @copyright 2021, Firaxis Games
 * @description A dialog box that is used to show (paginated) tutorial content.
 */
export default class TutorialDialogPage extends Component {
    private _index;
    private title;
    private subtitle;
    private body;
    private titleImage;
    private backgroundImages;
    get index(): number;
    onAttach(): void;
    private setImages;
    private setBackgroundImageInDiv;
    private setStringInDivClass;
}
export { TutorialDialogPage as Default };
