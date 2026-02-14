import { z } from "zod";

// ── Column metadata ──────────────────────────────────────────────────────────
export const ColumnTypeSchema = z.enum(["numeric", "date", "categorical", "id", "unknown"] as const);
export type ColumnType = z.infer<typeof ColumnTypeSchema>;

// Use z.union with a tuple for compatibility with stricter Zod builds
const stringOrNumber = (): z.ZodUnion<[z.ZodString, z.ZodNumber]> =>
    z.union([z.string(), z.number()]);

const stringOrNumberOrNull = (): z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]> =>
    z.union([z.string(), z.number(), z.null()]);

// z.record in older Zod requires (keyType, valueType) — use string key explicitly
const rowRecord = () => z.record(z.string(), stringOrNumberOrNull());

export const ColumnMetaSchema = z.object({
    name: z.string(),
    type: ColumnTypeSchema,
    nullCount: z.number(),
    uniqueCount: z.number(),
    min: stringOrNumber().optional(),
    max: stringOrNumber().optional(),
    mean: z.number().optional(),
    sampleValues: z.array(stringOrNumberOrNull()),
});
export type ColumnMeta = z.infer<typeof ColumnMetaSchema>;

// ── Insights request/response ────────────────────────────────────────────────
export const InsightsRequestSchema = z.object({
    filename: z.string(),
    rowCount: z.number(),
    columnCount: z.number(),
    columns: z.array(ColumnMetaSchema),
    sampleRows: z.array(rowRecord()),
    selectedColumns: z.array(z.string()).optional(),
});
export type InsightsRequest = z.infer<typeof InsightsRequestSchema>;

// ── Follow-up request/response ───────────────────────────────────────────────
export const FollowUpRequestSchema = z.object({
    question: z.string().min(1).max(500),
    filename: z.string(),
    columns: z.array(ColumnMetaSchema),
    rowCount: z.number(),
    previousInsights: z.string(),
    sampleRows: z.array(rowRecord()),
});
export type FollowUpRequest = z.infer<typeof FollowUpRequestSchema>;

// ── Saved report ─────────────────────────────────────────────────────────────
export const SavedReportSchema = z.object({
    id: z.string(),
    filename: z.string(),
    createdAt: z.string(),
    rowCount: z.number(),
    columnCount: z.number(),
    insights: z.string(),
    healthScore: z.number(),
    columnMetas: z.array(ColumnMetaSchema),
});
export type SavedReport = z.infer<typeof SavedReportSchema>;

// ── API error ────────────────────────────────────────────────────────────────
export const ApiErrorSchema = z.object({
    error: z.string(),
    details: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;