import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, AlertCircle, Clock, FileText, Zap, Shield, CheckCircle2 } from "lucide-react";
import { useAutoFlow } from "../hooks/useAutoFlow";
import { loadSessions, getSupportedAccept } from "../lib/sessionStorage";
import type { WorkSession } from "../lib/sessionStorage";

const FORMATS = [
    { ext: "CSV", color: "#34d399" },
    { ext: "XLSX", color: "#60a5fa" },
    { ext: "XLS", color: "#60a5fa" },
    { ext: "TSV", color: "#9d8ff8" },
    { ext: "ODS", color: "#fbbf24" },
];

const STEPS = [
    { n: "1", label: "Upload your file", desc: "CSV, Excel, TSV, ODS — drop or browse" },
    { n: "2", label: "AI analyzes instantly", desc: "Health score, trends, outliers — automatic" },
    { n: "3", label: "Report + live chat", desc: "Full report on the left, chat assistant on the right" },
];

export function HomePage() {
    const { run } = useAutoFlow();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<WorkSession[]>([]);

    useEffect(() => { setSessions(loadSessions()); }, []);

    const handleFile = useCallback(async (file: File) => {
        if (!/\.(csv|tsv|xlsx|xls|ods)$/i.test(file.name)) {
            setError("Unsupported format. Use CSV, TSV, XLSX, XLS or ODS."); return;
        }
        if (file.size > 20 * 1024 * 1024) { setError("File must be under 20MB."); return; }
        setError(null);
        await run(file);
    }, [run]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const f = e.dataTransfer.files[0]; if (f) handleFile(f);
    }, [handleFile]);

    return (
        <div className="min-h-[calc(100vh-52px)] flex flex-col">

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
                {/* Grid bg */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(111,106,248,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(111,106,248,0.04) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />

                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(111,106,248,0.08) 0%, transparent 70%)" }} />

                <div className="relative z-10 max-w-3xl w-full">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
                        style={{ background: "var(--accent-glow)", border: "1px solid rgba(111,106,248,0.3)", color: "var(--accent2)" }}>
                        <Zap className="w-3 h-3" />
                        AI-powered spreadsheet analysis
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-5">
                        Upload a file,<br />
                        <em className="not-italic" style={{ color: "var(--accent2)" }}>get instant insights</em>
                    </h1>
                    <p className="text-base mb-12 max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
                        Drop any spreadsheet. We parse it, detect patterns, score data quality, and generate a full AI report — automatically.
                    </p>

                    {/* Drop zone */}
                    <label
                        className="group flex flex-col items-center justify-center w-full max-w-lg mx-auto h-48 rounded-2xl cursor-pointer transition-all duration-200"
                        style={{
                            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border2)"}`,
                            background: isDragging ? "var(--accent-glow)" : "var(--surface)",
                            transform: isDragging ? "scale(1.02)" : "scale(1)",
                        }}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                    >
                        <input ref={inputRef} type="file" accept={getSupportedAccept()} className="sr-only"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                            <div className="p-4 rounded-2xl transition-all"
                                style={{ background: isDragging ? "rgba(111,106,248,0.15)" : "var(--surface2)" }}>
                                <UploadCloud className="w-8 h-8 transition-colors"
                                    style={{ color: isDragging ? "var(--accent)" : "var(--muted)" }} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">
                                    {isDragging ? "Release to analyze" : "Drag & drop your file here"}
                                </p>
                                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>or click to browse · up to 20MB</p>
                            </div>
                        </div>
                    </label>

                    {/* Format pills */}
                    <div className="flex flex-wrap justify-center gap-2 mt-5">
                        {FORMATS.map(({ ext, color }) => (
                            <span key={ext} className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                                {ext}
                            </span>
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-sm" style={{ color: "var(--red)" }}>
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────────────────────── */}
            <section className="px-6 pb-12">
                <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-3 gap-4">
                        {STEPS.map(({ n, label, desc }) => (
                            <div key={n} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <div className="text-2xl font-black mb-2" style={{ color: "var(--border2)" }}>{n}</div>
                                <p className="text-sm font-semibold">{label}</p>
                                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Recent sessions ───────────────────────────────────────────────── */}
            {sessions.length > 0 && (
                <section className="px-6 pb-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Recent work</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {sessions.slice(0, 4).map((s) => (
                                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: s.status === "done" ? "var(--green)" : s.status === "error" ? "var(--red)" : "var(--amber)" }} />
                                    <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted)" }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{s.filename}</p>
                                        <p className="text-[10px] font-mono-dm" style={{ color: "var(--muted2)" }}>{s.id.slice(-10)}</p>
                                    </div>
                                    {s.healthScore !== undefined && (
                                        <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>{s.healthScore}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Feature strip ─────────────────────────────────────────────────── */}
            <section style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="max-w-3xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: "No server storage", desc: "Files parsed in memory only" },
                        { icon: Zap, title: "Streaming AI", desc: "Responses appear word-by-word" },
                        { icon: CheckCircle2, title: "Session history", desc: "Every run gets a unique operation ID" },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex gap-3">
                            <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                            <div>
                                <p className="text-xs font-semibold">{title}</p>
                                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}