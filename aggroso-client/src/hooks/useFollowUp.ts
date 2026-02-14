import { useCSVStore } from "../stores/csvStore";
import { analyzeColumnsClient } from "../lib/csvUtils";
import type { FollowUpRequest } from "../types/schema";

export function useFollowUp() {
    const csvData = useCSVStore((s) => s.csvData);
    const insights = useCSVStore((s) => s.insights);
    const appendChunk = useCSVStore((s) => s.appendFollowUpChunk);
    const clearFollowUp = useCSVStore((s) => s.clearFollowUp);
    const setStatus = useCSVStore((s) => s.setFollowUpStatus);

    async function askFollowUp(question: string) {
        if (!csvData || !insights) return;

        clearFollowUp();
        setStatus("streaming");

        try {
            const columns = analyzeColumnsClient(csvData.rows, csvData.headers);

            const payload: FollowUpRequest = {
                question,
                filename: csvData.filename,
                columns,
                rowCount: csvData.rowCount,
                previousInsights: insights.summary,
                sampleRows: csvData.rows.slice(0, 8),
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/followup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Follow-up request failed");
            }

            // Read the streamed plain-text response chunk by chunk
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No response body");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                appendChunk(chunk);
            }

            setStatus("done");
        } catch (err) {
            console.error("Follow-up error:", err);
            setStatus("error");
        }
    }

    return { askFollowUp };
}