import { Router } from "express";
import {
  getMyBookings,
  createBooking,
  cancelBooking,
  getTrainerIncomingBookings,
  updateBookingStatus,
  getBookingPayment,
  markBookingPaid,
} from "../controllers/trainerBookingsController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

/* ── User-facing ────────────────────────────────────────────── */
// Get all personal training bookings for the logged-in user
router.get("/", getMyBookings);
// Create a new booking (also creates a Payment record)
router.post("/", createBooking);
// Cancel own booking (also refunds payment)
router.patch("/:id/cancel", cancelBooking);
// Mark a confirmed booking as paid
router.patch("/:id/pay", markBookingPaid);
// Get payment details for a booking
router.get("/:id/payment", getBookingPayment);

/* ── Trainer-facing ─────────────────────────────────────────── */
// View all incoming booking requests
router.get("/incoming", getTrainerIncomingBookings);
// Confirm, cancel, or complete a booking (also updates payment status)
router.patch("/:id/status", updateBookingStatus);

export default router;
