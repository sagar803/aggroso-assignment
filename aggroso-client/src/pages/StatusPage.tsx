import { useState } from "react";
import { RefreshCw, Server, HardDrive, Wifi, Activity, Database } from "lucide-react";

type CheckStatus = "checking" | "ok" | "error" | "warn";

interface HealthCheck {
    name: string;
    status: CheckStatus;
    latency?: number;
    detail?: string;
}

function Dot({ status }: { status: CheckStatus }) {
    const color =
        status === "ok" ? "var(--green)" :
            status === "error" ? "var(--red)" :
                status === "warn" ? "var(--amber)" : "var(--muted2)";
    return (
        <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block"
            style={{
                background: color, boxShadow: status === "ok" ? `0 0 5px ${color}` : "none",
                animation: status === "checking" ? "glowPulse 1.2s ease-in-out infinite" : "none"
            }} />
    );
}

export function StatusPage() {
    const [checks, setChecks] = useState<HealthCheck[]>([
        { name: "API Server", status: "checking" },
        { name: "AI Service (OpenAI)", status: "checking" },
        { name: "Network", status: "checking" },
    ]);
    const [refreshing, setRefreshing] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    async function runChecks() {
        setRefreshing(true);
        const out: HealthCheck[] = [];

        // API health
        try {
            const t = Date.now();
            const r = await fetch(`${process.env.REACT_APP_API_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
            const lat = Date.now() - t;
            out.push(r.ok
                ? { name: "API Server", status: "ok", latency: lat, detail: `Responded in ${lat}ms` }
                : { name: "API Server", status: "error", detail: `HTTP ${r.status}` });
        } catch {
            out.push({ name: "API Server", status: "error", detail: "Connection refused — is the server running?" });
        }

        // AI probe
        try {
            const t = Date.now();
            const r = await fetch(`${process.env.REACT_APP_API_URL}/api/insights`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: "ping.csv", rowCount: 1, columnCount: 1,
                    columns: [{ name: "v", type: "numeric", nullCount: 0, uniqueCount: 1, sampleValues: [1] }],
                    sampleRows: [{ v: 1 }]
                }),
                signal: AbortSignal.timeout(12000),
            });
            const lat = Date.now() - t;
            out.push(r.ok
                ? { name: "AI Service (OpenAI)", status: "ok", latency: lat, detail: `Responded in ${lat}ms` }
                : r.status === 400
                    ? { name: "AI Service (OpenAI)", status: "warn", detail: "Server reachable, verify API key" }
                    : { name: "AI Service (OpenAI)", status: "error", detail: `HTTP ${r.status}` });
        } catch {
            out.push({ name: "AI Service (OpenAI)", status: "error", detail: "Timed out or server unavailable" });
        }

        // Network
        out.push({
            name: "Network", status: navigator.onLine ? "ok" : "error",
            detail: navigator.onLine ? "Browser reports online" : "Browser reports offline"
        });

        setChecks(out);
        setLastChecked(new Date());
        setRefreshing(false);
    }


    const allOk = checks.every(c => c.status === "ok");
    const hasErr = checks.some(c => c.status === "error");
    const overallColor = hasErr ? "var(--red)" : allOk ? "var(--green)" : "var(--amber)";
    const overallLabel = hasErr ? "Service degraded" : allOk ? "All systems operational" : "Checking…";

    return (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

            {/* Overall banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl border"
                style={{ borderColor: `${overallColor}40`, background: `${overallColor}0d` }}>
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5" style={{ color: overallColor }} />
                    <div>
                        <p className="text-sm font-semibold">{overallLabel}</p>
                        {lastChecked && <p className="text-xs" style={{ color: "var(--muted)" }}>Last checked: {lastChecked.toLocaleTimeString()}</p>}
                    </div>
                </div>
                <button onClick={runChecks} disabled={refreshing}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50"
                    style={{ borderColor: "var(--border2)", color: "var(--muted)", background: "var(--surface2)" }}>
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Service checks */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4" style={{ color: "var(--muted)" }} />
                    <h2 className="text-sm font-semibold">Services</h2>
                </div>
                <div className="rounded-2xl border overflow-hidden divide-y"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    {checks.map((c) => (
                        <div key={c.name} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <Dot status={c.status} />
                                <div>
                                    <p className="text-sm font-medium">{c.name}</p>
                                    {c.detail && <p className="text-xs" style={{ color: "var(--muted)" }}>{c.detail}</p>}
                                </div>
                            </div>
                            {c.latency !== undefined && (
                                <span className="font-mono-dm text-xs" style={{ color: "var(--muted2)" }}>{c.latency}ms</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}