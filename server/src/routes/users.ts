import { Router } from "express";
import { getProfile, updateProfile, getAllUsers, adminUpdateUser } from "../controllers/usersController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Admin routes
router.get("/", adminOnly, getAllUsers);
router.put("/:id", adminOnly, adminUpdateUser);

export default router;
