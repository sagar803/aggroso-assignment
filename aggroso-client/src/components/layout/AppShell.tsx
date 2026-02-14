import { useCallback, useState } from "react";
import { BarChart2, Home, Activity, PlusCircle, Table } from "lucide-react";
import { useCSVStore } from "../../stores/csvStore";
import { useAutoFlow } from "../../hooks/useAutoFlow";
import { getSupportedAccept } from "../../lib/sessionStorage";
import { HomePage } from "../../pages/HomePage";
import { StatusPage } from "../../pages/StatusPage";
import { ReportPanel } from "../workspace/ReportPanel";
import { ChatPanel } from "../workspace/ChatPanel";
import { SpreadsheetDialog } from "../workspace/SpreadsheetDialog";
import ReportLoader from "../workspace/Loading";
import { ReportHistoryDropdown } from "../reports/ReportHistoryDropdown";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

export function AppShell() {
    const page = useCSVStore((s) => s.page);
    const setPage = useCSVStore((s) => s.setPage);
    const csvData = useCSVStore((s) => s.csvData);
    const clearCSV = useCSVStore((s) => s.clearCSV);
    const insightsStatus = useCSVStore((s) => s.insightsStatus);
    const flowStep = useCSVStore((s) => s.flowStep);
    const { run } = useAutoFlow();

    const [showSpreadsheet, setShowSpreadsheet] = useState(false);

    const handleNewFile = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = "";
            clearCSV();
            await run(file);
        },
        [run, clearCSV]
    );

    const isProcessing = flowStep !== "idle" && flowStep !== "done";

    return (
        <div className="min-h-screen bg-zinc-950 dark:bg-zinc-950 light:bg-white flex flex-col">
            {/* ── HEADER ─────────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 h-[52px] border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-950/85 dark:bg-zinc-950/85 light:bg-white/85 backdrop-blur-md">
                <div className="h-full px-6 flex items-center justify-between gap-5">

                    {/* Logo */}
                    <button
                        onClick={() => setPage("home")}
                        className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-[26px] h-[26px] rounded-lg bg-indigo-600 flex items-center justify-center">
                            <span className="text-sm">⚡</span>
                        </div>
                        <span className="font-semibold text-sm tracking-tight">Insights</span>
                    </button>

                    {/* File chip */}
                    {csvData && page === "workspace" && (
                        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1">
                            <span className="text-xs">📄</span>
                            <span className="text-xs font-medium max-w-[200px] truncate">
                                {csvData.filename}
                            </span>
                        </div>
                    )}

                    <div className="flex-1" />

                    {/* Health score (when on workspace) */}
                    {csvData && page === "workspace" && insightsStatus === "success" && (
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                            <div className="w-8 h-8 rounded-full bg-conic-[from_0deg,var(--tw-gradient-stops)] from-emerald-400 via-emerald-400 to-zinc-800 flex items-center justify-center relative">
                                <div className="absolute inset-1 rounded-full bg-zinc-950" />
                                <span className="relative z-10 text-[8px] font-bold text-emerald-400">82</span>
                            </div>
                            <span className="text-zinc-400">health</span>
                        </div>
                    )}

                    {/* Session ID */}
                    {csvData && (
                        <div className="font-mono text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                            op_12345
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Home button - only show on status page */}
                        {page === "status" && (
                            <button
                                onClick={() => setPage("home")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-indigo-500 hover:text-white transition-colors"
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Home</span>
                            </button>
                        )}

                        {/* Health Status button - only show on home page */}
                        {page === "home" && (
                            <button
                                onClick={() => setPage("status")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-indigo-500 hover:text-white transition-colors"
                            >
                                <Activity className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Health Status</span>
                            </button>
                        )}

                        {/* Report History Dropdown */}
                        <ReportHistoryDropdown />

                        {/* Theme Switcher */}
                        <ThemeSwitcher />

                        {/* View Spreadsheet */}
                        {csvData && page === "workspace" && !isProcessing && (
                            <button
                                onClick={() => setShowSpreadsheet(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-indigo-500 hover:text-white transition-colors"
                            >
                                <Table className="w-3.5 h-3.5" />
                                View Data
                            </button>
                        )}

                        {/* New File */}
                        {page === "workspace" && (
                            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-indigo-500 hover:text-white transition-colors cursor-pointer">
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">New file</span>
                                <input
                                    type="file"
                                    accept={getSupportedAccept()}
                                    className="sr-only"
                                    onChange={handleNewFile}
                                />
                            </label>
                        )}
                    </div>
                </div>
            </header>

            {/* ── PAGE CONTENT ───────────────────────────────────────────────────── */}
            {page === "home" && <HomePage />}

            {page === "status" && (
                <main className="flex-1">
                    <StatusPage />
                </main>
            )}

            {page === "workspace" && (
                <>
                    {isProcessing && (
                        <ReportLoader />
                    )}

                    {!isProcessing && csvData && (
                        <div className="flex flex-1 min-h-0">
                            <ReportPanel />
                            <ChatPanel />
                        </div>
                    )}
                </>
            )}

            {/* ── SPREADSHEET DIALOG ─────────────────────────────────────────────── */}
            {csvData && (
                <SpreadsheetDialog
                    open={showSpreadsheet}
                    onOpenChange={setShowSpreadsheet}
                />
            )}
        </div>
    );
}