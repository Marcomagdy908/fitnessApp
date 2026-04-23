import { Router } from "express";
import { 
  getMyBookings, 
  createBooking, 
  cancelBooking 
} from "../controllers/trainerBookingsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.get("/", getMyBookings);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
