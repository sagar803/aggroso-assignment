import { useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useCSVStore } from "../stores/csvStore";
import type { ParsedCSV } from "../types/csv.types";

// ── Parse Excel / ODS via SheetJS ────────────────────────────────────────────
async function parseSpreadsheet(
    file: File
): Promise<{ rows: Record<string, string | number | null>[]; headers: string[] }> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    // Convert to JSON with header row
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: null,
        raw: false, // Format dates as strings
    });

    if (raw.length === 0) {
        return { rows: [], headers: [] };
    }

    const headers = Object.keys(raw[0]);
    const rows = raw.map((r) => {
        const row: Record<string, string | number | null> = {};
        headers.forEach((h) => {
            const val = r[h];
            if (val === null || val === undefined || val === "") {
                row[h] = null;
            } else if (typeof val === "number") {
                row[h] = val;
            } else {
                const num = Number(val);
                row[h] = isNaN(num) ? String(val) : num;
            }
        });
        return row;
    });

    return { rows, headers };
}

// ── Parse CSV / TSV via PapaParse ─────────────────────────────────────────────
function parseDelimited(
    file: File
): Promise<{ rows: Record<string, string | number | null>[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
        const isTsv = file.name.endsWith(".tsv");
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            delimiter: isTsv ? "\t" : undefined, // auto-detect for CSV
            complete(results) {
                if (results.errors.find((e) => e.type === "Delimiter")) {
                    reject(new Error("Could not detect delimiter"));
                    return;
                }
                const rows = results.data as Record<string, string | number | null>[];
                const headers = results.meta.fields ?? [];
                resolve({ rows, headers });
            },
            error(err) {
                reject(new Error(err.message));
            },
        });
    });
}


export type FileFormat = "csv" | "xlsx" | "xls" | "tsv" | "ods";

// ── Format detection ──────────────────────────────────────────────────────────
export function detectFormat(filename: string): FileFormat {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "xlsx") return "xlsx";
    if (ext === "xls") return "xls";
    if (ext === "tsv") return "tsv";
    if (ext === "ods") return "ods";
    return "csv";
}


// ── Main hook ─────────────────────────────────────────────────────────────────
export function useFileParser() {
    const setCsvData = useCSVStore((s) => s.setCsvData);
    const setFlowStep = useCSVStore((s) => s.setFlowStep);

    const parseFile = useCallback(
        async (file: File): Promise<ParsedCSV> => {
            const format = detectFormat(file.name);
            setFlowStep("parse");

            let rows: Record<string, string | number | null>[];
            let headers: string[];

            if (format === "xlsx" || format === "xls" || format === "ods") {
                ({ rows, headers } = await parseSpreadsheet(file));
            } else {
                ({ rows, headers } = await parseDelimited(file));
            }

            if (rows.length === 0 || headers.length === 0) {
                throw new Error("File appears to be empty or has no headers");
            }

            const parsed: ParsedCSV = {
                filename: file.name,
                rows,
                headers,
                rowCount: rows.length,
                columnCount: headers.length,
            };

            setCsvData(parsed);
            return parsed;
        },
        [setCsvData, setFlowStep]
    );

    return { parseFile };
}