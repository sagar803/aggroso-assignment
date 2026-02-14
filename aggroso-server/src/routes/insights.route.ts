import { Router, type Request, type Response, type NextFunction } from "express";
import { InsightsRequestSchema } from "../types/schema";
import { buildInsightsPrompt } from "../services/promptBuilder";
import { generateInsights } from "../services/ai.service";

export const insightsRouter = Router();

insightsRouter.post(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ── Validate request body ───────────────────────────────────────────────
            const parseResult = InsightsRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    error: "Invalid request payload",
                    details: parseResult.error.flatten().fieldErrors,
                });
                return;
            }

            const data = parseResult.data;

            // ── Build prompt and call AI ────────────────────────────────────────────
            const prompt = buildInsightsPrompt(data);
            const rawText = await generateInsights(prompt);

            // ── Parse AI JSON response ──────────────────────────────────────────────
            let parsed: unknown;
            try {
                // Strip markdown code fences if the model adds them
                const cleaned = rawText
                    .replace(/^```json\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .trim();
                parsed = JSON.parse(cleaned);
            } catch {
                // If JSON parsing fails, return raw text so the client can still show something
                res.status(200).json({
                    summary: rawText,
                    insights: [],
                    healthScore: 50,
                    healthBreakdown: { completeness: 50, consistency: 50, diversity: 50 },
                    nextSteps: [],
                    outlierColumns: [],
                    parseError: true,
                });
                return;
            }

            res.status(200).json(parsed);
        } catch (err) {
            next(err);
        }
    }
);