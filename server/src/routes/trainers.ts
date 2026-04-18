import { Router } from "express";
import { getTrainers, getTrainer } from "../controllers/trainersController";

const router = Router();

// Public routes
router.get("/", getTrainers);
router.get("/:id", getTrainer);

export default router;
