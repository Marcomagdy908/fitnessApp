import { Router } from "express";
import {
  getSubscriptionPlans,
  getMySubscription,
  subscribe,
} from "../controllers/subscriptionsController";
import { protect } from "../middleware/auth";

const router = Router();

// Public — anyone can view plan options
router.get("/plans", getSubscriptionPlans);

// Protected
router.get("/me", protect, getMySubscription);
router.post("/", protect, subscribe);

export default router;
