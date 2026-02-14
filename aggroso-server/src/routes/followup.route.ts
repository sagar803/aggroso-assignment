import { Router, type Request, type Response, type NextFunction } from "express";
import { FollowUpRequestSchema } from "../types/schema";
import { buildFollowUpPrompt } from "../services/promptBuilder";
import { streamFollowUp } from "../services/ai.service";

export const followUpRouter = Router();

followUpRouter.post(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ── Validate request body ───────────────────────────────────────────────
            const parseResult = FollowUpRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    error: "Invalid request payload",
                    details: parseResult.error.flatten().fieldErrors,
                });
                return;
            }

            const data = parseResult.data;

            // ── Build prompt and stream response ───────────────────────────────────
            const prompt = buildFollowUpPrompt(data);
            await streamFollowUp(prompt, res);
        } catch (err) {
            next(err);
        }
    }
);