import { Router } from "express";
import { getMeals, addMeal, deleteMeal, getAlternativeMeals, getDietPlans, getNutritionTips } from "../controllers/mealsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getMeals);
router.get("/plans", getDietPlans);
router.get("/alternatives", getAlternativeMeals);
router.get("/tips", getNutritionTips);
router.post("/", addMeal);
router.delete("/:id", deleteMeal);

export default router;
