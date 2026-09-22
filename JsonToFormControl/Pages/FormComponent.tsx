import React from 'react'
import { IInputs } from '../generated/ManifestTypes';
import { Card, FluentProvider, makeStyles, webLightTheme } from '@fluentui/react-components';
import { useEffect, useRef, useState } from 'react';
import { fieldValueProps, jsonControl, jsonFormControl, jsonFormSection } from '../ShareLibs/Models';
import RenderFieldComponent from './RenderFieldComponent';
import { findElementUp, setFieldDisabled, setFieldRequired, setFieldVisibility } from '../ShareLibs/Shared';

export interface FormComponentProps {
    context: ComponentFramework.Context<IInputs>;
    fieldProperty: string;
    jsonProperty: string | null;
    callback: (e: string) => void;
}

const useStyles = makeStyles({
    overColumnStyle: {
        flexWrap: "wrap",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",

        "@media (max-width: 1024px)": {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr)) !important",
        },

        "@media (max-width: 786px)": {
            gridTemplateColumns: "1fr !important",
        },
    },
    singleColumnStyle: {
        flexWrap: "wrap",
        display: "grid",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
        gridTemplateColumns: "1fr !important",
    },
    columnStyle: {
        padding: 0,
        boxShadow: "none",
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
    },
    sectionCard: {
        padding: 0,
        margin: 0,
        boxShadow: "none",
        marginLeft: "2px"
    }
})

function FormComponent({ context, fieldProperty, jsonProperty, callback }: FormComponentProps) {
    const styles = useStyles();
    const [dataJson, setDataJson] = useState<jsonFormControl | null>(null);
    const [fieldValue, setFieldValue] = useState<Record<string, fieldValueProps>>({});
    const [isValid, setIsValid] = useState<boolean>(false);
    const isDisabled = context.mode.isControlDisabled;
    const [dateFormat, setDateFormat] = useState<string>("");
    const [dateTimeFormat, setDateTimeFormat] = useState<string>("");
    const [logicalNameForm, setLogicalNameForm] = useState<string>("");
    const lastEmittedFieldValue = useRef<string | null>(null);
    const isInitialFieldValue = useRef(true);

    useEffect(() => {
        const dateFormattingInfo = context.userSettings.dateFormattingInfo;
        const userDateFormat = dateFormattingInfo.shortDatePattern;
        const userTimeFormat = dateFormattingInfo.shortTimePattern;

        setDateFormat(
            typeof userDateFormat === "string"
                ? userDateFormat
                : ""
        );
        setDateTimeFormat(
            typeof userDateFormat === "string" &&
                typeof userTimeFormat === "string"
                ? `${userDateFormat} ${userTimeFormat}`
                : ""
        );
    }, [context]);

    const dataJsonRef = useRef<jsonFormControl | null>(null);

    useEffect(() => {
        dataJsonRef.current = dataJson;
    }, [dataJson]);

    useEffect(() => {
        window.setVisibleField = (logicalName: string, visible: boolean) => {
            if (!dataJsonRef.current) {
                return;
            }

            const newJson: string = setFieldVisibility(dataJsonRef.current, logicalName, visible);
            setDataJson(JSON.parse(newJson) as jsonFormControl);
        };

        window.setRequiredField = (logicalName: string, required: boolean) => {
            if (!dataJsonRef.current) {
                return;
            }

            const newJson: string = setFieldRequired(dataJsonRef.current, logicalName, required);
            setDataJson(JSON.parse(newJson) as jsonFormControl);
        };

        window.setDisabledField = (logicalName: string, disabled: boolean) => {
            if (!dataJsonRef.current) {
                return;
            }

            const newJson: string = setFieldDisabled(dataJsonRef.current, logicalName, disabled);
            setDataJson(JSON.parse(newJson) as jsonFormControl);
        };
        return () => {
            delete window.setVisibleField;
            delete window.setRequiredField;
            delete window.setDisabledField;
        };
    }, []);

    useEffect(() => {
        if (!isDisabled) {
            return;
        }

        const logicalName = context.parameters.fieldProperty.attributes?.LogicalName;

        if (!logicalName) {
            return;
        }

        const elm = document.getElementById(logicalNameForm);
        const iconLockD365b = findElementUp(elm, logicalName);
        iconLockD365b?.remove();

    }, [isDisabled, logicalNameForm]);

    useEffect(() => {
        const formContext = window.parent.Xrm?.Page;

        if (!formContext) {
            return;
        }

        const hasFieldValue = (field: jsonControl): boolean => {
            const currentValue = fieldValue[field.logicalName];

            if (!currentValue) {
                return false;
            }

            if (field.type === "lookup") {
                return Boolean(currentValue.id);
            }

            if (field.type === "multiplelookup") {
                return (currentValue.lookups?.length ?? 0) > 0;
            }

            if (field.type === "boolean") {
                return typeof currentValue.value === "boolean";
            }

            if (field.type === "optionset") {
                return currentValue.value !== undefined && currentValue.value !== null && currentValue.value !== -1;
            }

            return currentValue.value !== undefined && currentValue.value !== null && currentValue.value !== "";
        };

        const handleFormSave = (executionContext: Xrm.Events.SaveEventContext): void => {
            const eventArgs = executionContext.getEventArgs();
            const hasMissingRequiredField = dataJson?.sections.some((section: jsonFormSection) =>
                Object.values(section.sectionControls).some((fields: jsonControl[]) =>
                    fields.some((field: jsonControl) => field.required && !hasFieldValue(field))
                )
            ) ?? false;

            setIsValid(hasMissingRequiredField);

            if (hasMissingRequiredField) {
                eventArgs.preventDefault();

                formContext.ui.setFormNotification(
                    "Please enter all required information.",
                    "ERROR",
                    "PCF_VALIDATION"
                );

                return;
            }
            else {
                formContext.ui.clearFormNotification("PCF_VALIDATION");
            }
        };

        formContext.data.entity.addOnSave(handleFormSave);

        return () => {
            formContext.data.entity.removeOnSave(handleFormSave);
        };
    }, [dataJson, fieldValue]);

    useEffect(() => {
        const serializedFieldValue = JSON.stringify(fieldValue);
        lastEmittedFieldValue.current = serializedFieldValue;
        if (!isInitialFieldValue.current) {
            callback(serializedFieldValue);
        }
        isInitialFieldValue.current = false;
    }, [fieldValue])

    useEffect(() => {
        if (fieldProperty && fieldProperty !== 'val') {
            if (fieldProperty === lastEmittedFieldValue.current) {
                return;
            }

            try {
                const parsed: unknown = JSON.parse(fieldProperty);
                const parsedFieldValue = parsed as Record<string, fieldValueProps>;
                if (JSON.stringify(parsedFieldValue) !== JSON.stringify(fieldValue)) {
                    setFieldValue(parsedFieldValue);
                }
            } catch {
                if (Object.keys(fieldValue).length > 0) {
                    setFieldValue({});
                }
            }
        }
    }, [fieldProperty]);

    useEffect(() => {
        if (!jsonProperty || jsonProperty === "val") {
            setDataJson(null);
            setLogicalNameForm("");
            return;
        }

        try {
            const parsed = JSON.parse(jsonProperty) as jsonFormControl;

            setDataJson(parsed);
            setLogicalNameForm(parsed.formLogicalName);
        } catch {
            setDataJson(null);
            setLogicalNameForm("");
        }
    }, [jsonProperty]);

    return (
        <FluentProvider theme={webLightTheme} style={{ width: "100%" }}>
            {
                dataJson ? (
                    <div id={dataJson.formLogicalName}>
                        {dataJson.sections.map((section: jsonFormSection) => {
                            const columns = Object.keys(section.sectionControls);
                            return (
                                <Card key={`${section.sectionLogicalName}`} className={!dataJson.sectionBox ? styles.sectionCard : ""} style={{ margin: 0 }}>
                                    {
                                        section.showLabel ? <div style={{ fontWeight: 600, textTransform: "uppercase" }}>{section.sectionLabel}</div> : null
                                    }
                                    <div className={`${columns.length === 1 ? styles.singleColumnStyle : styles.overColumnStyle}`}>
                                        {
                                            Object.keys(section.sectionControls).map((column: string) => (
                                                <Card className={styles.columnStyle} key={`${section.sectionLogicalName}-${column}`}>
                                                    {
                                                        section.sectionControls[column]?.map((field: jsonControl) => {
                                                            return (
                                                                <RenderFieldComponent
                                                                    key={field.logicalName}
                                                                    context={context}
                                                                    isDisable={isDisabled}
                                                                    objControl={field}
                                                                    fieldValue={fieldValue}
                                                                    setFieldValue={setFieldValue}
                                                                    isValid={isValid}
                                                                    dateFormat={dateFormat}
                                                                    dateTimeFormat={dateTimeFormat}
                                                                />
                                                            )
                                                        })
                                                    }
                                                </Card>
                                            ))
                                        }
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : null
            }
        </FluentProvider>
    )
}

export default FormComponent