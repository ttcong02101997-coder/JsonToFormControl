import React from "react";
import { Input, makeStyles, tokens } from "@fluentui/react-components";
import { buildCalendarDays, FieldComponentProps, formatDateByConfig, formatDateTimeValue, isSameDate, pad, parseDateByConfig, parseDateTimeValue } from "../ShareLibs/Models";
import { IconLock } from "../ShareLibs/Icons";

const useStyles = makeStyles({
    root: {
        display: "grid",
        columnGap: "10px",
        gridTemplateColumns: "repeat(2, 1fr)",
        marginBottom: "10px",
        width: "100%",
    },

    styleInput: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
        boxSizing: "border-box",
        marginBottom: "5px",

        "& input": {
            paddingRight: "36px",
        },
    },

    styleOverField: {
        padding: "3px 0",
    },

    styleField: {
        display: "flex",
        gap: "2px",
        flexDirection: "row",

        "@media (max-width: 425px)": {
            display: "block"
        },
    },

    wrapper: {
        position: "relative",
        width: "100%",
    },

    calendarIcon: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "16px",
        height: "16px",
        pointerEvents: "none",
        color: tokens.colorNeutralForeground3,
    },

    styleInputReadOnly: {
        background: "rgba(0, 0, 0, 0.06)",
        width: "100%",
        border: "none",
        marginBottom: "5px",

        ":focus-within::after": {
            borderBottomColor: "#ccc",
        },
    },

    calendarPopup: {
        position: "absolute",
        left: 0,
        zIndex: 2147483647,
        width: "320px",
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: "4px",
        boxShadow: tokens.shadow16,
        padding: "12px",
        boxSizing: "border-box",
    },

    calendarHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
    },

    monthTitle: {
        fontSize: "14px",
        fontWeight: 600,
    },

    navButton: {
        border: "none",
        background: "transparent",
        width: "28px",
        height: "28px",
        cursor: "pointer",
        borderRadius: "3px",

        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },

    weekHeader: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        marginBottom: "4px",
    },

    weekDay: {
        textAlign: "center",
        fontSize: "11px",
        color: tokens.colorNeutralForeground3,
        padding: "4px 0",
    },

    calendarGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "2px",
    },

    dayButton: {
        border: "none",
        background: "transparent",
        height: "32px",
        cursor: "pointer",
        borderRadius: "3px",
        fontSize: "12px",

        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },

    todayButton: {
        fontWeight: 600,
        textDecoration: "underline",
    },

    selectedDay: {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralForegroundInverted,

        ":hover": {
            backgroundColor: tokens.colorBrandBackgroundHover,
        },
    },

    timeContainer: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "12px",
        paddingTop: "10px",
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },

    timeLabel: {
        fontSize: "12px",
        color: tokens.colorNeutralForeground2,
        marginRight: "4px",
    },

    timeInput: {
        width: "60px",
    },

    periodButton: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        background: tokens.colorNeutralBackground1,
        height: "32px",
        minWidth: "54px",
        padding: "0 8px",
        borderRadius: "2px",
        cursor: "pointer",
        fontSize: "12px",

        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },

    footer: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "10px",
        paddingTop: "8px",
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },

    todayAction: {
        border: "none",
        background: "transparent",
        color: tokens.colorBrandForeground1,
        cursor: "pointer",
        fontSize: "12px",
        padding: "4px 8px",

        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },
});

const DateTimeComponent = ({ setFieldValue, value, isDisable, isRequired, label, fieldValue, logicalName, isValid, dateFormat, isVisible }: FieldComponentProps) => {
    const styles = useStyles();
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const popupRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLDivElement>(null);
    const [dateTimeValue, setDateTimeValue] = React.useState<string>("");
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
    const [calendarAbove, setCalendarAbove] = React.useState(false);
    const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());
    const [hour, setHour] = React.useState("00");
    const [minute, setMinute] = React.useState("00");

    const updateCalendarPosition = (): void => {
        const wrapper = wrapperRef.current;
        if (!wrapper) {
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        setCalendarAbove(window.innerHeight - rect.bottom < 420);
    };

    React.useEffect(() => {
        if (!value) {
            setDateTimeValue("");
            return;
        }

        const parsedDate = parseDateTimeValue(value as string);
        if (!parsedDate) {
            return;
        }

        setDateTimeValue(formatDateByConfig(parsedDate, dateFormat));
        setCalendarDate(parsedDate);
        setHour(pad(parsedDate.getHours()));
        setMinute(pad(parsedDate.getMinutes()));

    }, [value, dateFormat]);


    React.useEffect(() => {
        if (!isCalendarOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (wrapperRef.current?.contains(target) || popupRef.current?.contains(target)) {
                return;
            }

            setIsCalendarOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", updateCalendarPosition, true);
        window.addEventListener("resize", updateCalendarPosition);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", updateCalendarPosition, true);
            window.removeEventListener("resize", updateCalendarPosition);
        };
    }, [isCalendarOpen]);

    const updateValue = (date: Date): void => {
        const newValue = formatDateTimeValue(date);

        setDateTimeValue(formatDateByConfig(date, dateFormat));

        setFieldValue({
            ...fieldValue,
            [logicalName]: {
                value: newValue,
            },
        });
    };

    const openCalendar = (): void => {
        if (isDisable) {
            return;
        }

        const currentDate = parseDateByConfig(dateTimeValue, dateFormat)
            ?? parseDateTimeValue(value as string)
            ?? new Date();

        setCalendarDate(currentDate);
        setHour(pad(currentDate.getHours()));
        setMinute(pad(currentDate.getMinutes()));
        updateCalendarPosition();
        setIsCalendarOpen(true);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = event.target.value;

        setDateTimeValue(newValue);

        if (!newValue) {
            const newData = {
                ...fieldValue,
            };

            delete newData[logicalName];
            setFieldValue(newData);
            return;
        }

        const parsedDate = parseDateByConfig(newValue, dateFormat);
        if (!parsedDate) {
            return;
        }

        setCalendarDate(parsedDate);
        setHour(pad(parsedDate.getHours()));
        setMinute(pad(parsedDate.getMinutes()));
        updateValue(parsedDate);
    };

    const handleDaySelect = (date: Date): void => {
        const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(hour), Number(minute), 0, 0);
        setCalendarDate(selectedDate);
        updateValue(selectedDate);
    };

    const handleTimeChange = (type: "hour" | "minute", newValue: string): void => {
        let nextHour = Number(hour);
        let nextMinute = Number(minute);

        if (type === "hour") {
            nextHour = Math.min(
                23,
                Math.max(
                    0,
                    Number(newValue)
                )
            );

            setHour(
                pad(nextHour)
            );
        } else {
            nextMinute = Math.min(
                59,
                Math.max(
                    0,
                    Number(newValue)
                )
            );

            setMinute(
                pad(nextMinute)
            );
        }

        const newDate =
            new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth(),
                calendarDate.getDate(),
                nextHour,
                nextMinute,
                0,
                0
            );

        updateValue(newDate);
    };

    const togglePeriod = (): void => {
        const currentHour = Number(hour);
        const newHour = currentHour >= 12 ? currentHour - 12 : currentHour + 12;
        const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), newHour, Number(minute), 0, 0);

        setHour(pad(newHour));
        updateValue(newDate);
    };

    const goPreviousMonth = (): void => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1, Number(hour), Number(minute)));
    };

    const goNextMonth = (): void => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1, Number(hour), Number(minute)));
    };

    const setToday = (): void => {
        const now = new Date();
        setCalendarDate(now);
        setHour(pad(now.getHours()));
        setMinute(pad(now.getMinutes()));
        updateValue(now);
    };

    const calendarDays = buildCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth());
    const selectedDate = parseDateByConfig(dateTimeValue, dateFormat);
    const is12HourFormat = Boolean(dateFormat?.includes("hh") ?? dateFormat?.includes("h")) && Boolean(dateFormat?.includes("tt") ?? dateFormat?.includes("t"));
    const displayHour = is12HourFormat ? String(Number(hour) % 12 === 0 ? 12 : Number(hour) % 12).padStart(2, "0") : hour;
    const period = Number(hour) >= 12 ? "PM" : "AM";

    if (isVisible)
        return (
            <div className={styles.styleOverField} key={logicalName}>
                <div className={styles.styleField}>
                    <div style={{ minWidth: 180, display: "flex", gap: "2px", flexDirection: "row" }}>
                        <label style={{ paddingBlockStart: 2, marginInlineEnd: 4, width: "100%", marginBottom: 5 }}>{label}</label>
                        {isRequired ? <span style={{ color: "red", paddingBlockStart: 2, marginInlineEnd: 2, textShadow: "0 0 black" }}>*</span> : <span style={{ color: "white", paddingBlockStart: 2, marginInlineEnd: 2 }}>*</span>}
                        {isDisable ? <IconLock /> : null}
                    </div>

                    {!isDisable ? (
                        <div style={{ width: "100%", }}>
                            <div className={styles.wrapper} ref={wrapperRef}>
                                <div
                                    ref={buttonRef}
                                    style={{ width: "100%", }}
                                    onClick={openCalendar}
                                >
                                    <Input
                                        type="text"
                                        value={dateTimeValue}
                                        disabled={isDisable}
                                        placeholder="---"
                                        className={styles.styleInput}
                                        onChange={handleInputChange}
                                    />

                                    <svg
                                        className={styles.calendarIcon}
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        aria-hidden="true"
                                    >
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
                                </div>
                                {isValid &&
                                    !value &&
                                    isRequired ? (
                                    <span
                                        style={{
                                            color: "red",
                                            fontSize: "12px",
                                            textShadow: "0 0 black",
                                        }}
                                    >
                                        {label}: Required fields must be filled in.
                                    </span>
                                ) : null}

                                {isCalendarOpen ? (
                                    <div ref={popupRef} className={styles.calendarPopup} style={{
                                        top: calendarAbove ? "auto" : "100%",
                                        bottom: calendarAbove ? "100%" : "auto",
                                    }}>
                                        <div className={styles.calendarHeader}>
                                            <button
                                                type="button"
                                                className={styles.navButton}
                                                onClick={goPreviousMonth}
                                            >
                                                ‹
                                            </button>

                                            <span className={styles.monthTitle}>
                                                {
                                                    calendarDate.toLocaleString("en-US",
                                                        {
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )
                                                }
                                            </span>

                                            <button
                                                type="button"
                                                className={styles.navButton}
                                                onClick={goNextMonth}
                                            >
                                                ›
                                            </button>
                                        </div>

                                        <div className={styles.weekHeader}>
                                            {
                                                [
                                                    "Su",
                                                    "Mo",
                                                    "Tu",
                                                    "We",
                                                    "Th",
                                                    "Fr",
                                                    "Sa",
                                                ].map(day => (
                                                    <div key={day} className={styles.weekDay}>{day}</div>
                                                ))
                                            }
                                        </div>

                                        <div className={styles.calendarGrid}>
                                            {
                                                calendarDays.map((item, index) => {
                                                    const isSelected = isSameDate(selectedDate, item.date);
                                                    const isToday = isSameDate(new Date(), item.date);

                                                    return (
                                                        <button
                                                            key={`${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}-${index}`}
                                                            type="button"
                                                            className={`
                                                        ${styles.dayButton} 
                                                        ${isSelected ? styles.selectedDay : ""} 
                                                        ${isToday ? styles.todayButton : ""}
                                                        `}
                                                            style={{ opacity: item.currentMonth ? 1 : 0.4, }}
                                                            onClick={() => handleDaySelect(item.date)}
                                                        >
                                                            {item.date.getDate()}
                                                        </button>
                                                    );
                                                })
                                            }
                                        </div>

                                        <div className={styles.timeContainer}>
                                            <span className={styles.timeLabel}>
                                                Time
                                            </span>

                                            <Input
                                                type="number"
                                                min={is12HourFormat ? 1 : 0}
                                                max={is12HourFormat ? 12 : 23}
                                                value={displayHour}
                                                className={styles.timeInput}
                                                onChange={e => {
                                                    let newHour = Number(e.target.value);
                                                    if (Number.isNaN(newHour)) {
                                                        return;
                                                    }

                                                    newHour = Math.min(is12HourFormat ? 12 : 23, Math.max(is12HourFormat ? 1 : 0, newHour));
                                                    let hour24 = newHour;

                                                    if (is12HourFormat) {
                                                        const isPM = Number(hour) >= 12;
                                                        hour24 = isPM ? newHour === 12 ? 12 : newHour + 12 : newHour === 12 ? 0 : newHour;
                                                    }

                                                    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), hour24, Number(minute), 0, 0);
                                                    setHour(pad(hour24));
                                                    updateValue(newDate);
                                                }}
                                            />

                                            <span>:</span>

                                            <Input
                                                type="number"
                                                min={0}
                                                max={59}
                                                value={minute}
                                                className={styles.timeInput}
                                                onChange={e => {
                                                    const newMinute = Math.min(59, Math.max(0, Number(e.target.value)));
                                                    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate(), Number(hour), newMinute, 0, 0);
                                                    setMinute(pad(newMinute));
                                                    updateValue(newDate);
                                                }}
                                            />

                                            {
                                                is12HourFormat ? (
                                                    <button
                                                        type="button"
                                                        className={styles.periodButton}
                                                        onClick={togglePeriod}
                                                    >
                                                        {period}
                                                    </button>
                                                ) : null
                                            }
                                        </div>

                                        <div className={styles.footer}>
                                            <button
                                                type="button"
                                                className={styles.todayAction}
                                                onClick={setToday}
                                            >
                                                Today
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <Input
                            type="text"
                            value={value
                                ? (() => {
                                    const date = parseDateTimeValue(value as string);
                                    return date ? formatDateByConfig(date, dateFormat) : "";
                                })()
                                : ""
                            }
                            className={styles.styleInputReadOnly}
                            readOnly
                        />
                    )}
                </div>
            </div>
        );
    return null;
};

export default DateTimeComponent;