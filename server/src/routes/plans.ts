import { Router } from "express";
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  addExerciseToPlan,
  removeExerciseFromPlan,
  replaceExercises,
} from "../controllers/plansController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.get("/", getPlans);
router.get("/:id", getPlan);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);
router.post("/:id/exercises", addExerciseToPlan);
router.put("/:id/exercises", replaceExercises);
router.delete("/:id/exercises/:exerciseId", removeExerciseFromPlan);

export default router;
