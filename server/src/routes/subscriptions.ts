import { Router } from "express";
import {
  getSubscriptionPlans,
  getMySubscription,
  subscribe,
  cancelSubscription,
} from "../controllers/subscriptionsController";
import { protect } from "../middleware/auth";

const router = Router();

// Public — anyone can view plan options
router.get("/plans", getSubscriptionPlans);

// Protected
router.get("/me", protect, getMySubscription);
router.post("/", protect, subscribe);
router.patch("/cancel", protect, cancelSubscription);

export default router;
