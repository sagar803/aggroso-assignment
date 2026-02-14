import { useState } from "react";
import { useCSVStore } from "../../stores/csvStore";
import { useFollowUp } from "../../hooks/useFollowUp";

export function ChatPanel() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<
        Array<{ role: "user" | "assistant"; text: string }>
    >([
        {
            role: "assistant",
            text: "I've analyzed your dataset. I know your columns, data types, outliers, and the full report context. Ask me anything about this dataset.",
        },
    ]);

    const followUpStatus = useCSVStore((s) => s.followUpStatus);
    const followUpAnswer = useCSVStore((s) => s.followUpAnswer);
    const clearFollowUp = useCSVStore((s) => s.clearFollowUp);
    const { askFollowUp } = useFollowUp();

    function handleSend() {
        if (!input.trim() || followUpStatus === "streaming") return;

        setMessages((prev) => [...prev, { role: "user", text: input }]);
        const question = input;
        setInput("");

        clearFollowUp();
        askFollowUp(question);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleSuggestion(text: string) {
        setInput(text);
    }

    const showingAIResponse =
        followUpStatus === "streaming" || followUpStatus === "done";

    const allMessages =
        showingAIResponse && followUpAnswer
            ? [...messages, { role: "assistant" as const, text: followUpAnswer }]
            : messages;

    return (
        <div className="w-[360px] flex flex-col bg-zinc-900 sticky top-[52px] h-[calc(100vh-52px)] overflow-hidden border-l border-zinc-800">

            {/* HEADER */}
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                    Ask about your data
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                    Context-aware · knows your full dataset
                </div>
            </div>

            {/* SUGGESTIONS */}
            <div className="px-4 py-3 border-b border-zinc-800 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                    Suggested
                </div>

                {[
                    "Why did revenue drop in December?",
                    "Which columns have the most null values?",
                    "Explain the outliers",
                ].map((s) => (
                    <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white transition"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                {allMessages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${msg.role === "assistant"
                                    ? "bg-indigo-500/10 border border-indigo-500 text-indigo-300"
                                    : "bg-zinc-800 border border-zinc-700"
                                }`}
                        >
                            {msg.role === "assistant" ? "⚡" : "👤"}
                        </div>

                        <div
                            className={`max-w-[260px] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === "assistant"
                                    ? "bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-bl-sm"
                                    : "bg-indigo-600 text-white rounded-br-sm"
                                }`}
                        >
                            {msg.text}

                            {msg.role === "assistant" &&
                                i === allMessages.length - 1 &&
                                followUpStatus === "streaming" && (
                                    <span className="inline-block w-[3px] h-4 bg-indigo-400 ml-1 animate-pulse" />
                                )}
                        </div>
                    </div>
                ))}

                {followUpStatus === "streaming" && !followUpAnswer && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-indigo-500/10 border border-indigo-500 text-indigo-300">
                            ⚡
                        </div>

                        <div className="px-3 py-2 rounded-xl rounded-bl-sm border border-zinc-700 bg-zinc-800 flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-end gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition">
                    <textarea
                        className="flex-1 bg-transparent resize-none outline-none text-xs text-white placeholder-zinc-500 max-h-[80px]"
                        rows={1}
                        placeholder="Ask a follow-up question…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={followUpStatus === "streaming"}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || followUpStatus === "streaming"}
                        className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
                    >
                        ↑
                    </button>
                </div>

                <div className="text-[10px] text-zinc-500 mt-2 text-center">
                    Enter to send · Shift+Enter for new line
                </div>
            </div>
        </div>
    );
}
