import { Router } from "express";
import {
  getPTClients,
  addPTClient,
  updatePTClient,
  removePTClient,
  getTrainerDashboard,
} from "../controllers/ptClientsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.get("/", getPTClients);
router.get("/dashboard", getTrainerDashboard);
router.post("/", addPTClient);
router.patch("/:id", updatePTClient);
router.delete("/:id", removePTClient);

export default router;
