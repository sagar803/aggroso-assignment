import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface LineChartViewProps {
    data: { name: string; value: number }[];
    yLabel: string;
    color?: string;
}

export function LineChartView({ data, yLabel, color = "#6366f1" }: LineChartViewProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
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
                    name={yLabel}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}