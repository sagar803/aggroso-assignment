import { useCSVStore } from "../../stores/csvStore";
import { ChatPanel } from "./ChatPanel";
import { ReportPanel } from "./ReportPanel";
import ReportLoader from "./Loading";

export function WorkspaceView() {
    const csvData = useCSVStore((s) => s.csvData);
    const insightsStatus = useCSVStore((s) => s.insightsStatus);
    const insights = useCSVStore((s) => s.insights);

    // Don't render if no data
    if (!csvData) return null;

    // Show loading screen while insights are being generated
    if (insightsStatus === "loading" || !insights) {
        return <ReportLoader />;
    }

    // Show the split workspace when ready
    return (
        <div className="flex flex-1 min-h-0">
            <ReportPanel />
            <ChatPanel />
        </div>
    );
}