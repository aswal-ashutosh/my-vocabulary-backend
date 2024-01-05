import express, { Request, Response, NextFunction } from "express";
import { https } from "firebase-functions";
import HttpStatusCode from "./constants/http-status-codes";

const server = express();

server.get("/", (req, res, next) => {
    res.status(200).json({ message: "Hello from firebase functions." });
});

server.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: `UNCAUGHT_ERROR: ${error.message}` });
});

server.listen(3000);

export const api = https.onRequest(server);
