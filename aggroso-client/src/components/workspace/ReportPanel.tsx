import { useCallback, useState } from "react";
import { Save, Check } from "lucide-react";
import { useCSVStore } from "../../stores/csvStore";
import { useReportStorage } from "../../hooks/useReportStorage";

export function ReportPanel() {
    const csvData = useCSVStore((s) => s.csvData);
    const insights = useCSVStore((s) => s.insights);
    const { saveReport } = useReportStorage();

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    const handleSaveReport = useCallback(() => {
        if (!csvData || !insights) {
            console.error("Cannot save: missing CSV data or insights");
            return;
        }

        setSaveStatus("saving");

        try {
            saveReport(csvData.filename || "report.csv", csvData, insights);
            setSaveStatus("saved");

            // Reset to idle after 2 seconds
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
            console.error("Failed to save report:", error);
            setSaveStatus("idle");
        }
    }, [csvData, insights, saveReport]);

    // Don't render if no data or insights (loading handled at top level)
    if (!csvData || !insights) return null;

    const scoreColor =
        insights.healthScore >= 80
            ? "text-emerald-400"
            : insights.healthScore >= 60
                ? "text-amber-400"
                : "text-red-400";

    const ringColor =
        insights.healthScore >= 80
            ? "stroke-emerald-400"
            : insights.healthScore >= 60
                ? "stroke-amber-400"
                : "stroke-red-400";

    return (
        <div className="flex-1 min-w-0 overflow-y-auto px-9 py-8 flex flex-col gap-7 border-r border-zinc-800">

            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="text-3xl leading-tight tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        {csvData.filename.split(".")[0]}_
                        <span className="italic text-indigo-400">
                            {csvData.filename.split(".")[1]}
                        </span>
                        .{csvData.filename.split(".").pop()}
                    </div>

                    <div className="text-xs text-zinc-400 mt-1.5">
                        {csvData.rowCount.toLocaleString()} rows · {csvData.columnCount} columns
                    </div>
                </div>

                {/* Save Report Button */}
                <button
                    onClick={handleSaveReport}
                    disabled={saveStatus === "saving"}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 shrink-0 ${saveStatus === "saved"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white"
                        } ${saveStatus === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {saveStatus === "saved" ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>Saved!</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Save Report</span>
                        </>
                    )}
                </button>
            </div>

            {/* DATA HEALTH */}
            <section>
                <div className="text-[10px] uppercase tracking-[1.5px] text-zinc-500 mb-3 font-semibold">
                    Data Health
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex gap-6 items-center">

                    <div className="relative w-20 h-20 shrink-0">
                        <svg width="80" height="80" className="-rotate-90">
                            <circle cx="40" cy="40" r="34" strokeWidth="8" className="stroke-zinc-800 fill-none" />
                            <circle
                                cx="40"
                                cy="40"
                                r="34"
                                strokeWidth="8"
                                strokeDasharray="213.6"
                                strokeDashoffset={213.6 - (213.6 * insights.healthScore) / 100}
                                className={`fill-none ${ringColor} transition-all duration-1000`}
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className={`absolute inset-0 flex flex-col items-center justify-center text-xl font-bold ${scoreColor}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                            {insights.healthScore}
                            <small className="text-[9px] text-zinc-500 font-normal">/100</small>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className={`text-sm font-semibold ${scoreColor}`}>
                            {insights.healthScore >= 80
                                ? "Good quality"
                                : insights.healthScore >= 60
                                    ? "Fair quality"
                                    : "Needs attention"}
                        </div>

                        {[
                            ["Completeness", insights.healthBreakdown.completeness, "bg-emerald-400"],
                            ["Consistency", insights.healthBreakdown.consistency, "bg-amber-400"],
                            ["Diversity", insights.healthBreakdown.diversity, "bg-blue-400"],
                        ].map(([label, value, color]) => (
                            <div key={label as string} className="flex items-center gap-2.5 text-xs">
                                <span className="w-[88px] text-zinc-400">{label}</span>
                                <div className="flex-1 h-1 bg-zinc-800 rounded overflow-hidden">
                                    <div
                                        className={`h-full ${color} transition-all duration-1000`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                <span className="w-7 text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SUMMARY */}
            <section>
                <div className="text-[10px] uppercase tracking-[1.5px] text-zinc-500 mb-3 font-semibold">
                    Summary
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm leading-[1.75] text-zinc-300">
                    {insights.summary}
                </div>
            </section>

            {/* INSIGHTS */}
            <section>
                <div className="text-[10px] uppercase tracking-[1.5px] text-zinc-500 mb-3 font-semibold">
                    Key Findings
                </div>

                <div className="space-y-2.5">
                    {insights.insights.map((insight, i) => {
                        // Get colors with fallback for unknown types
                        const getColors = (type: string) => {
                            const colorMap: Record<string, { border: string; bg: string; icon: string }> = {
                                trend: { border: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: '📈' },
                                outlier: { border: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: '⚠️' },
                                positive: { border: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: '✅' },
                                quality: { border: '#6f6af8', bg: 'rgba(111,106,248,0.15)', icon: '🔍' },
                                warning: { border: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: '📉' }
                            };
                            return colorMap[type] || colorMap.quality; // fallback to quality color
                        };

                        const colors = getColors(insight.type);

                        return (
                            <div
                                key={i}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex gap-3"
                                style={{ borderLeftWidth: '3px', borderLeftColor: colors.border }}
                            >
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                                    style={{ background: colors.bg }}
                                >
                                    {colors.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold mb-0.5">{insight.title}</div>
                                    <div className="text-xs text-zinc-400 leading-relaxed">{insight.description}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* NEXT STEPS */}
            {insights.nextSteps?.length > 0 && (
                <section>
                    <div className="text-[10px] uppercase tracking-[1.5px] text-zinc-500 mb-3 font-semibold">
                        Suggested Next Steps
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        {insights.nextSteps.map((step, i) => (
                            <div
                                key={i}
                                className="flex gap-2.5 text-xs text-zinc-400 py-2 border-b border-zinc-800 last:border-0 last:pb-0 first:pt-0"
                            >
                                <span className="text-indigo-400 text-sm leading-relaxed shrink-0">→</span>
                                <span className="flex-1 leading-relaxed">{step}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}