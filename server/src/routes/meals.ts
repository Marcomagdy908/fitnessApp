import { Router } from "express";
import { getMeals, addMeal, deleteMeal } from "../controllers/mealsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getMeals);
router.post("/", addMeal);
router.delete("/:id", deleteMeal);

export default router;
