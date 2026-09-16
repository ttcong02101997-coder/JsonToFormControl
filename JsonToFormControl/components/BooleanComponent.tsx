import { makeStyles, Switch } from '@fluentui/react-components';
import { FieldComponentProps } from '../ShareLibs/Models';
import React, { useCallback, useEffect, useState } from 'react';
import { IconLock } from '../ShareLibs/Icons';

const useStyles = makeStyles({
    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none"
    },
    styleOverField: {
        padding: "3px 0"
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

function BooleanComponent({ setFieldValue, value, isDisable, isRequired, label, fieldValue, logicalName, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();
    const [checked, setChecked] = useState(false);

    const _onChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setChecked(ev.currentTarget.checked);
        },
        [setChecked]
    );

    useEffect(() => {
        if (value != "" && value != undefined)
            setChecked(value as boolean);
    }, [value])

    useEffect(() => {
        setFieldValue({
            ...fieldValue,
            [logicalName]: {
                value: checked
            }
        });
    }, [checked])

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
                                <Switch
                                    checked={checked}
                                    onChange={_onChange}
                                />
                                {
                                    isValid && value == undefined && isRequired ? <span style={{ color: "red", fontSize: "12px", textShadow: "0 0 black" }}>{label}: Required fields must be filled in.</span> : null
                                }
                            </div>
                            :
                            <Switch
                                checked={checked}
                                onChange={(_event, data) => data.checked}
                                onClick={(e) => e.preventDefault()}
                                tabIndex={-1}
                            />
                    }
                </div>
            </div>
        )
    return null;
}

export default BooleanComponent