import { Input, makeStyles } from '@fluentui/react-components'
import React from 'react'
import { FieldComponentProps } from '../ShareLibs/Models';
import { UILabelRequire, UIRequireField } from '../ShareLibs/Shared';

const useStyles = makeStyles({
    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none"
    },
    styleOverField: {
        padding: "3px 0"
    },
    styleInputReadOnly: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",

        ":focus-within::after": {
            borderBottomColor: "#ccc",
        },
    },
    styleField: {
        display: "flex",
        gap: "4px",
        flexDirection: "row",

        "@media (max-width: 425px)": {
            display: "block"
        },
    }
})

function TextComponent({ setFieldValue, value, label, isDisable, isRequired, logicalName, fieldValue, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();
    if (isVisible)
        return (
            <div className={styles.styleOverField} key={logicalName}>
                <div className={styles.styleField}>
                    {
                        UILabelRequire(isRequired, isDisable, label)
                    }
                    {
                        !isDisable ?
                            <div style={{ width: "100%" }}>
                                <Input type={"text"} value={typeof value === "string" ? value : ""} onChange={(_, data) => {
                                    setFieldValue((currentValue) => {
                                        if (data.value) {
                                            return {
                                                ...currentValue,
                                                [logicalName]: { value: data.value }
                                            };
                                        }

                                        const newValue = { ...currentValue };
                                        delete newValue[logicalName];
                                        return newValue;
                                    });
                                }} className={styles.styleInput} placeholder={`---`} />
                                {
                                    isValid && !value && isRequired ? UIRequireField(label) : null
                                }
                            </div>
                            :
                            <Input type={"text"} value={typeof value === "string" ? value : ""} className={styles.styleInputReadOnly} readOnly />
                    }
                </div>
            </div>
        )
    return null;
}

export default TextComponent
