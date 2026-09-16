import { makeStyles, Textarea } from '@fluentui/react-components'
import React from 'react'
import { FieldComponentProps } from '../ShareLibs/Models';
import { IconLock } from '../ShareLibs/Icons';

const useStyles = makeStyles({
    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",

        "& textarea": {
            fontSize: "14px",
        },
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
        gap: "2px",
        flexDirection: "row",

        "@media (max-width: 425px)": {
            display: "block"
        },
    }
})

function MultipleComponent({ setFieldValue, value, isDisable, isRequired, label, fieldValue, logicalName, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();

    if (isVisible)
        return (
            <div className={styles.styleOverField} key={logicalName}>
                <div className={styles.styleField}>
                    <div style={{ minWidth: 180, display: "flex", gap: "2px", flexDirection: "row" }}>
                        <label style={{ paddingBlockStart: 2, marginInlineEnd: 4, width: "100%", marginBottom: 5 }}>{label}</label>
                        {isRequired ? <span style={{ color: "red", paddingBlockStart: 2, marginInlineEnd: 2, textShadow: "0 0 black" }}>*</span> : <span style={{ color: "white", paddingBlockStart: 2, marginInlineEnd: 2 }}>*</span>}
                        {isDisable ? <IconLock /> : null}
                    </div>

                    {
                        !isDisable ?
                            <div style={{ width: "100%" }}>
                                <Textarea value={typeof value === "string" ? value : ""} onChange={(_, data) => {
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
                                }} className={styles.styleInput} size='large' resize="none" style={{ border: "none", }} placeholder={`---`} />
                                {
                                    isValid && !value && isRequired ? <span style={{ color: "red", fontSize: "12px", textShadow: "0 0 black" }}>{label}: Required fields must be filled in.</span> : null
                                }
                            </div>
                            :
                            <Textarea value={typeof value === "string" ? value : ""} className={styles.styleInputReadOnly} size='large' readOnly resize="none" style={{ border: "none" }} />
                    }
                </div>
            </div>
        )
    return null;
}

export default MultipleComponent