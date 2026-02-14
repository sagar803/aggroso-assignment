import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";

const COLORS = [
    "#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899",
    "#14b8a6", "#f97316", "#8b5cf6", "#22c55e", "#ef4444",
];

// ✅ Correctly typed against Recharts' own PieLabelRenderProps
const renderLabel = (props: PieLabelRenderProps): string => {
    const name = props.name ?? "";
    const percent = typeof props.percent === "number" ? props.percent : 0;
    return `${name} ${(percent * 100).toFixed(0)}%`;
};

interface PieChartViewProps {
    data: { name: string; value: number }[];
}

export function PieChartView({ data }: PieChartViewProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={renderLabel}
                    labelLine={false}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}