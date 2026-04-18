import { Router } from "express";
import {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercisesController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

// Public
router.get("/", getExercises);
router.get("/:id", getExercise);

// Admin only
router.post("/", protect, adminOnly, createExercise);
router.put("/:id", protect, adminOnly, updateExercise);
router.delete("/:id", protect, adminOnly, deleteExercise);

export default router;
