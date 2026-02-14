import { useState, useRef, useEffect } from "react";
import { Clock, FileText, X } from "lucide-react";
import { useReportStorage } from "../../hooks/useReportStorage";
import { useCSVStore } from "../../stores/csvStore";

export function ReportHistoryDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { savedReports, deleteReport } = useReportStorage();
    const setPage = useCSVStore((s) => s.setPage);
    const setCsvData = useCSVStore((s) => s.setCsvData);
    const setInsights = useCSVStore((s) => s.setInsights);
    const setInsightsStatus = useCSVStore((s) => s.setInsightsStatus);
    const setFlowStep = useCSVStore((s) => s.setFlowStep);

    // Debug: Log reports whenever they change
    useEffect(() => {
        console.log("💾 Saved reports:", savedReports);
        console.log("📊 Report count:", savedReports.length);
    }, [savedReports]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const handleLoadReport = (reportId: string) => {
        const report = savedReports.find((r) => r.id === reportId);
        if (!report) return;

        try {
            // Load the report data into the store
            setCsvData(report.csvData);
            setInsights(report.insights);
            setInsightsStatus("success");
            setFlowStep("done");
            setPage("workspace");
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to load report:", error);
        }
    };

    const handleDeleteReport = (e: React.MouseEvent, reportId: string) => {
        e.stopPropagation();
        deleteReport(reportId);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-indigo-500 hover:text-white transition-colors relative"
            >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
                {savedReports.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        {savedReports.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Recent Reports</span>
                        <span className="text-[10px] text-zinc-500">{savedReports.length} saved</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {savedReports.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">No reports yet</p>
                                <p className="text-[10px] text-zinc-600 mt-1">
                                    Upload a file to create your first report
                                </p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {savedReports.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => handleLoadReport(report.id)}
                                        className="w-full px-3 py-2.5 hover:bg-zinc-800 transition-colors flex items-start gap-2.5 group text-left"
                                    >
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                                            <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-xs font-medium text-zinc-200 truncate">
                                                    {report.filename}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteReport(e, report.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition-all flex-shrink-0"
                                                >
                                                    <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-zinc-500">
                                                    {formatDate(report.createdAt)}
                                                </span>
                                                <span className="text-[10px] text-zinc-600">•</span>
                                                <span className="text-[10px] text-zinc-500">
                                                    {report.rowCount.toLocaleString()} rows
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}