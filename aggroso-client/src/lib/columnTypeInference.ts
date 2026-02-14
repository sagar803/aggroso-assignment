import type { ColumnType } from "../types/schema";

type RawValue = string | number | null;

/**
 * Infer the semantic type of a column from its sample values.
 */
export function inferColumnType(values: RawValue[]): ColumnType {
    const nonNull = values.filter((v) => v !== null && v !== "");
    if (nonNull.length === 0) return "unknown";

    const strVals = nonNull.map(String);

    // ID check: all unique + looks like integers or UUIDs
    const allUnique = new Set(strVals).size === nonNull.length;
    if (allUnique && nonNull.length > 5) {
        const isId = strVals.every(
            (v) => /^\d+$/.test(v) || /^[a-f0-9-]{8,}$/i.test(v)
        );
        if (isId) return "id";
    }

    // Numeric check
    const numericRatio =
        nonNull.filter(
            (v) =>
                typeof v === "number" ||
                (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)))
        ).length / nonNull.length;
    if (numericRatio > 0.85) return "numeric";

    // Date check
    const dateRatio =
        nonNull.filter((v) => {
            const d = new Date(String(v));
            return !isNaN(d.getTime()) && String(v).length > 4;
        }).length / nonNull.length;
    if (dateRatio > 0.75) return "date";

    // Categorical: low cardinality
    const uniqueRatio = new Set(strVals).size / nonNull.length;
    if (uniqueRatio < 0.5 || new Set(strVals).size <= 20) return "categorical";

    return "unknown";
}

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
    numeric: "Numeric",
    date: "Date",
    categorical: "Category",
    id: "ID",
    unknown: "Unknown",
};

export const COLUMN_TYPE_EMOJIS: Record<ColumnType, string> = {
    numeric: "🔢",
    date: "📅",
    categorical: "🏷️",
    id: "🆔",
    unknown: "❓",
};