import express, { Request, Response, NextFunction } from "express";
import { https } from "firebase-functions";
import HttpStatusCode from "./constants/http-status-codes";
import routes from "./routes/routes";
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

const server = express();

server.use(helmet());
server.use(cors());
server.use(compression());
server.use(express.json());

server.get("/", (req, res) => {
    res.status(200).json({ message: "Hello from firebase functions." });
});

server.use("/v1", routes);

server.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: `UNCAUGHT_ERROR: ${error.message}` });
});

server.listen(3000, () => {
    console.log("Server Ready.");
});

export const api = https.onRequest(server);
