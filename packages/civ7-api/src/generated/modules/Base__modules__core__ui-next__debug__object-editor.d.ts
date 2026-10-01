import { Component } from "solid-js";
export interface IModelProxy {
    value: object;
    readonly name: string;
    readonly id: number;
}
export interface ObjectEditorProps {
    proxy?: IModelProxy;
    class: string;
}
export declare const ObjectEditorComponent: Component<ObjectEditorProps>;
export declare const ObjectEditor: any;
