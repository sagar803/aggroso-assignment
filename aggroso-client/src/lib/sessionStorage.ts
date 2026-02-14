// ── Types ─────────────────────────────────────────────────────────────────────

export type SessionStatus = "uploading" | "parsing" | "analyzing" | "done" | "error";
export type FileFormat = "csv" | "xlsx" | "xls" | "tsv" | "ods";

export interface WorkSession {
    id: string;                    // Unique operation ID e.g. "op_1718123456_abc123"
    filename: string;
    format: FileFormat;
    rowCount: number;
    columnCount: number;
    status: SessionStatus;
    startedAt: string;             // ISO timestamp
    completedAt?: string;
    healthScore?: number;
    insightsSummary?: string;
    headers: string[];
}

// ── Storage key ───────────────────────────────────────────────────────────────
const SESSIONS_KEY = "csv-insights:sessions";
const MAX_SESSIONS = 10;

// ── Generate unique operation ID ──────────────────────────────────────────────
export function generateOperationId(): string {
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    return `op_${ts}_${rand}`;
}

// ── CRUD helpers ──────────────────────────────────────────────────────────────
export function loadSessions(): WorkSession[] {
    try {
        const raw = localStorage.getItem(SESSIONS_KEY);
        return raw ? (JSON.parse(raw) as WorkSession[]) : [];
    } catch {
        return [];
    }
}

export function saveSession(session: WorkSession): void {
    try {
        const all = loadSessions().filter((s) => s.id !== session.id);
        const updated = [session, ...all].slice(0, MAX_SESSIONS);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    } catch {
        // Storage full — silently skip
    }
}

export function updateSession(id: string, patch: Partial<WorkSession>): void {
    try {
        const all = loadSessions();
        const idx = all.findIndex((s) => s.id === id);
        if (idx !== -1) {
            all[idx] = { ...all[idx], ...patch };
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
        }
    } catch { }
}

export function deleteSession(id: string): void {
    try {
        const all = loadSessions().filter((s) => s.id !== id);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
    } catch { }
}

export function clearAllSessions(): void {
    try {
        localStorage.removeItem(SESSIONS_KEY);
    } catch { }
}

// ── Format detection ──────────────────────────────────────────────────────────
export function detectFormat(filename: string): FileFormat {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "xlsx") return "xlsx";
    if (ext === "xls") return "xls";
    if (ext === "tsv") return "tsv";
    if (ext === "ods") return "ods";
    return "csv";
}

export function getSupportedAccept(): string {
    return ".csv,.tsv,.xlsx,.xls,.ods";
}

export function formatLabel(format: FileFormat): string {
    const labels: Record<FileFormat, string> = {
        csv: "CSV",
        tsv: "TSV",
        xlsx: "Excel",
        xls: "Excel (Legacy)",
        ods: "OpenDocument",
    };
    return labels[format];
}