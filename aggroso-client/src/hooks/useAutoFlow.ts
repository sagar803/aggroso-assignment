import { useCallback } from "react";
import { useCSVStore } from "../stores/csvStore";
import { useFileParser } from "../hooks/useFileParser";
import { analyzeColumnsClient } from "../lib/csvUtils";
import type { InsightsRequest } from "../types/schema";

export function useAutoFlow() {
    const { parseFile } = useFileParser();
    const setFlowStep = useCSVStore((s) => s.setFlowStep);
    const setInsights = useCSVStore((s) => s.setInsights);
    const setInsightsStatus = useCSVStore((s) => s.setInsightsStatus);
    const setInsightsError = useCSVStore((s) => s.setInsightsError);
    const setPage = useCSVStore((s) => s.setPage);

    const run = useCallback(
        async (file: File) => {
            // Navigate to workspace immediately so user sees progress
            setPage("workspace");
            setFlowStep("upload");

            // ── Parse file ─────────────────────────────────────────────────────────
            let csvData;
            try {
                csvData = await parseFile(file);
            } catch (err) {
                setInsightsError(
                    err instanceof Error ? err.message : "Failed to parse file"
                );
                setFlowStep("idle");
                return;
            }

            // ── Auto-trigger insights ──────────────────────────────────────────────
            setFlowStep("analyze");
            setInsightsStatus("loading");

            try {
                const columns = analyzeColumnsClient(csvData.rows, csvData.headers);

                const payload: InsightsRequest = {
                    filename: csvData.filename,
                    rowCount: csvData.rowCount,
                    columnCount: csvData.columnCount,
                    columns,
                    sampleRows: csvData.rows.slice(0, 10),
                };

                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/insights`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.details ?? err.error ?? "Request failed");
                }

                const data = await res.json();
                setInsights(data);
                setFlowStep("done");
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to generate insights";
                setInsightsError(msg);
                setFlowStep("idle");
            }
        },
        [parseFile, setFlowStep, setInsights, setInsightsStatus, setInsightsError, setPage]
    );

    return { run };
}