import { Router } from "express";
import { 
  getGymClasses, 
  bookClass, 
  cancelClassBooking,
  getTrainerClasses,
  createClass,
  deleteTrainerClass,
  getClassAttendees,
} from "../controllers/gymClassesController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

// User-facing
router.get("/", getGymClasses);
router.post("/:id/book", bookClass);
router.delete("/:id/book", cancelClassBooking);

// Trainer-facing
router.get("/trainer-classes", getTrainerClasses);
router.post("/trainer-classes", createClass);
router.delete("/trainer-classes/:id", deleteTrainerClass);
router.get("/trainer-classes/:id/attendees", getClassAttendees);

export default router;
