import { Input, makeStyles, tokens, } from "@fluentui/react-components";
import React, { useEffect, useMemo, useRef, useState, } from "react";
import { buildCalendarDays, formatDateValue, normalizeDate, parseInputDate, parseIsoDate, sameDate, toIsoDate } from "../ShareLibs/Shared";
import { IconLock } from "../ShareLibs/Icons";
import { FieldComponentProps } from "../ShareLibs/Models";

const useStyles = makeStyles({
    styleOverField: {
        padding: "3px 0",
    },

    wrapper: {
        position: "relative",
        width: "100%",
    },

    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
        boxSizing: "border-box",

        "& input": {
            paddingRight: "36px",
        },
    },

    styleField: {
        display: "flex",
        gap: "2px",
        flexDirection: "row",

        "@media (max-width: 425px)": {
            display: "block"
        },
    },
    calendarButton: {
        position: "absolute",
        right: "6px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: tokens.colorNeutralForeground3,
        borderRadius: "2px",

        ":hover": {
            background: tokens.colorNeutralBackground3Hover,
            color: tokens.colorNeutralForeground1,
        },
    },

    calendarIcon: {
        width: "16px",
        height: "16px",
    },

    styleInputReadOnly: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",

        ":focus-within::after": {
            borderBottomColor: "#ccc",
        },
    },

    calendarPopup: {
        position: "absolute",
        left: 0,
        zIndex: 999999,

        width: "280px",

        backgroundColor: "#ffffff",

        border: "1px solid #d1d1d1",
        borderRadius: "2px",

        boxShadow:
            "0 4px 8px rgba(0,0,0,.14), 0 8px 16px rgba(0,0,0,.14)",

        padding: "12px",

        boxSizing: "border-box",
    },

    calendarHeader: {
        display: "flex",
        alignItems: "center",
        height: "32px",
        marginBottom: "8px",
    },

    navigationButton: {
        width: "32px",
        height: "32px",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        color: tokens.colorNeutralForeground2,
        borderRadius: "2px",

        ":hover": {
            background: tokens.colorNeutralBackground3Hover,
        },
    },

    monthTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: "14px",
        fontWeight: 600,
        color: tokens.colorNeutralForeground1,
    },

    weekHeader: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        marginBottom: "2px",
    },

    weekDay: {
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 600,
        color: tokens.colorNeutralForeground3,
    },

    daysGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
    },

    dayButton: {
        width: "32px",
        height: "32px",
        padding: 0,
        margin: "1px",
        border: "none",
        borderRadius: "2px",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: tokens.colorNeutralForeground1,

        ":hover": {
            background: tokens.colorNeutralBackground3Hover,
        },
    },

    otherMonthDay: {
        color: tokens.colorNeutralForeground4,
    },

    todayDay: {
        boxShadow: `inset 0 0 0 1px ${tokens.colorBrandForeground1}`,
        fontWeight: 600,
    },

    selectedDay: {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralForegroundOnBrand,

        ":hover": {
            backgroundColor: tokens.colorBrandBackgroundHover,
        },
    },

    calendarFooter: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "8px",
        paddingTop: "8px",
        borderTop: "1px solid #edebe9",
    },

    todayButton: {
        border: "none",
        background: "transparent",
        color: tokens.colorBrandForeground1,
        cursor: "pointer",
        fontSize: "12px",
        padding: "5px 8px",
        borderRadius: "2px",

        ":hover": {
            background: tokens.colorNeutralBackground3Hover,
        },
    },
});

const DateComponent = ({ setFieldValue, value, isDisable, isRequired, label, logicalName, fieldValue, isValid, dateFormat, isVisible }: FieldComponentProps) => {
    const styles = useStyles();
    const trimmedFormat = dateFormat?.trim();
    const format = trimmedFormat === undefined || trimmedFormat === "" ? "dd/MM/yyyy" : trimmedFormat;

    const [date, setDate] = useState<string>(() => normalizeDate(value));
    const [inputValue, setInputValue] = useState<string>("");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarAbove, setCalendarAbove] = useState(false);
    const [inputError, setInputError] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const calendarButtonRef = useRef<HTMLButtonElement>(null);

    const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
        const normalized =
            normalizeDate(value);

        return (
            parseIsoDate(normalized) ??
            new Date()
        );
    });

    const updateCalendarPosition = (): void => {
        const wrapper = wrapperRef.current;
        if (!wrapper) {
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        setCalendarAbove(window.innerHeight - rect.bottom < 350);
    };


    useEffect(() => {
        const normalized = normalizeDate(value);
        setDate(normalized);
        setInputValue(normalized ? formatDateValue(normalized, format) : "");

        const parsed = parseIsoDate(normalized);

        if (parsed) {
            setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
        }
    }, [value, format]);

    const openCalendar = (): void => {
        if (isDisable) {
            return;
        }

        const selected = parseIsoDate(date);
        if (selected) {
            setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
        } else {
            const today = new Date();

            setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        }

        updateCalendarPosition();
        setIsCalendarOpen(true);
    };


    useEffect(() => {
        if (!isCalendarOpen) {
            return;
        }

        const handleMouseDown = (event: MouseEvent): void => {
            const target = event.target as Node;

            if (wrapperRef.current?.contains(target) || popupRef.current?.contains(target)) {
                return;
            }

            setIsCalendarOpen(false);
        };

        document.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("scroll", updateCalendarPosition, true);
        window.addEventListener("resize", updateCalendarPosition);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("scroll", updateCalendarPosition, true);
            window.removeEventListener("resize", updateCalendarPosition);
        };
    }, [isCalendarOpen]);


    const updateValue = (isoDate: string): void => {
        const newData = {
            ...fieldValue,
        };

        if (isoDate) {
            newData[logicalName] = {
                value: isoDate,
            };
        } else {
            delete newData[logicalName];
        }

        setFieldValue(newData);
    };


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const text = event.target.value;

        setInputValue(text);

        if (!text.trim()) {
            setDate("");
            setInputError("");
            updateValue("");
            return;
        }

        const parsed = parseInputDate(text, format);

        if (parsed) {
            setDate(parsed);
            setInputError("");
            updateValue(parsed);

            const parsedDate = parseIsoDate(parsed);

            if (parsedDate) {
                setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
            }
        } else {
            const digits = text.replace(/\D/g, "");

            if (digits.length >= 6) {
                setInputError("Invalid date");
            } else {
                setInputError("");
            }
        }
    };

    const handleInputBlur = (): void => {
        if (!inputValue.trim()) {
            return;
        }

        const parsed = parseInputDate(inputValue, format);

        if (!parsed) {
            setInputError("Invalid date");
            return;
        }

        setDate(parsed);
        setInputValue(formatDateValue(parsed, format));
        setInputError("");
    };

    const handleSelectDate = (selectedDate: Date): void => {
        const isoDate = toIsoDate(selectedDate);

        setDate(isoDate);
        setInputValue(formatDateValue(isoDate, format));
        setInputError("");
        updateValue(isoDate);
        setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        setIsCalendarOpen(false);
    };

    const handleToday = (): void => {
        handleSelectDate(new Date());
    };

    const handlePreviousMonth = (): void => {
        setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    };

    const handleNextMonth = (): void => {
        setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    };

    const calendarDays = useMemo(() =>
        buildCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth()),
        [calendarMonth]
    );

    const selectedDate = parseIsoDate(date);

    const today = new Date();

    const monthTitle = calendarMonth.toLocaleDateString(undefined,
        {
            month: "long",
            year: "numeric",
        }
    );

    const weekDays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
    ];

    const readonlyValue = date ? formatDateValue(date, format) : "";

    if (isVisible)
        return (
            <div className={styles.styleOverField} key={logicalName}>
                <div className={styles.styleField}>
                    <div style={{ minWidth: 180, display: "flex", gap: "2px", flexDirection: "row" }}>
                        <label style={{ paddingBlockStart: 2, marginInlineEnd: 4, width: "100%", marginBottom: 5, }}>{label}</label>
                        {isRequired ? <span style={{ color: "red", paddingBlockStart: 2, marginInlineEnd: 2, textShadow: "0 0 black" }}>*</span> : <span style={{ color: "white", paddingBlockStart: 2, marginInlineEnd: 2 }}>*</span>}
                        {isDisable ? <IconLock /> : null}
                    </div>
                    {!isDisable ? (
                        <div style={{ width: "100%", }}>
                            <div ref={wrapperRef} className={styles.wrapper}>
                                <Input
                                    type="text"
                                    value={inputValue}
                                    placeholder="---"
                                    className={styles.styleInput}
                                    onChange={
                                        handleInputChange
                                    }
                                    onBlur={
                                        handleInputBlur
                                    }
                                />

                                <button ref={calendarButtonRef}
                                    type="button"
                                    className={styles.calendarButton}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                    }}
                                    onClick={
                                        openCalendar
                                    }
                                    aria-label="Open calendar"
                                >
                                    <svg className={styles.calendarIcon} viewBox="0 0 16 16" fill="none">
                                        <path
                                            d="M3.5 2.5V4M12.5 2.5V4M2.5 6H13.5"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            strokeLinecap="round"
                                        />

                                        <rect
                                            x="2.5"
                                            y="3.5"
                                            width="11"
                                            height="10"
                                            rx="1.5"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                        />

                                        <path
                                            d="M5 8H5.01M8 8H8.01M11 8H11.01M5 10.5H5.01M8 10.5H8.01"
                                            stroke="currentColor"
                                            strokeWidth="1.3"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                                {isCalendarOpen && (
                                    <div ref={popupRef} className={styles.calendarPopup} style={{
                                        top: calendarAbove ? "auto" : "100%",
                                        bottom: calendarAbove ? "100%" : "auto",
                                    }}>
                                        <div className={styles.calendarHeader}>
                                            <button
                                                type="button"
                                                className={styles.navigationButton}
                                                onClick={handlePreviousMonth}
                                            >
                                                ‹
                                            </button>

                                            <div className={styles.monthTitle}>{monthTitle}</div>

                                            <button
                                                type="button"
                                                className={styles.navigationButton}
                                                onClick={handleNextMonth}
                                            >
                                                ›
                                            </button>
                                        </div>

                                        <div className={styles.weekHeader}>
                                            {
                                                weekDays.map((day) => (
                                                    <div key={day} className={styles.weekDay}>{day}</div>
                                                ))
                                            }
                                        </div>

                                        <div className={styles.daysGrid}>
                                            {
                                                calendarDays.map((item) => {
                                                    const isSelected = sameDate(item.date, selectedDate);
                                                    const isToday = sameDate(item.date, today);

                                                    return (
                                                        <button
                                                            key={`${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`}
                                                            type="button"
                                                            className={`
                                                        ${styles.dayButton}
                                                        ${!item.currentMonth ? styles.otherMonthDay : ""}
                                                        ${isToday ? styles.todayDay : ""}
                                                        ${isSelected ? styles.selectedDay : ""
                                                                }
                                                    `}
                                                            onClick={() => handleSelectDate(item.date)}
                                                        >
                                                            {
                                                                item.date.getDate()
                                                            }
                                                        </button>
                                                    );
                                                })
                                            }
                                        </div>

                                        <div className={styles.calendarFooter}>
                                            <button
                                                type="button"
                                                className={styles.todayButton}
                                                onClick={handleToday}
                                            >
                                                Today
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {inputError && (
                                <span style={{
                                    color: "red",
                                    fontSize: "12px",
                                }}
                                >
                                    {inputError}
                                </span>
                            )}

                            {isValid &&
                                !date &&
                                isRequired &&
                                !inputError && (
                                    <span
                                        style={{
                                            color: "red",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {label}: Required fields must be filled in.
                                    </span>
                                )}
                        </div>
                    ) : (
                        <Input
                            type="text"
                            value={readonlyValue}
                            className={styles.styleInputReadOnly}
                            readOnly
                        />
                    )}
                </div>
            </div>
        );
    return null;
};

export default DateComponent;