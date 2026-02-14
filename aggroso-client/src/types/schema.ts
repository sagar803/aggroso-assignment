// Client-side type definitions — no Zod runtime dependency

import { ParsedCSV } from "./csv.types";
import { InsightsResult } from "./insights.types";

export type ColumnType = "numeric" | "date" | "categorical" | "id" | "unknown";

export interface ColumnMeta {
    name: string;
    type: ColumnType;
    nullCount: number;
    uniqueCount: number;
    min?: string | number;
    max?: string | number;
    mean?: number;
    sampleValues: (string | number | null)[];
}

export type RawRow = Record<string, string | number | null>;

export interface InsightsRequest {
    filename: string;
    rowCount: number;
    columnCount: number;
    columns: ColumnMeta[];
    sampleRows: RawRow[];
    selectedColumns?: string[];
}

export interface FollowUpRequest {
    question: string;
    filename: string;
    columns: ColumnMeta[];
    rowCount: number;
    previousInsights: string;
    sampleRows: RawRow[];
}

export interface SavedReport {
    id: string;
    filename: string;
    createdAt: string;
    rowCount: number;
    columnCount: number;
    // Store the full CSV data so we can restore the complete report
    csvData: ParsedCSV;
    // Store insights as the full object for easier restoration
    insights: InsightsResult;
    healthScore: number;
}

export interface ApiError {
    error: string;
    details?: string;
}