function ReportLoader() {
    return (
        <div className="flex-1 min-w-0 flex items-center justify-center relative overflow-hidden bg-zinc-950">
            {/* Animated grid background */}
            <div
                className="absolute inset-0 animate-pulse"
                style={{
                    backgroundImage: 'linear-gradient(rgba(111,106,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(111,106,248,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    animation: 'gridPulse 3s ease-in-out infinite'
                }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-6 text-center">
                {/* Orbital spinner */}
                <div className="relative w-20 h-20">
                    {/* Ring 1 */}
                    <div
                        className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-indigo-500 border-r-indigo-500"
                        style={{ animation: 'spin 1.4s linear infinite' }}
                    />
                    {/* Ring 2 */}
                    <div
                        className="absolute inset-[10px] rounded-full border-[1.5px] border-transparent border-b-indigo-400 border-l-indigo-400"
                        style={{ animation: 'spin 1.1s linear infinite reverse' }}
                    />
                    {/* Ring 3 */}
                    <div
                        className="absolute inset-[22px] rounded-full border-[1.5px] border-transparent border-t-indigo-500/50"
                        style={{ animation: 'spin 0.8s linear infinite' }}
                    />
                    {/* Center dot */}
                    <div
                        className="absolute inset-[35px] rounded-full bg-indigo-500"
                        style={{
                            boxShadow: '0 0 12px #6366f1, 0 0 24px rgba(99,102,241,0.3)',
                            animation: 'dotPulse 1.4s ease-in-out infinite'
                        }}
                    />
                </div>

                {/* Headline */}
                <div>
                    <h2 className="text-2xl font-serif leading-tight tracking-tight">
                        Analyzing your <em className="italic text-indigo-400 not-italic">data</em>
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                        Parsing structure, detecting patterns,<br />
                        generating insights and charts
                    </p>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
                    {/* Step 1 - Done */}
                    <div className="flex items-center gap-2.5 text-xs text-white">
                        <div className="w-5 h-5 rounded-full border border-emerald-400 bg-emerald-400/15 flex items-center justify-center text-[9px] text-emerald-400 shrink-0">
                            ✓
                        </div>
                        <span className="flex-1 whitespace-nowrap">File parsed</span>
                        <div className="flex-1 h-px bg-zinc-700 rounded overflow-hidden">
                            <div className="h-full bg-indigo-500 w-full transition-all duration-1000" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">0.3s</span>
                    </div>

                    {/* Step 2 - Done */}
                    <div className="flex items-center gap-2.5 text-xs text-white">
                        <div className="w-5 h-5 rounded-full border border-emerald-400 bg-emerald-400/15 flex items-center justify-center text-[9px] text-emerald-400 shrink-0">
                            ✓
                        </div>
                        <span className="flex-1 whitespace-nowrap">Column types detected</span>
                        <div className="flex-1 h-px bg-zinc-700 rounded overflow-hidden">
                            <div className="h-full bg-indigo-500 w-full transition-all duration-1000" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">0.1s</span>
                    </div>

                    {/* Step 3 - Active */}
                    <div className="flex items-center gap-2.5 text-xs text-indigo-400">
                        <div
                            className="w-5 h-5 rounded-full border border-indigo-500 bg-indigo-500/15 flex items-center justify-center text-[9px] shrink-0"
                            style={{ animation: 'stepPulse 1.2s ease-in-out infinite' }}
                        >
                            ◉
                        </div>
                        <span className="flex-1 whitespace-nowrap">Generating AI insights</span>
                        <div className="flex-1 h-px bg-zinc-700 rounded overflow-hidden relative">
                            <div
                                className="absolute h-full bg-indigo-500"
                                style={{
                                    width: '60%',
                                    animation: 'barFlow 2s ease-in-out infinite'
                                }}
                            />
                        </div>
                    </div>

                    {/* Step 4 - Pending */}
                    <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                        <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] shrink-0">
                            ○
                        </div>
                        <span className="flex-1 whitespace-nowrap">Building charts</span>
                        <div className="flex-1 h-px bg-zinc-700 rounded overflow-hidden">
                            <div className="h-full bg-indigo-500 w-0 transition-all duration-1000" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add keyframes via style tag */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes dotPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.8); opacity: 0.6; }
                }
                @keyframes stepPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.15); }
                    50% { box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
                }
                @keyframes barFlow {
                    0% { width: 20%; }
                    50% { width: 70%; }
                    100% { width: 20%; }
                }
                @keyframes gridPulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
export default ReportLoader