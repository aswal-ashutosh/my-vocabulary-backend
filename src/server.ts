import express from "express";
// import cors from "cors";
import { https } from "firebase-functions";

const server = express();

server.get("/", (req, res, next) => {
    res.status(200).json({ message: "Hello from firebase functions." });
});

server.listen(3000);

export const api = https.onRequest(server);
