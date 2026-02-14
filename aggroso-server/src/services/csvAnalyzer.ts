import type { ColumnMeta } from "../types/schema";

type RawRow = Record<string, string | number | null>;

// ── Infer column type from sample values ──────────────────────────────────────
function inferType(values: (string | number | null)[]): ColumnMeta["type"] {
    const nonNull = values.filter((v) => v !== null && v !== "");

    if (nonNull.length === 0) return "unknown";

    // Check if looks like an ID column (all unique, sequential or hash-like)
    const strVals = nonNull.map(String);
    const allUnique = new Set(strVals).size === nonNull.length;
    if (allUnique && nonNull.length > 10) {
        const looksLikeId = strVals.every(
            (v) => /^\d+$/.test(v) || /^[a-f0-9-]{8,}$/i.test(v)
        );
        if (looksLikeId) return "id";
    }

    // Check numeric
    const numericCount = nonNull.filter(
        (v) => typeof v === "number" || (typeof v === "string" && !isNaN(Number(v)))
    ).length;
    if (numericCount / nonNull.length > 0.85) return "numeric";

    // Check date
    const dateCount = nonNull.filter((v) => {
        const d = new Date(String(v));
        return !isNaN(d.getTime()) && String(v).length > 4;
    }).length;
    if (dateCount / nonNull.length > 0.75) return "date";

    // Categorical: low cardinality
    const unique = new Set(strVals).size;
    if (unique / nonNull.length < 0.5 || unique <= 20) return "categorical";

    return "unknown";
}

// ── Compute stats for a single column ────────────────────────────────────────
function analyzeColumn(
    name: string,
    values: (string | number | null)[]
): ColumnMeta {
    const type = inferType(values);
    const nullCount = values.filter((v) => v === null || v === "").length;
    const nonNull = values.filter((v) => v !== null && v !== "") as (
        | string
        | number
    )[];
    const uniqueCount = new Set(nonNull.map(String)).size;

    const sampleValues = nonNull.slice(0, 5);

    let min: string | number | undefined;
    let max: string | number | undefined;
    let mean: number | undefined;

    if (type === "numeric") {
        const nums = nonNull.map(Number).filter((n) => !isNaN(n));
        if (nums.length > 0) {
            min = Math.min(...nums);
            max = Math.max(...nums);
            mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        }
    }

    if (type === "date") {
        const sorted = nonNull
            .map(String)
            .filter((v) => !isNaN(new Date(v).getTime()))
            .sort();
        min = sorted[0];
        max = sorted[sorted.length - 1];
    }

    if (type === "categorical") {
        // Sort by frequency for min/max labels
        const freq: Record<string, number> = {};
        nonNull.forEach((v) => {
            const k = String(v);
            freq[k] = (freq[k] || 0) + 1;
        });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            max = sorted[0][0]; // Most frequent
            min = sorted[sorted.length - 1][0]; // Least frequent
        }
    }

    return {
        name,
        type,
        nullCount,
        uniqueCount,
        min,
        max,
        mean: mean !== undefined ? parseFloat(mean.toFixed(4)) : undefined,
        sampleValues,
    };
}

// ── Main analyzer function ────────────────────────────────────────────────────
export function analyzeCSV(rows: RawRow[]): {
    columns: ColumnMeta[];
    sampleRows: RawRow[];
} {
    if (rows.length === 0) {
        return { columns: [], sampleRows: [] };
    }

    const columnNames = Object.keys(rows[0]);

    const columns = columnNames.map((name) => {
        const values = rows.map((row) => {
            const val = row[name];
            return val === undefined ? null : val;
        });
        return analyzeColumn(name, values);
    });

    // Provide a representative sample: first 5, middle 5, last 5
    const sampleRows = getSampleRows(rows, 10);

    return { columns, sampleRows };
}

function getSampleRows(rows: RawRow[], count: number): RawRow[] {
    if (rows.length <= count) return rows;
    const step = Math.floor(rows.length / count);
    return Array.from({ length: count }, (_, i) => rows[i * step]);
}