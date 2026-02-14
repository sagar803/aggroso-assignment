import type { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error("[Error]", err);

    // OpenAI / AI SDK errors
    if (err && typeof err === "object" && "status" in err) {
        const apiErr = err as { status: number; message: string };
        res.status(apiErr.status || 500).json({
            error: "AI service error",
            details: apiErr.message,
        });
        return;
    }

    // Generic errors
    const message =
        err instanceof Error ? err.message : "An unexpected error occurred";

    res.status(500).json({
        error: "Internal server error",
        details: message,
    });
}