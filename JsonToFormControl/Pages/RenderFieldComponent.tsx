import React from 'react'
import TextComponent from '../components/TextComponent';
import NumberComponent from '../components/NumberComponent';
import MultipleComponent from '../components/MultipleComponent';
import DateComponent from '../components/DateComponent';
import DateTimeComponent from '../components/DateTimeComponent';
import BooleanComponent from '../components/BooleanComponent';
import LookupComponent from '../components/LookupComponent';
import { IInputs } from '../generated/ManifestTypes';
import OptionsetComponent from '../components/OptionsetComponent';
import { fieldValueProps, jsonControl } from '../ShareLibs/Models';

interface RenderFieldComponentProps {
    fieldValue: Record<string, fieldValueProps>;
    setFieldValue: React.Dispatch<React.SetStateAction<Record<string, fieldValueProps>>>;
    context: ComponentFramework.Context<IInputs>;
    isDisable: boolean;
    objControl: jsonControl;
    isValid: boolean;
    dateFormat?: string;
    dateTimeFormat?: string;
}

function RenderFieldComponent({ fieldValue, setFieldValue, context, isDisable, objControl, isValid, dateFormat, dateTimeFormat }: RenderFieldComponentProps) {
    if (objControl.type == "number") {
        return (
            <NumberComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                isVisible={objControl.visible}
            />
        );
    }
    else if (objControl.type == "multiple") {
        return (
            <MultipleComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                isVisible={objControl.visible}
            />
        );
    }
    else if (objControl.type == "date") {
        return (
            <DateComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                dateFormat={dateFormat}
                isVisible={objControl.visible}
            />
        );
    }
    else if (objControl.type == "datetime") {
        return (
            <DateTimeComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                dateFormat={dateTimeFormat}
                isVisible={objControl.visible}
            />
        );
    }
    else if (objControl.type == "boolean") {
        return (
            <BooleanComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                isVisible={objControl.visible}
            />
        );
    }
    else if (objControl.type == "lookup") {
        return (
            <LookupComponent
                key={objControl.logicalName}
                value={{
                    id: fieldValue[objControl.logicalName]?.id,
                    name: fieldValue[objControl.logicalName]?.name,
                    entityName: fieldValue[objControl.logicalName]?.entityName
                }}
                setFieldValue={setFieldValue}
                entityName={objControl.lookupEntity ?? ""}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                context={context}
                lookupRelated={objControl.lookupRelated}
                lookupSubNameAttr={objControl.lookupSubNameAttr}
                isValid={isValid}
                isVisible={objControl.visible}
            />
        );
    }
    else if (objControl.type == "optionset") {
        return (
            <OptionsetComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                options={objControl.items ?? []}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                isVisible={objControl.visible}
            />
        );
    }
    else {
        return (
            <TextComponent
                key={objControl.logicalName}
                value={fieldValue[objControl.logicalName]?.value}
                setFieldValue={setFieldValue}
                isRequired={objControl.required}
                isDisable={isDisable == true ? isDisable : objControl.disabled}
                label={objControl.displayName ?? ""}
                logicalName={objControl.logicalName}
                fieldValue={fieldValue}
                isValid={isValid}
                isVisible={objControl.visible}
            />
        );
    }
}

export default RenderFieldComponent