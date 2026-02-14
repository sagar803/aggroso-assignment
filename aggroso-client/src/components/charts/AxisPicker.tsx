interface AxisPickerProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export function AxisPicker({ label, value, options, onChange }: AxisPickerProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs">{label}:</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-xs border rounded px-2 py-1 bg-background"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}