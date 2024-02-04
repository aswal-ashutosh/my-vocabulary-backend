import { Router } from "express";
import AuthController from "../controllers/AuthController";

const router = Router();

router.post("/sign-up", (req, res) => new AuthController(req, res).signUp());

router.post("/create-user", (req, res) => new AuthController(req, res).createUser());

router.post("/sign-in", (req, res) => new AuthController(req, res).signIn());

router.post("/refresh-access-token", (req, res) => new AuthController(req, res).refreshAccessToken());

export default router;
