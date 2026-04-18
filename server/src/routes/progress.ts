import { Router } from "express";
import {
  getProgress,
  addProgress,
  deleteProgress,
} from "../controllers/progressController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getProgress);
router.post("/", addProgress);
router.delete("/:id", deleteProgress);

export default router;
