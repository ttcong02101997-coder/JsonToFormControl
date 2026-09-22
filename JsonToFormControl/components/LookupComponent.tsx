import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom';
import { FluentProvider, Input, InteractionTag, InteractionTagPrimary, InteractionTagSecondary, makeStyles, Option, TagGroup, Button, Card, CardFooter, Spinner, webLightTheme } from '@fluentui/react-components';
import { FieldComponentProps, jsonLookupControl } from '../ShareLibs/Models';
import { getLookupEntityDisplayName, getLookupRecords, UILabelRequire, UIRequireField } from '../ShareLibs/Shared';
import { SearchIcon, NewIcon } from '../ShareLibs/Icons';

const useStyles = makeStyles({
    customBtn: {
        border: "none",
        backgroundColor: "#ebf5ff",
        ":hover": {
            backgroundColor: "rgb(207, 228, 250)",
        },
        color: "rgb(17, 94, 163)",
        fontSize: "14px",
        height: "90%",
    },
    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "5px",
        color: "rgb(17, 94, 163)",
        fontSize: "14px",
        cursor: "pointer"
    },
    styleInputReadonly: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "5px",
        color: "rgb(17, 94, 163)",
        fontSize: "14px",
        cursor: "pointer",
        padding: "7px 8px"
    },

    styleInput1: {
        width: "100%",
        border: "none",
        borderRadius: "5px",
        background: "transparent"
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
    },
    overLookup: {
        paddingLeft: "6px"
    },
    divOver: {
        width: "100%",
        position: "relative"
    },
    cardStyles: {
        position: "fixed",
        zIndex: 999999,
        width: "auto",
        padding: "5px",
        minHeight: "unset",
        maxHeight: "350px",
        overflow: "auto",
        height: "fit-content",
        ["--fui-Card--size" as string]: "7px"
    },
    popupHeader: {
        position: "sticky",
        top: 0,
        zIndex: 1,
        padding: "8px 12px",
        margin: "-5px -5px 5px",
        backgroundColor: "white",
        borderBottom: "1px solid #ccc",
        color: "#323130",
        fontSize: "14px",
        fontWeight: 600,
        marginBottom: 0
    },
    optionStyle: {
        "& .fui-Option__checkIcon": {
            display: "none",
        },

        paddingLeft: "12px",
        paddingRight: "12px",
        margin: "3px 0",
        borderRadius: "4px",
        backgroundColor: "white",
        boxShadow: "0 4px 8px -6px rgba(0, 0, 0, 0.55)",
        overflow: "hidden",
    },

    readonlyField: {
        color: "rgb(17, 94, 163)",
        display: "inline-block",
        padding: "0px 5px 0px 0px",
        borderRadius: "4px",

    },
    styleTextReadonly: {
        textDecoration: "underline",
        cursor: "pointer",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        padding: "0px 5px"
    },
    styleButton: {
        border: "none",
        fontWeight: 400
    },
    tagPrimaryText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    }
});

function LookupComponent({ setFieldValue, value, entityName, context, isDisable, isRequired, label, fieldValue, logicalName, lookupRelated, lookupSubNameAttr, isValid, isVisible }: FieldComponentProps) {
    const styles = useStyles();
    const [_search, _setSearch] = React.useState<string>("");
    const [valueLookup, setValueLookup] = React.useState<jsonLookupControl | undefined>(undefined);
    const [options, setOptions] = React.useState<jsonLookupControl[]>([]);
    const [openCard, setOpenCard] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [popupPosition, setPopupPosition] = React.useState<React.CSSProperties>({});
    const [keyword, setKeyword] = React.useState<string>("");
    const [entityDisplayName, setEntityDisplayName] = React.useState<string>(entityName ?? "");
    const lookupValue = value && typeof value === "object" ? value as jsonLookupControl : undefined;
    const popupRef = useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!context || !entityName) {
            setEntityDisplayName(entityName ?? "");
            return;
        }

        void getLookupEntityDisplayName(context, entityName).then(setEntityDisplayName);
    }, [context, entityName]);

    const updatePopupPosition = () => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const rect = container.getBoundingClientRect();
        const popupHeight = 350;
        const shouldOpenAbove = window.innerHeight - rect.bottom < popupHeight;
        setPopupPosition({
            left: rect.left,
            right: window.innerWidth - rect.right,
            top: shouldOpenAbove ? undefined : rect.bottom,
            bottom: shouldOpenAbove ? window.innerHeight - rect.top : undefined,
        });
    };


    React.useEffect(() => {
        setValueLookup((currentValue) => {
            if (currentValue?.id === lookupValue?.id && currentValue?.name === lookupValue?.name && currentValue?.entityName === lookupValue?.entityName) {
                return currentValue;
            }
            return lookupValue?.id ? lookupValue : undefined;
        });
    }, [lookupValue?.id, lookupValue?.name, lookupValue?.entityName]);

    const updateLookupValue = (newValue: jsonLookupControl | undefined): void => {
        setValueLookup(newValue);

        if (newValue) {
            setFieldValue({
                ...fieldValue,
                [logicalName]: {
                    id: newValue.id,
                    name: newValue.name,
                    entityName: newValue.entityName,
                },
            });
        } else {
            const newData = { ...fieldValue };
            delete newData[logicalName];
            setFieldValue(newData);
        }
    };

    const viewLookup = async () => {
        setLoading(true);

        if (valueLookup != undefined) {
            await window.Xrm.Navigation.navigateTo({
                pageType: "entityrecord",
                entityName: valueLookup.entityName,
                entityId: valueLookup.id
            }, {
                target: 2,
                position: 1,
                width: { value: 80, unit: "%" },
                height: { value: 70, unit: "%" }
            });
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setLoading(false);
            });
        });
    }

    const openLookupDialog = async () => {
        setLoading(true);
        if (!containerRef.current) {
            setLoading(false);
            return;
        }

        updatePopupPosition();
        setOpenCard(true);

        try {
            const records = await getLookupRecords(context!, entityName!, lookupRelated!, lookupSubNameAttr!, fieldValue, keyword);
            setOptions(records);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!openCard) {
            return;
        }

        const handleMouseDown = (event: MouseEvent): void => {
            const target = event.target as Node;

            if (containerRef.current?.contains(target) || popupRef.current?.contains(target)) {
                return;
            }

            setOpenCard(false);
            setLoading(false);
        };

        const handleViewportChange = () => {
            updatePopupPosition();
        };

        document.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("scroll", handleViewportChange, true);
        window.addEventListener("resize", handleViewportChange);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("scroll", handleViewportChange, true);
            window.removeEventListener("resize", handleViewportChange);
        };
    }, [openCard]);

    const clickChooseLookup = (e: React.MouseEvent<HTMLElement>) => {
        const selectLookup: jsonLookupControl = {
            id: e.currentTarget.dataset.id!,
            name: e.currentTarget.dataset.name!,
            entityName: e.currentTarget.dataset.entityname!,
        };
        updateLookupValue(selectLookup);
        setOpenCard(false);
        setLoading(false);
        setKeyword("");
    }

    const openLookupDialogAdvance = async () => {
        setOpenCard(false);
        setLoading(false);
        setKeyword("");

        if (!entityName) {
            return;
        }

        const results = await context!.utils.lookupObjects({
            allowMultiSelect: false,
            defaultEntityType: entityName,
            entityTypes: [`${entityName}`],
            viewIds: [],
        });
        const selectedRecord = results?.[0];

        if (selectedRecord?.id && selectedRecord.name && selectedRecord.entityType) {
            updateLookupValue({
                id: selectedRecord.id,
                name: selectedRecord.name,
                entityName: selectedRecord.entityType,
            });
        }
    };

    const clickNewRecordLookup = () => {
        setLoading(true);
        setOpenCard(false);

        void window.Xrm.Navigation.navigateTo(
            {
                pageType: "entityrecord",
                entityName: entityName!,
            },
            {
                target: 2,
                position: 1,
                width: { value: 85, unit: "%" },
                height: { value: 80, unit: "%" },
            }
        );

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setLoading(false);
            });
        });
    };

    if (isVisible)
        return (
            <>
                {loading && (
                    <Spinner
                        size="medium"
                        label="Loading..."
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0
                        }}
                    />
                )}
                <div className={styles.styleOverField} key={logicalName}>
                    <div className={styles.styleField}>
                        {
                            UILabelRequire(isRequired, isDisable, label)
                        }

                        {
                            !isDisable ?

                                <div style={{ width: "100%" }}>
                                    <div className={styles.divOver} ref={containerRef}>
                                        {
                                            valueLookup?.id ?
                                                <div className={styles.styleInput} >
                                                    <TagGroup className={styles.overLookup}>
                                                        {valueLookup?.id ? (
                                                            <InteractionTag value={valueLookup.id} key={valueLookup.id}>
                                                                <InteractionTagPrimary
                                                                    hasSecondaryAction
                                                                    className={styles.customBtn}
                                                                    onClick={() => void viewLookup()}
                                                                    primaryText={{
                                                                        style: {
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            whiteSpace: "nowrap",
                                                                            minWidth: 0
                                                                        }
                                                                    }}
                                                                >
                                                                    {valueLookup.name}
                                                                </InteractionTagPrimary>

                                                                <InteractionTagSecondary
                                                                    onClick={() => {
                                                                        updateLookupValue(undefined);
                                                                    }}
                                                                    className={styles.customBtn}
                                                                    style={{ border: "none" }}
                                                                />
                                                            </InteractionTag>
                                                        )
                                                            : null
                                                        }
                                                    </TagGroup>
                                                    <Button
                                                        appearance="transparent"
                                                        icon={SearchIcon}
                                                        onClick={() => void openLookupDialog()}
                                                    />
                                                </div>
                                                : <div className={styles.styleInput} >
                                                    <Input
                                                        className={`${styles.styleInput1}`}
                                                        disabled={isDisable}
                                                        placeholder={`Look up ${entityDisplayName}`}
                                                        onClick={() => void openLookupDialog()}
                                                        onChange={(_, data) => setKeyword(data.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();

                                                                void openLookupDialog();
                                                            }
                                                        }}
                                                        value={keyword}
                                                    />

                                                    <Button
                                                        appearance="transparent"
                                                        icon={SearchIcon}
                                                        onClick={() => void openLookupDialog()}
                                                    />
                                                </div>
                                        }
                                        {
                                            openCard ? ReactDOM.createPortal(
                                                <FluentProvider theme={webLightTheme}>
                                                    <Card className={styles.cardStyles} ref={popupRef} style={popupPosition}>
                                                        <div className={styles.popupHeader}>{entityDisplayName}</div>
                                                        <div style={{ marginBottom: 45, maxHeight: "350px", overflow: "auto", height: "fit-content", }}>
                                                            {
                                                                loading ?
                                                                    <Option
                                                                        className={styles.optionStyle}
                                                                        onClick={(e: React.MouseEvent<HTMLElement>) => { clickChooseLookup(e) }}
                                                                        text="Loading..."
                                                                    >
                                                                        Loading...
                                                                    </Option>
                                                                    : options.length === 0 ?
                                                                        <Option className={styles.optionStyle} text="No records found">
                                                                            No records found
                                                                        </Option>
                                                                        :
                                                                        options.map((item: jsonLookupControl, index: number) => (
                                                                            <Option
                                                                                key={`${logicalName}-${item.id}`}
                                                                                className={styles.optionStyle}
                                                                                onClick={(e: React.MouseEvent<HTMLElement>) => { clickChooseLookup(e) }}
                                                                                data-id={item.id}
                                                                                data-name={item.name}
                                                                                data-entityname={item.entityName}
                                                                                text={item.name}
                                                                            >
                                                                                <div>
                                                                                    <div>{item.name}</div>
                                                                                    <span style={{ fontSize: 11 }}>{item.subName ?? ""}</span>
                                                                                </div>
                                                                            </Option>
                                                                        ))
                                                            }
                                                        </div>
                                                        <div style={{
                                                            position: "absolute",
                                                            bottom: 0,
                                                            background: "white",
                                                            padding: "5px 0",
                                                            borderTop: "1px solid #ccc",
                                                            right: 0,
                                                            left: 0
                                                        }}>
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                                                <Button
                                                                    appearance="transparent"
                                                                    icon={NewIcon}
                                                                    onClick={() => void clickNewRecordLookup()}
                                                                >New</Button>
                                                                <Button
                                                                    appearance="transparent"
                                                                    icon={SearchIcon}
                                                                    onClick={() => void openLookupDialogAdvance()}
                                                                >Advanced</Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </FluentProvider>,
                                                document.body
                                            ) : null
                                        }
                                    </div>

                                    {
                                        isValid && !valueLookup?.id && isRequired ? UIRequireField(label) : null
                                    }
                                </div>
                                :
                                <>
                                    {
                                        valueLookup ?
                                            <div className={`${styles.styleInputReadonly}`}>
                                                <div
                                                    className={`${styles.readonlyField} ${styles.styleTextReadonly}`}
                                                    onClick={() => void viewLookup()}
                                                    title={valueLookup?.name}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = "rgb(207, 228, 250)";
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = "";
                                                    }}
                                                >
                                                    {valueLookup?.name}
                                                </div>
                                            </div>
                                            :
                                            null
                                    }

                                </>
                        }
                    </div>
                </div >
            </>
        )
    return null;
}
export default LookupComponent