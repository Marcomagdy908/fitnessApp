import { Router } from "express";
import { getTrainers, getTrainer, initializeProfile } from "../controllers/trainersController";
import { protect, trainerOnly } from "../middleware/auth";

const router = Router();

// Protected routes
router.post("/initialize", protect, trainerOnly, initializeProfile);

// Public routes
router.get("/", getTrainers);
router.get("/:id", getTrainer);

export default router;
