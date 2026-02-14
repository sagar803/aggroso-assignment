export type InsightType = "trend" | "outlier" | "quality" | "warning" | "positive";

export interface Insight {
    type: InsightType;
    title: string;
    description: string;
}

export interface HealthBreakdown {
    completeness: number;
    consistency: number;
    diversity: number;
}

export interface InsightsResult {
    summary: string;
    insights: Insight[];
    healthScore: number;
    healthBreakdown: HealthBreakdown;
    nextSteps: string[];
    outlierColumns: string[];
    parseError?: boolean;
}

export type InsightsStatus = "idle" | "loading" | "success" | "error";