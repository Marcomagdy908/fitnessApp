import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/usersController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
