import { makeStyles, Switch } from '@fluentui/react-components';
import { FieldComponentProps } from '../ShareLibs/Models';
import React, { useEffect } from 'react';
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
    styleField: {
        display: "flex",
        gap: "4px",
        flexDirection: "row",

        "@media (max-width: 425px)": {
            display: "block"
        },
    }
})

function BooleanComponent({ setFieldValue, value, isDisable, isRequired, label, logicalName, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();

    useEffect(() => {
        setFieldValue((currentFieldValue) => {
            if (typeof currentFieldValue[logicalName]?.value === "boolean") {
                return currentFieldValue;
            }

            return {
                ...currentFieldValue,
                [logicalName]: {
                    ...currentFieldValue[logicalName],
                    value: false
                }
            };
        });
    }, [logicalName, setFieldValue]);

    const onChange = (_event: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean }) => {
        setFieldValue((currentFieldValue) => ({
            ...currentFieldValue,
            [logicalName]: {
                ...currentFieldValue[logicalName],
                value: data.checked
            }
        }));
    };

    if (isVisible)
        return (
            <div className={styles.styleOverField} key={logicalName}>
                <div className={styles.styleField}>
                    {
                        UILabelRequire(isRequired, isDisable, label)
                    }
                    <div style={{ width: "100%" }}>
                        <Switch
                            checked={value === true}
                            disabled={isDisable}
                            onChange={onChange}
                        />
                        {
                            !isDisable && isValid && value == undefined && isRequired ? UIRequireField(label) : null
                        }
                    </div>
                </div>
            </div>
        )
    return null;
}

export default BooleanComponent