import type { ColumnMeta } from "../types/csv.types";

type RawRow = Record<string, string | number | null>;

// ── Column type inference (mirrors server logic) ──────────────────────────────
function inferType(values: (string | number | null)[]): ColumnMeta["type"] {
    const nonNull = values.filter((v) => v !== null && v !== "");
    if (nonNull.length === 0) return "unknown";

    const strVals = nonNull.map(String);
    const allUnique = new Set(strVals).size === nonNull.length;

    if (allUnique && nonNull.length > 5) {
        const isId = strVals.every(
            (v) => /^\d+$/.test(v) || /^[a-f0-9-]{8,}$/i.test(v)
        );
        if (isId) return "id";
    }

    const numericRatio =
        nonNull.filter(
            (v) =>
                typeof v === "number" ||
                (typeof v === "string" && v !== "" && !isNaN(Number(v)))
        ).length / nonNull.length;
    if (numericRatio > 0.85) return "numeric";

    const dateRatio =
        nonNull.filter((v) => {
            const d = new Date(String(v));
            return !isNaN(d.getTime()) && String(v).length > 4;
        }).length / nonNull.length;
    if (dateRatio > 0.75) return "date";

    const uniqueRatio = new Set(strVals).size / nonNull.length;
    if (uniqueRatio < 0.5 || new Set(strVals).size <= 20) return "categorical";

    return "unknown";
}

// ── Compute per-column statistics ─────────────────────────────────────────────
export function analyzeColumnsClient(
    rows: RawRow[],
    headers: string[]
): ColumnMeta[] {
    return headers.map((col) => {
        const values = rows.map((r) => r[col] ?? null);
        const type = inferType(values);
        const nonNull = values.filter((v) => v !== null && v !== "") as (
            | string
            | number
        )[];

        let min: string | number | undefined;
        let max: string | number | undefined;
        let mean: number | undefined;

        if (type === "numeric") {
            const nums = nonNull.map(Number).filter((n) => !isNaN(n));
            if (nums.length) {
                min = Math.min(...nums);
                max = Math.max(...nums);
                mean = parseFloat(
                    (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(4)
                );
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

        return {
            name: col,
            type,
            nullCount: values.filter((v) => v === null || v === "").length,
            uniqueCount: new Set(nonNull.map(String)).size,
            min,
            max,
            mean,
            sampleValues: nonNull.slice(0, 5),
        };
    });
}

// ── Detect outlier row indices for numeric columns (IQR method) ───────────────
export function detectOutlierRows(
    rows: RawRow[],
    headers: string[]
): Set<number> {
    const outlierIndices = new Set<number>();

    headers.forEach((col) => {
        const values = rows.map((r) => r[col]);
        const nums = values
            .map((v, i) => ({ i, n: typeof v === "number" ? v : Number(v) }))
            .filter(({ n }) => !isNaN(n));

        if (nums.length < 4) return;

        const sorted = [...nums].sort((a, b) => a.n - b.n);
        const q1 = sorted[Math.floor(sorted.length * 0.25)].n;
        const q3 = sorted[Math.floor(sorted.length * 0.75)].n;
        const iqr = q3 - q1;
        const lo = q1 - 1.5 * iqr;
        const hi = q3 + 1.5 * iqr;

        nums.forEach(({ i, n }) => {
            if (n < lo || n > hi) outlierIndices.add(i);
        });
    });

    return outlierIndices;
}

// ── Compute data health score ─────────────────────────────────────────────────
export function computeHealthScore(
    rows: RawRow[],
    columns: ColumnMeta[]
): { score: number; completeness: number; consistency: number; diversity: number } {
    if (!rows.length || !columns.length) {
        return { score: 0, completeness: 0, consistency: 0, diversity: 0 };
    }

    const totalCells = rows.length * columns.length;
    const nullCells = columns.reduce((acc, c) => acc + c.nullCount, 0);
    const completeness = Math.round((1 - nullCells / totalCells) * 100);

    const numericCols = columns.filter((c) => c.type === "numeric");
    let consistency = 85; // Default
    if (numericCols.length > 0) {
        const outliers = detectOutlierRows(
            rows,
            numericCols.map((c) => c.name)
        );
        consistency = Math.round((1 - outliers.size / rows.length) * 100);
    }

    const avgUniqueness =
        columns.reduce((acc, c) => acc + Math.min(c.uniqueCount / rows.length, 1), 0) /
        columns.length;
    const diversity = Math.round(avgUniqueness * 100);

    const score = Math.round(
        completeness * 0.45 + consistency * 0.35 + diversity * 0.2
    );

    return { score, completeness, consistency, diversity };
}