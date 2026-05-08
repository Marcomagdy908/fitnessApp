import { Router } from "express";
import {
  getProgress,
  addProgress,
  deleteProgress,
  getProgressStats,
} from "../controllers/progressController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getProgress);
router.get("/stats", getProgressStats);
router.post("/", addProgress);
router.delete("/:id", deleteProgress);

export default router;
