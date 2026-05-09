import { Router } from "express";
import { 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  adminUpdateUser,
  getUserBenefits,
  updateUserBenefit,
  updatePassword
} from "../controllers/usersController";
import { protect, adminOnly, trainerOnly } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", updatePassword);

// Admin + Trainer routes
router.get("/", trainerOnly, getAllUsers);
router.put("/:id", adminOnly, adminUpdateUser);
router.get("/:id/benefits", adminOnly, getUserBenefits);
router.put("/:id/benefits", adminOnly, updateUserBenefit);

export default router;
