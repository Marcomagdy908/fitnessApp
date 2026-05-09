import { Router } from "express";
import { getMeals, addMeal, deleteMeal, getAlternativeMeals, getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan, getNutritionTips } from "../controllers/mealsController";
import { protect, trainerOnly } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getMeals);
router.get("/plans", getDietPlans);
router.post("/plans", trainerOnly, createDietPlan);
router.put("/plans/:id", trainerOnly, updateDietPlan);
router.delete("/plans/:id", trainerOnly, deleteDietPlan);
router.get("/alternatives", getAlternativeMeals);
router.get("/tips", getNutritionTips);
router.post("/", addMeal);
router.delete("/:id", deleteMeal);

export default router;
