import { useState } from "react";
import { X, Download, Search } from "lucide-react";
import { useCSVStore } from "../../stores/csvStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

interface SpreadsheetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SpreadsheetDialog({ open, onOpenChange }: SpreadsheetDialogProps) {
    const csvData = useCSVStore((s) => s.csvData);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);

    if (!csvData) return null;

    const PAGE_SIZE = 50;
    const totalPages = Math.ceil(csvData.rowCount / PAGE_SIZE);
    const startIdx = page * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, csvData.rowCount);

    // Filter rows by search query
    const filteredRows = searchQuery
        ? csvData.rows.filter((row) =>
            Object.values(row).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        : csvData.rows;

    const visibleRows = filteredRows.slice(startIdx, endIdx);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-zinc-900 border-zinc-800">
                <DialogHeader className="px-6 py-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-semibold">
                            {csvData.filename}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">
                                {csvData.rowCount.toLocaleString()} rows × {csvData.columnCount} columns
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                {/* Search & Actions */}
                <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search in data..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(0);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-400 hover:border-indigo-500 hover:text-white transition">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 bg-zinc-900 border-r border-zinc-800 w-12">
                                    #
                                </th>
                                {csvData.headers.map((header) => (
                                    <th
                                        key={header}
                                        className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 bg-zinc-900 border-r border-zinc-800 whitespace-nowrap"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row, idx) => {
                                const rowNum = startIdx + idx + 1;
                                return (
                                    <tr
                                        key={rowNum}
                                        className="border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                                    >
                                        <td className="px-4 py-2.5 text-xs text-zinc-500 font-mono border-r border-zinc-800 bg-zinc-900/50">
                                            {rowNum}
                                        </td>
                                        {csvData.headers.map((header) => {
                                            const value = row[header];
                                            return (
                                                <td
                                                    key={header}
                                                    className="px-4 py-2.5 text-xs text-zinc-300 border-r border-zinc-800 max-w-[300px] truncate"
                                                    title={value !== null ? String(value) : undefined}
                                                >
                                                    {value === null || value === "" ? (
                                                        <span className="text-zinc-600 italic">null</span>
                                                    ) : (
                                                        String(value)
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between">
                    <div className="text-xs text-zinc-400">
                        Showing {startIdx + 1}–{endIdx} of {filteredRows.length.toLocaleString()}
                        {searchQuery && ` (filtered from ${csvData.rowCount.toLocaleString()})`}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                            className="px-2 py-1 text-xs border border-zinc-700 rounded bg-zinc-800 text-zinc-400 hover:border-indigo-500 hover:text-white disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400 transition"
                        >
                            «
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-2 py-1 text-xs border border-zinc-700 rounded bg-zinc-800 text-zinc-400 hover:border-indigo-500 hover:text-white disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400 transition"
                        >
                            ‹
                        </button>
                        <span className="px-3 py-1 text-xs text-zinc-400 font-mono">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-2 py-1 text-xs border border-zinc-700 rounded bg-zinc-800 text-zinc-400 hover:border-indigo-500 hover:text-white disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400 transition"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => setPage(totalPages - 1)}
                            disabled={page >= totalPages - 1}
                            className="px-2 py-1 text-xs border border-zinc-700 rounded bg-zinc-800 text-zinc-400 hover:border-indigo-500 hover:text-white disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400 transition"
                        >
                            »
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}