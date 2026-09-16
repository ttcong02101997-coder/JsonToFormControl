import { Input, makeStyles } from "@fluentui/react-components";
import React from "react";
import { FieldComponentProps } from "../ShareLibs/Models";
import { IconLock } from "../ShareLibs/Icons";
import { formatNumber } from "../ShareLibs/Shared";

const useStyles = makeStyles({
    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
    },

    styleOverField: {
        padding: "3px 0",
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
});

const DECIMAL_PLACES = 2;

function NumberComponent({ setFieldValue, value, isDisable, isRequired, label, fieldValue, logicalName, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();
    const valueAsString = (input: FieldComponentProps["value"]): string => {
        if (input !== null && typeof input === "object") {
            return input.value === undefined ? "" : String(input.value);
        }

        return input === null || input === undefined ? "" : String(input);
    };

    const [data, setData] = React.useState<string>(
        valueAsString(value)
    );

    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        if (isFocused) {
            return;
        }

        if (value === null || value === undefined || value === "") {
            setData("");
            return;
        }

        setData(valueAsString(value));
    }, [value, isFocused]);

    React.useEffect(() => {
        const newData = { ...fieldValue };

        if (data.trim() === "") {
            delete newData[logicalName];
            setFieldValue(newData);
            return;
        }

        if (data.endsWith(".")) {
            return;
        }

        const numericValue = Number(data);

        if (Number.isNaN(numericValue)) {
            return;
        }

        newData[logicalName] = {
            value: numericValue,
        };

        setFieldValue(newData);
    }, [data]);

    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, inputData: { value: string }) => {
        let newValue = inputData.value;
        newValue = newValue.replace(/,/g, "");
        newValue = newValue.replace(/[^\d.]/g, "");

        const dotIndex = newValue.indexOf(".");

        if (dotIndex !== -1) {
            const integerPart = newValue.substring(0, dotIndex);
            const decimalPart = newValue
                .substring(dotIndex + 1)
                .replace(/\./g, "")
                .substring(0, DECIMAL_PLACES);

            newValue = `${integerPart}.${decimalPart}`;
        }

        setData(newValue);
    };

    const handleFocus = () => {
        setIsFocused(true);

        if (value !== null && value !== undefined) {
            setData(valueAsString(value));
        }
    };

    const handleBlur = () => {
        setIsFocused(false);

        if (data === "") {
            return;
        }

        const numericValue = Number(data);

        if (Number.isNaN(numericValue)) {
            return;
        }

        setData(formatNumber(numericValue, DECIMAL_PLACES));
    };

    const inputValue = isFocused ? data : data ? formatNumber(data, DECIMAL_PLACES) : "";

    if (isVisible)
        return (
            <div className={styles.styleOverField}>
                <div className={styles.styleField}>
                    <div style={{ minWidth: 180, display: "flex", gap: "2px", flexDirection: "row" }}>
                        <label style={{ paddingBlockStart: 2, marginInlineEnd: 4, width: "100%", marginBottom: 5 }}>{label}</label>
                        {isRequired ? <span style={{ color: "red", paddingBlockStart: 2, marginInlineEnd: 2, textShadow: "0 0 black" }}>*</span> : <span style={{ color: "white", paddingBlockStart: 2, marginInlineEnd: 2 }}>*</span>}
                        {isDisable ? <IconLock /> : null}
                    </div>

                    <div style={{ width: "100%" }}>
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={isDisable ? undefined : handleChange}
                            onFocus={isDisable ? undefined : handleFocus}
                            onBlur={isDisable ? undefined : handleBlur}
                            className={styles.styleInputReadOnly}
                            placeholder="---"
                            readOnly={isDisable}
                        />

                        {isValid &&
                            !value &&
                            isRequired ? (
                            <span style={{ color: "red", fontSize: "12px", textShadow: "0 0 black" }}>
                                {label}: Required fields must be filled in.
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    return null;
}

export default NumberComponent;