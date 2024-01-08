import { Router } from "express";
import VocabularyController from "../controllers/VocabularyController";
import { authorize } from "../middleware/authorization.middleware";

const router = Router();

router.post("/", authorize, (req, res) => new VocabularyController(req, res).addWord());

router.patch("/:_id", authorize, (req, res) => new VocabularyController(req, res).updateWord());

export default router;