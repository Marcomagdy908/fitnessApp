import { Router } from "express";
import { getMeals, addMeal, deleteMeal, getAlternativeMeals, getDietPlans } from "../controllers/mealsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getMeals);
router.get("/plans", getDietPlans);
router.get("/alternatives", getAlternativeMeals);
router.post("/", addMeal);
router.delete("/:id", deleteMeal);

export default router;
