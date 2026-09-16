import { IInputs } from "../generated/ManifestTypes";
import {
    CalendarDay,
    FieldComponentProps,
    fieldValueProps,
    jsonFormControl,
    jsonFormSection,
    jsonLookupControl,
    jsonRelatedLookup,
} from "./Models";

type DynamicRecord = Record<string, unknown>;

const getStringProperty = (
    record: DynamicRecord,
    propertyName: string
): string => {
    const value = record[propertyName];

    return typeof value === "string" ? value : "";
};

const normalizeGuid = (value: string): string => {
    return value.replace(/[{}]/g, "").trim();
};

export const getLookupRecords = async (context: ComponentFramework.Context<IInputs>, entityName: string, lookupRelated: jsonRelatedLookup[], lookupSubNameAttr: string, fieldValue: Record<string, fieldValueProps>, keyword?: string): Promise<jsonLookupControl[]> => {
    const metadataResult: unknown = await context.utils.getEntityMetadata(entityName);

    if (typeof metadataResult !== "object" || metadataResult === null) {
        return [];
    }

    const metadata = metadataResult as DynamicRecord;
    const primaryId = getStringProperty(metadata, "PrimaryIdAttribute");
    const primaryName = getStringProperty(metadata, "PrimaryNameAttribute");

    if (!primaryId || !primaryName) {
        return [];
    }

    const selectFields = new Set<string>();

    selectFields.add(primaryId);
    selectFields.add(primaryName);

    if (lookupSubNameAttr) {
        selectFields.add(lookupSubNameAttr);
    }

    const filters: string[] = [];

    if (lookupRelated) {
        for (const related of lookupRelated) {
            if (!related.byField || !related.targetAttribute) {
                continue;
            }

            const relatedField = fieldValue[related.byField];
            const rawRelatedId = relatedField?.id;

            if (typeof rawRelatedId !== "string" || rawRelatedId.trim() === "") {
                continue;
            }

            const relatedId = normalizeGuid(rawRelatedId);
            if (!relatedId) {
                continue;
            }

            filters.push(`_${related.targetAttribute}_value eq ${relatedId}`);
        }

    }

    if (keyword != "" && keyword?.trim()) {
        const escapedKeyword = keyword.trim().replace(/'/g, "''");

        const keywordFilters: string[] = [
            `contains(${primaryName},'${escapedKeyword}')`,
        ];

        filters.push(`(${keywordFilters.join("")})`);
    }

    let query = `?$select=${Array.from(selectFields).join(",")}` + `&$top=50`;

    if (filters.length > 0) {
        query += `&$filter=${filters.join(" and ")}`;
    }

    const result = await context.webAPI.retrieveMultipleRecords(entityName, query);
    const records = result.entities as unknown as DynamicRecord[];

    return records.map((record) => {
        const idValue = record[primaryId];
        const nameValue = record[primaryName];
        const subNameValue = lookupSubNameAttr ? getFieldDisplayValue(record, lookupSubNameAttr) : undefined;

        return {
            id: typeof idValue === "string" ? idValue : "",
            name: typeof nameValue === "string" ? nameValue : "",
            entityName,
            subName: typeof subNameValue === "string" ? subNameValue : "",
        };
    });
};

function getFieldDisplayValue(record: DynamicRecord, fieldName: string) {
    const formattedKey = `${fieldName}@OData.Community.Display.V1.FormattedValue`;

    if (record[formattedKey] !== undefined) {
        return record[formattedKey];
    }

    return record[fieldName] ?? null;
}

export function formatNumber(value: string | number | null | undefined, decimalPlaces = 2): string {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    const normalized = String(value)
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "");

    const number = Number(normalized);

    if (Number.isNaN(number)) {
        return "";
    }

    return number.toLocaleString("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });
}

export function formatDate(
    value: Date | string | null | undefined,
    format: string
): string {
    if (!value) {
        return "";
    }

    const date = value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const replacements: Record<string, string> = {
        "yyyy": String(date.getFullYear()),
        "yy": String(date.getFullYear()).slice(-2),
        "MM": String(date.getMonth() + 1).padStart(2, "0"),
        "M": String(date.getMonth() + 1),
        "dd": String(date.getDate()).padStart(2, "0"),
        "d": String(date.getDate()),
    };

    return format.replace(
        /yyyy|yy|MM|M|dd|d/g,
        match => replacements[match]
    );
}

export const normalizeDate = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (typeof value === "object" && value !== null && "value" in value) {
        return normalizeDate(
            (value as { value: unknown }).value
        );
    }

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return "";
        }

        return toIsoDate(value);
    }

    if (typeof value === "string") {
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    return "";
};

export const toIsoDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const parseIsoDate = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const result = new Date(year, month - 1, day);

    if (result.getFullYear() !== year || result.getMonth() !== month - 1 || result.getDate() !== day) {
        return null;
    }

    return result;
};

export const formatDateValue = (value: string, format: string): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return "";
    }

    const year = match[1];
    const month = match[2];
    const day = match[3];

    const replacements: Record<string, string> = {
        yyyy: year,
        yy: year.substring(2),
        MM: month,
        M: String(Number(month)),
        dd: day,
        d: String(Number(day)),
    };

    return format.replace(/yyyy|yy|MM|M|dd|d/g,
        (token) => replacements[token] ?? token
    );
};

export const parseInputDate = (value: string, format: string): string => {
    if (!value.trim()) {
        return "";
    }

    const tokens = format.match(/yyyy|yy|MM|M|dd|d/g);

    if (!tokens || tokens.length !== 3) {
        return "";
    }

    const parts = value.trim().split(/[/.\- ]+/);

    if (parts.length !== 3) {
        return "";
    }

    let year = 0;
    let month = 0;
    let day = 0;

    for (let i = 0; i < tokens.length; i++) {
        const number = Number(parts[i]);

        if (!Number.isInteger(number)) {
            return "";
        }

        switch (tokens[i]) {
            case "yyyy":
                year = number;
                break;

            case "yy":
                year = 2000 + number;
                break;

            case "MM":
            case "M":
                month = number;
                break;

            case "dd":
            case "d":
                day = number;
                break;
        }
    }

    if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
        return "";
    }

    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return "";
    }

    return toIsoDate(date);
};

export const buildCalendarDays = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
            date: new Date(year, month - 1, previousMonthDays - i),
            currentMonth: false,
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push({
            date: new Date(year, month, day),
            currentMonth: true,
        });
    }

    let nextDay = 1;

    while (days.length < 42) {
        days.push({
            date: new Date(year, month + 1, nextDay),
            currentMonth: false,
        });

        nextDay++;
    }

    return days;
};

export const sameDate = (first: Date | null, second: Date | null): boolean => {
    if (!first || !second) {
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

export function findElementUp(
    element: Element | null,
    idContains: string
): Element | null {
    let current = element;

    while (current) {
        const found = current.querySelector(
            `[data-id="${idContains}-locked-icon"]`
        );

        if (found) {
            const parent = found.parentElement?.parentElement?.parentElement;

            if (parent) {
                return parent;
            }
        }

        current = current.parentElement;
    }

    return null;
}

export function setFieldVisibility(formJson: jsonFormControl, logicalName: string, visible: boolean): string {
    formJson.sections.forEach(section =>
        Object.values(section.sectionControls).flat().forEach(control => {
            if (control.logicalName === logicalName) {
                control.visible = visible;
            }
        })
    );

    return JSON.stringify(formJson);
}

export function setFieldRequired(formJson: jsonFormControl, logicalName: string, required: boolean): string {
    formJson.sections.forEach(section =>
        Object.values(section.sectionControls).flat().forEach(control => {
            if (control.logicalName === logicalName) {
                control.required = required;
            }
        })
    );

    return JSON.stringify(formJson);
}

export function setFieldDisabled(formJson: jsonFormControl, logicalName: string, disabled: boolean): string {
    formJson.sections.forEach(section =>
        Object.values(section.sectionControls).flat().forEach(control => {
            if (control.logicalName === logicalName) {
                control.disabled = disabled;
            }
        })
    );

    return JSON.stringify(formJson);
}