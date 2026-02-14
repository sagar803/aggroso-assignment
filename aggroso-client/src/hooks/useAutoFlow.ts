import { useCallback } from "react";
import { useCSVStore } from "../stores/csvStore";
import { useFileParser } from "../hooks/useFileParser";
import { analyzeColumnsClient } from "../lib/csvUtils";
import {
    generateOperationId,
    detectFormat,
    saveSession,
    updateSession,
} from "../lib/sessionStorage";
import type { InsightsRequest } from "../types/schema";

export function useAutoFlow() {
    const { parseFile } = useFileParser();
    const setFlowStep = useCSVStore((s) => s.setFlowStep);
    const setInsights = useCSVStore((s) => s.setInsights);
    const setInsightsStatus = useCSVStore((s) => s.setInsightsStatus);
    const setInsightsError = useCSVStore((s) => s.setInsightsError);
    const setSessionId = useCSVStore((s) => s.setSessionId);
    const setPage = useCSVStore((s) => s.setPage);
    const setSessions = useCSVStore((s) => s.setSessions);

    const run = useCallback(
        async (file: File) => {
            // ── 1. Create session ─────────────────────────────────────────────────────
            const id = generateOperationId();
            const format = detectFormat(file.name);
            setSessionId(id);
            setFlowStep("upload");

            const session = {
                id,
                filename: file.name,
                format,
                rowCount: 0,
                columnCount: 0,
                status: "parsing" as const,
                startedAt: new Date().toISOString(),
                headers: [],
            };
            saveSession(session);

            // Navigate to workspace immediately so user sees progress
            setPage("workspace");

            // ── 2. Parse file ─────────────────────────────────────────────────────────
            let csvData;
            try {
                csvData = await parseFile(file);
                updateSession(id, {
                    rowCount: csvData.rowCount,
                    columnCount: csvData.columnCount,
                    headers: csvData.headers,
                    status: "analyzing",
                });
            } catch (err) {
                updateSession(id, { status: "error" });
                setInsightsError(
                    err instanceof Error ? err.message : "Failed to parse file"
                );
                setFlowStep("idle");
                return;
            }

            // ── 3. Auto-trigger insights ──────────────────────────────────────────────
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

                // Update session with results
                updateSession(id, {
                    status: "done",
                    completedAt: new Date().toISOString(),
                    healthScore: data.healthScore,
                    insightsSummary: data.summary,
                });

                // Refresh sessions list in store
                const { loadSessions } = await import("../lib/sessionStorage");
                setSessions(loadSessions());
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to generate insights";
                setInsightsError(msg);
                setFlowStep("idle");
                updateSession(id, { status: "error" });
            }
        },
        [parseFile, setFlowStep, setInsights, setInsightsStatus, setInsightsError,
            setSessionId, setPage, setSessions]
    );

    return { run };
}