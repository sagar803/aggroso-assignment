import { useState, useMemo } from "react";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { BarChart2, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCSVStore } from "../../stores/csvStore";

type ChartType = "bar" | "line" | "pie";

const COLORS = [
    "#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899",
    "#14b8a6", "#f97316", "#8b5cf6", "#22c55e", "#ef4444",
];

type ColType = "numeric" | "date" | "categorical" | "id" | "unknown";
type RawRow = Record<string, string | number | null>;

function inferType(values: (string | number | null)[]): ColType {
    const nonNull = values.filter((v) => v !== null && v !== "");
    if (nonNull.length === 0) return "unknown";
    const numericRatio =
        nonNull.filter(
            (v) => typeof v === "number" || (typeof v === "string" && !isNaN(Number(v)))
        ).length / nonNull.length;
    if (numericRatio > 0.85) return "numeric";
    const dateRatio =
        nonNull.filter((v) => {
            const d = new Date(String(v));
            return !isNaN(d.getTime()) && String(v).length > 4;
        }).length / nonNull.length;
    if (dateRatio > 0.75) return "date";
    const uniqueRatio = new Set(nonNull.map(String)).size / nonNull.length;
    if (uniqueRatio < 0.5 || new Set(nonNull.map(String)).size <= 20)
        return "categorical";
    return "unknown";
}

// ✅ Use Recharts' own type — name and percent are both possibly undefined
const renderPieLabel = (props: PieLabelRenderProps): string => {
    const name = props.name ?? "";
    const percent = typeof props.percent === "number" ? props.percent : 0;
    return `${name} ${(percent * 100).toFixed(0)}%`;
};

export function ChartPanel() {
    const csvData = useCSVStore((s) => s.csvData);
    const rows: RawRow[] = csvData?.rows ?? [];
    const headers: string[] = csvData?.headers ?? [];

    const colTypes = useMemo(() => {
        return headers.reduce((acc, col) => {
            acc[col] = inferType(rows.map((r) => r[col] ?? null));
            return acc;
        }, {} as Record<string, ColType>);
    }, [rows, headers]);

    const numericCols = useMemo(
        () => headers.filter((h) => colTypes[h] === "numeric"),
        [headers, colTypes]
    );
    const categoricalCols = useMemo(
        () =>
            headers.filter(
                (h) => colTypes[h] === "categorical" || colTypes[h] === "date"
            ),
        [headers, colTypes]
    );

    const [chartType, setChartType] = useState<ChartType>("bar");
    const [xAxis, setXAxis] = useState<string>(
        () => categoricalCols[0] ?? headers[0] ?? ""
    );
    const [yAxis, setYAxis] = useState<string>(() => numericCols[0] ?? "");

    const chartData = useMemo(() => {
        if (!xAxis || !yAxis) return [];
        const agg: Record<string, number[]> = {};
        rows.forEach((row) => {
            const key = String(row[xAxis] ?? "N/A");
            const val = Number(row[yAxis]);
            if (!isNaN(val)) {
                agg[key] = [...(agg[key] ?? []), val];
            }
        });
        return Object.entries(agg)
            .map(([name, vals]) => ({
                name,
                value: parseFloat(
                    (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
                ),
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 30);
    }, [rows, xAxis, yAxis]);

    if (!csvData) return null;

    if (numericCols.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                No numeric columns detected for charting.
            </div>
        );
    }

    const TABS: [ChartType, React.ElementType, string][] = [
        ["bar", BarChart2, "Bar"],
        ["line", TrendingUp, "Line"],
        ["pie", PieIcon, "Pie"],
    ];

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Chart type toggle */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    {TABS.map(([type, Icon, label]) => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                chartType === type
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Axis selectors */}
                <div className="flex gap-2 items-center text-sm">
                    <span className="text-muted-foreground text-xs">
                        {chartType === "pie" ? "Group by:" : "X axis:"}
                    </span>
                    <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                    >
                        {(chartType === "pie" ? categoricalCols : headers).map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </select>

                    <span className="text-muted-foreground text-xs">
                        {chartType === "pie" ? "Value:" : "Y axis:"}
                    </span>
                    <select
                        value={yAxis}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                    >
                        {numericCols.map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart area */}
            <div className="rounded-xl border bg-card p-4 h-80">
                <p className="text-xs text-muted-foreground mb-3 font-medium">
                    {yAxis} by {xAxis}
                    <span className="ml-1 opacity-60">(avg per group)</span>
                </p>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                        <BarChart
                            data={chartData}
                            margin={{ top: 4, right: 16, left: 0, bottom: 40 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                angle={-35}
                                textAnchor="end"
                                interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar
                                dataKey="value"
                                name={yAxis}
                                fill={COLORS[0]}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    ) : chartType === "line" ? (
                        <LineChart
                            data={chartData}
                            margin={{ top: 4, right: 16, left: 0, bottom: 40 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                angle={-35}
                                textAnchor="end"
                                interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name={yAxis}
                                stroke={COLORS[0]}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    ) : (
                        <PieChart>
                            {/* ✅ renderPieLabel is typed against PieLabelRenderProps */}
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label={renderPieLabel}
                                labelLine={false}
                            >
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}