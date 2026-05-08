import { Router } from "express";
import { protect } from "../middleware/auth";
import * as workoutsController from "../controllers/workoutsController";

const router = Router();

router.use(protect);

router.post("/", workoutsController.logWorkout);
router.get("/", workoutsController.getWorkouts);

export default router;
