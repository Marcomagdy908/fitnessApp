import { Router } from "express";
import { getMyBookingsOverview } from "../controllers/bookingsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

// Unified overview: trainer sessions + gym classes merged
router.get("/overview", getMyBookingsOverview);

export default router;
