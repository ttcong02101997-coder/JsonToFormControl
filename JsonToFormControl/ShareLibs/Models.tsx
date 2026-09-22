import { IInputs } from "../generated/ManifestTypes";
import { Dispatch, SetStateAction } from "react";

export { };

declare global {
    interface Window {
        setVisibleField?: (logicalName: string, visible: boolean) => void;
        setRequiredField?: (logicalName: string, required: boolean) => void;
        setDisabledField?: (logicalName: string, disabled: boolean) => void;
    }
}

export interface jsonFormControl {
    formLogicalName: string;
    sectionBox: boolean;
    sections: jsonFormSection[];
}

export interface jsonFormSection {
    sectionLogicalName: string;
    sectionLabel: string;
    showLabel: boolean;
    sectionControls: Record<string, jsonControl[]>;
}

export interface jsonControl {
    logicalName: string;
    displayName: string;
    type: string;
    lookupEntity: string;
    lookupRelated: jsonRelatedLookup[];
    lookupSubNameAttr: string;
    items: jsonOptionsetControl[];
    required: boolean;
    visible: boolean;
    disabled: boolean;
    decimalPlaces: number;
}

export interface jsonOptionsetControl {
    value: number;
    label: string;
}

export interface jsonLookupControl {
    id: string;
    name: string;
    entityName: string;
    subName?: string;
}

export interface FieldComponentProps {
    key: string;
    value: string | number | boolean | undefined | fieldValueProps;
    label: string;
    setFieldValue: Dispatch<SetStateAction<Record<string, fieldValueProps>>>;
    isDisable: boolean;
    isRequired: boolean;
    entityName?: string;
    options?: jsonOptionsetControl[];
    context?: ComponentFramework.Context<IInputs>;
    logicalName: string;
    lookupRelated?: jsonRelatedLookup[];
    lookupSubNameAttr?: string;
    fieldValue: Record<string, fieldValueProps>;
    isValid: boolean;
    dateFormat?: string;
    dateTimeFormat?: string;
    isVisible: boolean;
    decimalPlaces?: number;
}

export interface fieldValueProps {
    value?: string | number | boolean;
    id?: string;
    name?: string;
    entityName?: string;
    label?: string;
    lookups?: jsonLookupControl[];
}

export type InputType =
    | "number"
    | "time"
    | "text"
    | "search"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "date"
    | "datetime-local"
    | "month"
    | "week";

export interface jsonRelatedLookup {
    byField: string;
    targetAttribute: string;
}

export interface CalendarDay {
    date: Date;
    currentMonth: boolean;
}


export const formatDateTimeValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const parseDateTimeValue = (
    value: string
): Date | null => {
    if (!value) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);

    const date = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        0,
        0
    );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute
    ) {
        return null;
    }

    return date;
};

export const pad = (value: number): string =>
    String(value).padStart(2, "0");

export const formatDateByConfig = (
    date: Date,
    dateFormat?: string
): string => {
    let format = dateFormat?.trim();

    if (format === undefined || format === "") {
        format = "dd/MM/yyyy HH:mm";
    }

    const hour24 = date.getHours();
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    const replacements: Record<string, string> = {
        yyyy: String(date.getFullYear()),
        yy: String(date.getFullYear()).slice(-2),

        MM: pad(date.getMonth() + 1),
        M: String(date.getMonth() + 1),

        dd: pad(date.getDate()),
        d: String(date.getDate()),

        HH: pad(hour24),
        H: String(hour24),

        hh: pad(hour12),
        h: String(hour12),

        mm: pad(date.getMinutes()),
        m: String(date.getMinutes()),

        tt: hour24 >= 12 ? "PM" : "AM",
        t: hour24 >= 12 ? "P" : "A",
    };

    return format.replace(
        /yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|tt|t/g,
        token => replacements[token] ?? token
    );
};

export const parseDateByConfig = (
    value: string,
    dateFormat?: string
): Date | null => {
    if (!value) {
        return null;
    }

    const trimmedFormat = dateFormat?.trim();
    const format = trimmedFormat === undefined || trimmedFormat === ""
        ? "dd/MM/yyyy HH:mm"
        : trimmedFormat;

    const tokenRegex: Record<string, string> = {
        yyyy: "(\\d{4})",
        yy: "(\\d{2})",

        MM: "(\\d{1,2})",
        M: "(\\d{1,2})",

        dd: "(\\d{1,2})",
        d: "(\\d{1,2})",

        HH: "(\\d{1,2})",
        H: "(\\d{1,2})",

        hh: "(\\d{1,2})",
        h: "(\\d{1,2})",

        mm: "(\\d{1,2})",
        m: "(\\d{1,2})",

        tt: "(AM|PM|am|pm)",
        t: "(A|P|a|p)",
    };

    const tokens =
        format.match(
            /yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|tt|t/g
        ) ?? [];

    const regex = format.replace(
        /yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|tt|t/g,
        token => tokenRegex[token]
    );

    const match = new RegExp(
        `^${regex}$`
    ).exec(value.trim());

    if (!match) {
        return null;
    }

    let index = 1;

    let year = 0;
    let month = 1;
    let day = 1;
    let hour = 0;
    let minute = 0;

    let is12Hour = false;
    let period: string | undefined;

    tokens.forEach(token => {
        const currentValue = match[index++];

        switch (token) {
            case "yyyy":
                year = Number(currentValue);
                break;

            case "yy":
                year =
                    2000 +
                    Number(currentValue);
                break;

            case "MM":
            case "M":
                month = Number(currentValue);
                break;

            case "dd":
            case "d":
                day = Number(currentValue);
                break;

            case "HH":
            case "H":
                hour = Number(currentValue);
                break;

            case "hh":
            case "h":
                hour = Number(currentValue);
                is12Hour = true;
                break;

            case "mm":
            case "m":
                minute = Number(currentValue);
                break;

            case "tt":
            case "t":
                period =
                    currentValue.toUpperCase();
                break;

            default:
                break;
        }
    });

    if (is12Hour) {
        if (hour < 1 || hour > 12) {
            return null;
        }

        if (period === "PM" || period === "P") {
            hour =
                hour === 12
                    ? 12
                    : hour + 12;
        } else {
            hour =
                hour === 12
                    ? 0
                    : hour;
        }
    }

    if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {
        return null;
    }

    const date = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        0,
        0
    );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute
    ) {
        return null;
    }

    return date;
};

export const buildCalendarDays = (
    year: number,
    month: number
): CalendarDay[] => {
    const firstDay = new Date(
        year,
        month,
        1
    );

    const firstWeekDay =
        firstDay.getDay();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();

    const result: CalendarDay[] = [];

    for (
        let i = firstWeekDay - 1;
        i >= 0;
        i--
    ) {
        result.push({
            date: new Date(
                year,
                month - 1,
                previousMonthDays - i
            ),
            currentMonth: false,
        });
    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        result.push({
            date: new Date(
                year,
                month,
                day
            ),
            currentMonth: true,
        });
    }

    let nextDay = 1;

    while (result.length < 42) {
        result.push({
            date: new Date(
                year,
                month + 1,
                nextDay
            ),
            currentMonth: false,
        });

        nextDay++;
    }

    return result;
};

export const isSameDate = (
    first: Date | null,
    second: Date
): boolean => {
    if (!first) {
        return false;
    }

    return (
        first.getFullYear() ===
        second.getFullYear() &&
        first.getMonth() ===
        second.getMonth() &&
        first.getDate() ===
        second.getDate()
    );
};
