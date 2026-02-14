import type { Request, Response, NextFunction } from "express";

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export function validateCSVPayload(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    if (contentLength > MAX_PAYLOAD_BYTES) {
        res.status(413).json({
            error: "Payload too large",
            details: `Maximum allowed size is ${MAX_PAYLOAD_BYTES / 1024 / 1024}MB`,
        });
        return;
    }

    if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ error: "Request body must be JSON" });
        return;
    }

    next();
}