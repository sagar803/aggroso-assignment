// Re-export SavedReport from schema for convenience
export type { SavedReport, ColumnMeta, ColumnType } from "./schema";

export interface ReportSummary {
    id: string;
    filename: string;
    createdAt: string;
    healthScore: number;
}