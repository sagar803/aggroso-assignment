import { create } from "zustand";
import type { ParsedCSV } from "../types/csv.types";
import type { InsightsResult, InsightsStatus } from "../types/insights.types";
import type { SavedReport } from "../types/schema";

export type AppPage = "home" | "workspace" | "status";

interface CSVStore {
    // ── Current page / routing ───────────────────────────────────────────────────
    page: AppPage;
    setPage: (page: AppPage) => void;

    // ── Parsed CSV data ───────────────────────────────────────────────────────────
    csvData: ParsedCSV | null;
    selectedColumns: string[];
    setCsvData: (data: ParsedCSV) => void;
    toggleColumn: (col: string) => void;
    setSelectedColumns: (cols: string[]) => void;
    clearCSV: () => void;

    // ── Auto-flow progress ────────────────────────────────────────────────────────
    flowStep: "idle" | "upload" | "parse" | "analyze" | "done";
    setFlowStep: (step: CSVStore["flowStep"]) => void;

    // ── Insights ──────────────────────────────────────────────────────────────────
    insights: InsightsResult | null;
    insightsStatus: InsightsStatus;
    insightsError: string | null;
    setInsights: (insights: InsightsResult) => void;
    setInsightsStatus: (status: InsightsStatus) => void;
    setInsightsError: (error: string | null) => void;

    // ── Follow-up ─────────────────────────────────────────────────────────────────
    followUpAnswer: string;
    followUpStatus: "idle" | "streaming" | "done" | "error";
    appendFollowUpChunk: (chunk: string) => void;
    clearFollowUp: () => void;
    setFollowUpStatus: (status: "idle" | "streaming" | "done" | "error") => void;

    // ── Saved reports ─────────────────────────────────────────────────────────────
    savedReports: SavedReport[];
    setSavedReports: (reports: SavedReport[]) => void;
    addReport: (report: SavedReport) => void;
    removeReport: (id: string) => void;

    // ── UI state ──────────────────────────────────────────────────────────────────
    activeTab: "table" | "charts" | "insights";
    setActiveTab: (tab: "table" | "charts" | "insights") => void;
}
function loadSavedReports(): SavedReport[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem("csv-insights:reports");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export const useCSVStore = create<CSVStore>((set) => ({
    // ── Page routing ──────────────────────────────────────────────────────────────
    page: "home",
    setPage: (page) => set({ page }),

    // ── CSV data ──────────────────────────────────────────────────────────────────
    csvData: null,
    selectedColumns: [],
    setCsvData: (data) => set({ csvData: data, selectedColumns: data.headers }),
    toggleColumn: (col) =>
        set((state) => ({
            selectedColumns: state.selectedColumns.includes(col)
                ? state.selectedColumns.filter((c) => c !== col)
                : [...state.selectedColumns, col],
        })),
    setSelectedColumns: (cols) => set({ selectedColumns: cols }),
    clearCSV: () =>
        set({
            csvData: null,
            selectedColumns: [],
            insights: null,
            insightsStatus: "idle",
            insightsError: null,
            followUpAnswer: "",
            followUpStatus: "idle",
            activeTab: "table",
            flowStep: "idle",
        }),

    // ── Auto-flow ─────────────────────────────────────────────────────────────────
    flowStep: "idle",
    setFlowStep: (flowStep) => set({ flowStep }),

    // ── Insights ──────────────────────────────────────────────────────────────────
    insights: null,
    insightsStatus: "idle",
    insightsError: null,
    setInsights: (insights) => set({ insights, insightsStatus: "success" }),
    setInsightsStatus: (insightsStatus) => set({ insightsStatus }),
    setInsightsError: (insightsError) =>
        set({ insightsError, insightsStatus: "error" }),

    // ── Follow-up ─────────────────────────────────────────────────────────────────
    followUpAnswer: "",
    followUpStatus: "idle",
    appendFollowUpChunk: (chunk) =>
        set((state) => ({ followUpAnswer: state.followUpAnswer + chunk })),
    clearFollowUp: () => set({ followUpAnswer: "", followUpStatus: "idle" }),
    setFollowUpStatus: (followUpStatus) => set({ followUpStatus }),

    // ── Saved reports ─────────────────────────────────────────────────────────────
    savedReports: loadSavedReports(),
    setSavedReports: (savedReports) => set({ savedReports }),
    addReport: (report) =>
        set((state) => ({
            savedReports: [report, ...state.savedReports].slice(0, 5),
        })),
    removeReport: (id) =>
        set((state) => ({
            savedReports: state.savedReports.filter((r) => r.id !== id),
        })),

    // ── UI ────────────────────────────────────────────────────────────────────────
    activeTab: "table",
    setActiveTab: (activeTab) => set({ activeTab }),
}));