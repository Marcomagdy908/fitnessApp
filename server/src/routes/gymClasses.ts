import { Router } from "express";
import { 
  getGymClasses, 
  bookClass, 
  cancelClassBooking 
} from "../controllers/gymClassesController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.get("/", getGymClasses);
router.post("/:id/book", bookClass);
router.delete("/:id/book", cancelClassBooking);

export default router;
