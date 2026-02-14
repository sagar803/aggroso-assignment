import type { ColumnMeta } from "../types/schema";

export type { ColumnMeta, ColumnType, SavedReport } from "../types/schema";

export interface ParsedCSV {
    filename: string;
    rows: Record<string, string | number | null>[];
    headers: string[];
    rowCount: number;
    columnCount: number;
}

export interface ColumnStats extends ColumnMeta {
    isSelected: boolean;
}