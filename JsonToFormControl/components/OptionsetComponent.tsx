import { Dropdown, Option, makeStyles, Input } from '@fluentui/react-components';
import React from 'react'
import { FieldComponentProps, jsonOptionsetControl } from '../ShareLibs/Models';
import { IconLock } from '../ShareLibs/Icons';

const useStyles = makeStyles({
    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
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

function OptionsetComponent({ isDisable, isRequired, options, setFieldValue, value, label, fieldValue, logicalName, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();
    const [_item, _setItem] = React.useState<jsonOptionsetControl>();
    const [optionsInit, setOptionsInit] = React.useState<jsonOptionsetControl[]>();

    React.useEffect(() => {
        if (options && options.length > 0) {
            const option: jsonOptionsetControl = {
                label: "--Select--",
                value: -1
            };
            setOptionsInit([option, ...options]);
        }
    }, [options])


    React.useEffect(() => {
        if (value !== undefined && value !== null && options) {
            const itemSelect = options.find(e => e.value === value);

            if (itemSelect) {
                _setItem(itemSelect);
            }
        }
    }, [value, options])

    const onOptionClick = (item: jsonOptionsetControl) => {
        _setItem(item);
    }

    React.useEffect(() => {
        if (_item) {
            setFieldValue({
                ...fieldValue,
                [logicalName]: {
                    value: _item.value,
                    label: _item.label
                }
            });
        }
    }, [_item])


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
                                <Dropdown selectedOptions={[_item?.value.toString() ?? '']} value={_item?.label ?? ''} className={styles.styleInput} placeholder={`---`} >
                                    {
                                        optionsInit?.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.value.toString()} onClick={() => { onOptionClick(item) }}>
                                                    {item.label}
                                                </Option>
                                            )
                                        })
                                    }
                                </Dropdown>
                                {
                                    isValid && (value == -1 || !value) && isRequired ? <span style={{ color: "red", fontSize: "12px", textShadow: "0 0 black" }}>{label}: Required fields must be filled in.</span> : null
                                }
                            </div>
                            :
                            <Input type={"text"} value={_item?.label ?? ''} className={styles.styleInputReadOnly} readOnly />
                    }
                </div>
            </div>
        )
    return null;
}

export default OptionsetComponent