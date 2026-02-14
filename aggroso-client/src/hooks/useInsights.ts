import { useCSVStore } from "../stores/csvStore";
import { analyzeColumnsClient } from "../lib/csvUtils";
import type { InsightsRequest } from "../types/schema";

export function useInsights() {
    const csvData = useCSVStore((s) => s.csvData);
    const selectedColumns = useCSVStore((s) => s.selectedColumns);
    const setInsights = useCSVStore((s) => s.setInsights);
    const setInsightsStatus = useCSVStore((s) => s.setInsightsStatus);
    const setInsightsError = useCSVStore((s) => s.setInsightsError);

    async function generateInsights() {
        if (!csvData) return;

        setInsightsStatus("loading");

        try {
            // Compute column statistics client-side before sending
            const columns = analyzeColumnsClient(csvData.rows, csvData.headers);

            const payload: InsightsRequest = {
                filename: csvData.filename,
                rowCount: csvData.rowCount,
                columnCount: csvData.columnCount,
                columns,
                sampleRows: csvData.rows.slice(0, 10),
                selectedColumns:
                    selectedColumns.length < csvData.headers.length
                        ? selectedColumns
                        : undefined,
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
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to generate insights";
            setInsightsError(message);
        }
    }

    return { generateInsights };
}