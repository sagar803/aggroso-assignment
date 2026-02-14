import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import type { Response } from "express";

// ── Model setup ───────────────────────────────────────────────────────────────
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

// ── Generate a full (non-streamed) response ───────────────────────────────────
export async function generateInsights(prompt: string): Promise<string> {
    const { text } = await generateText({
        model: openai(MODEL),
        prompt,
        temperature: 0.3, // Lower temp for consistent, analytical responses
    });
    return text;
}

// ── Stream a response back to an Express res object ───────────────────────────
export async function streamFollowUp(
    prompt: string,
    res: Response
): Promise<void> {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    const result = await streamText({
        model: openai(MODEL),
        prompt,
        temperature: 0.4,
    });

    for await (const chunk of result.textStream) {
        res.write(chunk);
    }

    res.end();
}