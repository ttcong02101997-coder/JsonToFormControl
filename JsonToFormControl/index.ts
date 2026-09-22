import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import FormComponent, { FormComponentProps } from "./Pages/FormComponent";

export class JsonToFormControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private _fieldProperty = "";
    private _jsonProperty: string | null = null;
    private _pendingFieldProperty: string | null = null;

    constructor() {
        // Empty
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this._jsonProperty = context.parameters.fieldJson.raw ?? null;
        const incomingFieldProperty = context.parameters.fieldProperty.raw ?? "";
        if (this._pendingFieldProperty === null || incomingFieldProperty === this._pendingFieldProperty) {
            this._fieldProperty = incomingFieldProperty;
            this._pendingFieldProperty = null;
        }

        const FormComponentProps: FormComponentProps = {
            context,
            fieldProperty: this._fieldProperty,
            jsonProperty: this._jsonProperty,
            callback: (e) => {
                this._fieldProperty = e;
                this._pendingFieldProperty = e;
                this.notifyOutputChanged();
            }
        };

        return React.createElement(
            FormComponent, FormComponentProps
        );
    }

    public getOutputs(): IOutputs {
        return {
            fieldProperty: this._fieldProperty,
            fieldJson: this._jsonProperty ?? ""
        };
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
