import { useEffect, useRef } from "react";
import { useCSVStore } from "../stores/csvStore";
import type { SavedReport } from "../types/schema";
import type { ParsedCSV } from "../types/csv.types";
import type { InsightsResult } from "../types/insights.types";

const STORAGE_KEY = "csv-insights:reports";
const MAX_REPORTS = 5;

export function useReportStorage() {
    const savedReports = useCSVStore((s) => s.savedReports);
    const setSavedReports = useCSVStore((s) => s.setSavedReports);
    const addReportToStore = useCSVStore((s) => s.addReport);
    const removeReportFromStore = useCSVStore((s) => s.removeReport);

    // Track if we've loaded from localStorage yet
    const hasLoaded = useRef(false);

    // Load from localStorage on mount (runs ONCE)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: SavedReport[] = JSON.parse(raw);
                setSavedReports(parsed.slice(0, MAX_REPORTS));
            }
            hasLoaded.current = true;
        } catch {
            // Silently ignore corrupt storage
            hasLoaded.current = true;
        }
    }, [setSavedReports]);

    // Persist whenever reports change (but ONLY after initial load)
    useEffect(() => {
        if (!hasLoaded.current) {
            // Don't save until we've loaded first
            return;
        }

        try {
            console.log('Saving reports to localStorage:', savedReports.length);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReports));
        } catch {
            // Storage might be full; silently ignore
        }
    }, [savedReports]);

    function saveReport(
        filename: string,
        csvData: ParsedCSV,
        insights: InsightsResult
    ) {
        const report: SavedReport = {
            id: crypto.randomUUID(),
            filename,
            createdAt: new Date().toISOString(),
            rowCount: csvData.rowCount,
            columnCount: csvData.columnCount,
            csvData, // Save the full CSV data
            insights, // Save the full insights object
            healthScore: insights.healthScore,
        };
        addReportToStore(report);
        return report;
    }

    function deleteReport(id: string) {
        removeReportFromStore(id);
    }

    function clearAllReports() {
        setSavedReports([]);
        localStorage.removeItem(STORAGE_KEY);
    }

    return { savedReports, saveReport, deleteReport, clearAllReports };
}