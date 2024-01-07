import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../constants/http-status-codes";
import jwt from "jsonwebtoken";
import Config from "../constants/config";
import { JWTPayload } from "../types";

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.startsWith("Bearer ") && authHeader.substring(7);
        if (!token) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({ error: "Authorization token missing/malformed." });
        }
        const { email } = jwt.verify(token, Config.JWT_ACCESS_TOKEN_KEY) as JWTPayload;
        req.userInfo = { email };
        next();
    } catch (error: any) {
        const status: HttpStatusCode =
            error instanceof jwt.JsonWebTokenError ? HttpStatusCode.UNAUTHORIZED : HttpStatusCode.INTERNAL_SERVER_ERROR;
        res.status(status).json({ error: error.message });
    }
};
