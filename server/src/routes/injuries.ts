import { Router } from "express";
import {
  getMyInjuries,
  addInjury,
  updateInjury,
  deleteInjury,
} from "../controllers/injuriesController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.get("/", getMyInjuries);
router.post("/", addInjury);
router.patch("/:id", updateInjury);
router.delete("/:id", deleteInjury);

export default router;
