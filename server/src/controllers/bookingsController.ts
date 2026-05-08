import { Response, NextFunction } from "express";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";

/**
 * GET /api/bookings/overview
 * Returns a unified view of all the user's bookings:
 *   - Personal training sessions (TrainerBooking) with payment info
 *   - Gym class bookings (GymClassBooking)
 * Sorted by scheduledAt descending.
 */
export const getMyBookingsOverview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // 1. Personal training bookings + payment
    const [trainerBookings] = await db.query<any[] & { length: number }>(
      `SELECT
         tb.id,
         'trainer_session' as bookingType,
         tb.scheduledAt,
         tb.durationMins,
         tb.status,
         tb.paymentStatus,
         tb.notes,
         tb.totalPrice,
         tb.createdAt,
         t.name   as trainerName,
         t.avatar as trainerAvatar,
         t.specialty as trainerSpecialty,
         t.specialtyColor as trainerSpecialtyColor,
         t.imageUrl as trainerImageUrl,
         p.id     as paymentId,
         p.status as paymentStatusDetail,
         p.method as paymentMethod,
         p.amount as paymentAmount,
         p.paidAt
       FROM TrainerBooking tb
       JOIN Trainer t ON tb.trainerId = t.id
       LEFT JOIN Payment p ON p.bookingId = tb.id AND p.bookingType = 'trainer'
       WHERE tb.userId = ?
       ORDER BY tb.scheduledAt DESC`,
      [userId]
    );

    // 2. Gym class bookings
    const [classBookings] = await db.query<any[] & { length: number }>(
      `SELECT
         gcb.id,
         'gym_class' as bookingType,
         gc.scheduledAt,
         gc.durationMins,
         gcb.status,
         'free' as paymentStatus,
         NULL   as notes,
         0      as totalPrice,
         gcb.bookedAt as createdAt,
         gc.name       as className,
         gc.color      as classColor,
         gc.description as classDescription,
         gc.requiredPlan,
         t.name   as trainerName,
         t.avatar as trainerAvatar
       FROM GymClassBooking gcb
       JOIN GymClass gc ON gcb.classId = gc.id
       LEFT JOIN Trainer t ON gc.trainerId = t.id
       WHERE gcb.userId = ?
       ORDER BY gc.scheduledAt DESC`,
      [userId]
    );

    // Merge and sort by scheduledAt
    const all = [
      ...trainerBookings.map((b: any) => ({ ...b, _type: "trainer_session" })),
      ...classBookings.map((b: any) => ({ ...b, _type: "gym_class" })),
    ].sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    res.json({
      success: true,
      data: {
        all,
        trainerSessions: trainerBookings,
        gymClasses: classBookings,
        counts: {
          total: all.length,
          trainerSessions: trainerBookings.length,
          gymClasses: classBookings.length,
          pending: all.filter((b: any) => b.status === "pending").length,
          confirmed: all.filter((b: any) => b.status === "confirmed").length,
          awaitingPayment: (trainerBookings as any[]).filter(
            (b) => b.paymentStatus === "awaiting_payment"
          ).length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
