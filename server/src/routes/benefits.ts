import { Router } from "express";
import { 
  getBenefits, 
  createBenefit, 
  updateBenefit, 
  deleteBenefit 
} from "../controllers/benefitsController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

// All routes require admin
router.use(protect, adminOnly);

router.get("/", getBenefits);
router.post("/", createBenefit);
router.put("/:id", updateBenefit);
router.delete("/:id", deleteBenefit);

export default router;
