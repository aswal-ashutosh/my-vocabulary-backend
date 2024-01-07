import { Router } from "express";
import authRoutes from "./auth.routes";
import vocabularyRoute from "./vocabulary.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/vocabulary", vocabularyRoute);

export default router;
