import "dotenv/config";
import express from "express";
import cors from "cors";
import { insightsRouter } from "./routes/insights.route";
import { followUpRouter } from "./routes/followup.route";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

// Increase limit for CSV data payloads
app.use(express.json({ limit: "5mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/insights", insightsRouter);
app.use("/api/followup", followUpRouter);

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;