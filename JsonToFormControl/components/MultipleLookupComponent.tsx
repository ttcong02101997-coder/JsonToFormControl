import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
    Button,
    Card,
    FluentProvider,
    Input,
    InteractionTag,
    InteractionTagPrimary,
    InteractionTagSecondary,
    makeStyles,
    Option,
    Spinner,
    TagGroup,
    webLightTheme,
} from "@fluentui/react-components";
import { FieldComponentProps, jsonLookupControl } from "../ShareLibs/Models";
import { getLookupEntityDisplayName, getLookupRecords, UILabelRequire, UIRequireField } from "../ShareLibs/Shared";
import { NewIcon, SearchIcon } from "../ShareLibs/Icons";

const normalizeLookupId = (id: string): string => id.replace(/[{}]/g, "").toLowerCase();

const useStyles = makeStyles({
    field: {
        display: "flex",
        gap: "4px",
        flexDirection: "row",
        "@media (max-width: 425px)": { display: "block" },
    },
    input: {
        background: "#f5f5f5",
        width: "100%",
        border: "1px solid transparent",
        borderRadius: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    inputControl: { flex: 1, minWidth: 0, width: "100%", border: "none", background: "transparent" },
    container: { width: "100%", position: "relative" },
    tags: { gap: "4px", flexWrap: "wrap", width: "100%", minWidth: 0, boxSizing: "border-box" },
    tagButton: {
        border: "none",
        backgroundColor: "#ebf5ff",
        color: "rgb(17, 94, 163)",
        fontSize: "14px",
        ":hover": { backgroundColor: "rgb(207, 228, 250)" },
    },
    card: {
        position: "fixed",
        zIndex: 999999,
        width: "auto",
        padding: "5px",
        minHeight: "unset",
        maxHeight: "350px",
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
    option: {
        paddingLeft: "12px",
        paddingRight: "12px",
        "& .fui-Option__checkIcon": { display: "none" },
        margin: "3px 0",
        borderRadius: "4px",
        backgroundColor: "white",
        boxShadow: "0 4px 8px -6px rgba(0, 0, 0, 0.55)",
        overflow: "hidden",
    },
});

function MultipleLookupComponent({
    setFieldValue,
    value,
    entityName,
    context,
    isDisable,
    isRequired,
    label,
    fieldValue,
    logicalName,
    lookupRelated,
    lookupSubNameAttr,
    isValid,
    isVisible,
}: FieldComponentProps) {
    const styles = useStyles();
    const storedLookups = value && typeof value === "object" && !Array.isArray(value) ? value.lookups ?? [] : [];
    const selectedLookups = storedLookups.filter((lookup, index, lookups) =>
        lookups.findIndex(item => normalizeLookupId(item.id) === normalizeLookupId(lookup.id)) === index
    );
    const [options, setOptions] = useState<jsonLookupControl[]>([]);
    const [keyword, setKeyword] = useState("");
    const [openCard, setOpenCard] = useState(false);
    const [loading, setLoading] = useState(false);
    const [entityDisplayName, setEntityDisplayName] = useState(entityName ?? "");
    const [popupPosition, setPopupPosition] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!context || !entityName) {
            setEntityDisplayName(entityName ?? "");
            return;
        }

        void getLookupEntityDisplayName(context, entityName).then(setEntityDisplayName);
    }, [context, entityName]);

    const updatePopupPosition = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const shouldOpenAbove = window.innerHeight - rect.bottom < 350;
        setPopupPosition({
            left: rect.left,
            right: window.innerWidth - rect.right,
            top: shouldOpenAbove ? undefined : rect.bottom,
            bottom: shouldOpenAbove ? window.innerHeight - rect.top : undefined,
        });
    };

    const updateValues = (lookups: jsonLookupControl[]) => {
        const normalizedLookups = lookups.map(({ id, name, entityName }) => ({
            id,
            name,
            entityName,
        }));

        setFieldValue(currentValue => {
            if (normalizedLookups.length === 0) {
                const next = { ...currentValue };
                delete next[logicalName];
                return next;
            }
            return { ...currentValue, [logicalName]: { lookups: normalizedLookups } };
        });
    };

    const refreshOptions = async (excludedLookups: jsonLookupControl[], searchKeyword: string) => {
        if (!context || !entityName) return;

        setLoading(true);
        try {
            const records = await getLookupRecords(context, entityName, lookupRelated ?? [], lookupSubNameAttr ?? "", fieldValue, searchKeyword);
            setOptions(records.filter(item => !excludedLookups.some(selected => normalizeLookupId(selected.id) === normalizeLookupId(item.id))));
        } finally {
            setLoading(false);
        }
    };

    const chooseLookup = async (lookup: jsonLookupControl) => {
        const nextLookups = selectedLookups.some(item => normalizeLookupId(item.id) === normalizeLookupId(lookup.id))
            ? selectedLookups
            : [...selectedLookups, lookup];

        updateValues(nextLookups);
        setKeyword("");
        await refreshOptions(nextLookups, "");
    };

    const removeLookup = async (id: string) => {
        const nextLookups = selectedLookups.filter(item => item.id !== id);
        updateValues(nextLookups);

        if (openCard) {
            await refreshOptions(nextLookups, keyword);
        }
    };

    const openLookupDialog = async () => {
        if (!context || !entityName) return;
        updatePopupPosition();
        setOpenCard(true);
        await refreshOptions(selectedLookups, keyword);
    };

    const openAdvancedLookup = async () => {
        if (!context || !entityName) return;
        setOpenCard(false);
        setLoading(true);
        try {
            const results = await context.utils.lookupObjects({
                allowMultiSelect: true,
                defaultEntityType: entityName,
                entityTypes: [entityName],
                viewIds: [],
            });
            const newLookups = results
                .filter(result => result.id && result.name && result.entityType)
                .map(result => ({ id: result.id, name: result.name ?? "", entityName: result.entityType }));
            const mergedLookups = [...selectedLookups, ...newLookups].filter((lookup, index, lookups) =>
                lookups.findIndex(item => normalizeLookupId(item.id) === normalizeLookupId(lookup.id)) === index
            );
            updateValues(mergedLookups);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!openCard) return;
        const handleMouseDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!containerRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpenCard(false);
        };
        const handleViewportChange = () => updatePopupPosition();
        document.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("scroll", handleViewportChange, true);
        window.addEventListener("resize", handleViewportChange);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("scroll", handleViewportChange, true);
            window.removeEventListener("resize", handleViewportChange);
        };
    }, [openCard]);

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

    if (!isVisible) return null;

    return (
        <>
            {loading && <Spinner size="medium" label="Loading..." style={{ position: "fixed", inset: 0 }} />}
            <div style={{ padding: "3px 0" }}>
                <div className={styles.field}>
                    {
                        UILabelRequire(isRequired, isDisable, label)
                    }
                    <div style={{ width: "100%" }}>
                        {!isDisable ? (
                            <div className={styles.container} ref={containerRef}>
                                <div className={styles.input}>
                                    <TagGroup className={styles.tags}>
                                        {selectedLookups.map(item => (
                                            <InteractionTag key={item.id} value={item.id}>
                                                <InteractionTagPrimary className={styles.tagButton} hasSecondaryAction onClick={() => void window.Xrm.Navigation.navigateTo({ pageType: "entityrecord", entityName: item.entityName, entityId: item.id }, { target: 2, position: 1, width: { value: 80, unit: "%" }, height: { value: 70, unit: "%" } })}>
                                                    <span style={{ textDecoration: "underline" }}>{item.name}</span>
                                                </InteractionTagPrimary>
                                                <InteractionTagSecondary className={styles.tagButton} onClick={() => void removeLookup(item.id)} />
                                            </InteractionTag>
                                        ))}
                                        <Input className={styles.inputControl} value={keyword} placeholder={selectedLookups.length == 0 ? `Look up ${entityDisplayName}` : ""} onChange={(_, data) => setKeyword(data.value)} onClick={() => void openLookupDialog()} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void openLookupDialog(); } }} />
                                    </TagGroup>
                                    <Button appearance="transparent" icon={SearchIcon} onClick={() => void openLookupDialog()} />
                                </div>
                                {openCard && ReactDOM.createPortal(
                                    <FluentProvider theme={webLightTheme}>
                                        <Card className={styles.card} ref={popupRef} style={popupPosition}>
                                            <div className={styles.popupHeader}>{entityDisplayName}</div>
                                            <div style={{ marginBottom: 45, maxHeight: "350px", overflow: "auto", height: "fit-content" }}>
                                                {loading ? <Option className={styles.option} text="Loading...">Loading...</Option> : options.length === 0 ? <Option className={styles.option} text="No records found">No records found</Option> : options.map((item: jsonLookupControl, index: number) => <Option key={item.id} className={styles.option} onClick={() => void chooseLookup(item)} text={item.name}><div><div>{item.name}</div><span style={{ fontSize: 11 }}>{item.subName ?? ""}</span></div></Option>)}
                                            </div>
                                            <div style={{ position: "absolute", bottom: 0, background: "white", padding: "5px 0", borderTop: "1px solid #ccc", right: 0, left: 0, display: "flex", justifyContent: "space-between" }}>
                                                <Button appearance="transparent" icon={NewIcon} onClick={() => void clickNewRecordLookup()}>New</Button>
                                                <Button appearance="transparent" icon={SearchIcon} onClick={() => void openAdvancedLookup()}>Advanced</Button>
                                            </div>
                                        </Card>
                                    </FluentProvider>,
                                    document.body
                                )}
                            </div>
                        ) : selectedLookups.length > 0 ? <TagGroup className={styles.tags}>{selectedLookups.map(item => <InteractionTag key={item.id}><InteractionTagPrimary className={styles.tagButton} onClick={() => void window.Xrm.Navigation.navigateTo({ pageType: "entityrecord", entityName: item.entityName, entityId: item.id }, { target: 2, position: 1, width: { value: 80, unit: "%" }, height: { value: 70, unit: "%" } })}>{item.name}</InteractionTagPrimary></InteractionTag>)}</TagGroup> : null}
                        {isValid && selectedLookups.length === 0 && isRequired ? UIRequireField(label) : null}
                    </div>
                </div>
            </div>
        </>
    );
}

export default MultipleLookupComponent;