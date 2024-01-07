import { Router } from "express";
import VocabularyController from "../controllers/VocabularyController";
import { authorize } from "../middleware/authorization.middleware";

const router = Router();

router.post("/", authorize, (req, res) => new VocabularyController(req, res).addWord());

export default router;