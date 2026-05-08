import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import exercisesRoutes from "./routes/exercises";
import plansRoutes from "./routes/plans";
import progressRoutes from "./routes/progress";
import mealsRoutes from "./routes/meals";
import trainersRoutes from "./routes/trainers";
import subscriptionsRoutes from "./routes/subscriptions";
import dashboardRoutes from "./routes/dashboard";
import trainerBookingsRoutes from "./routes/trainerBookings";
import gymClassesRoutes from "./routes/gymClasses";
import benefitsRoutes from "./routes/benefits";
import ptClientsRoutes from "./routes/ptClients";
import injuriesRoutes from "./routes/injuries";
import bookingsRoutes from "./routes/bookings";
import injuryRestrictionsRoutes from "./routes/injuryRestrictions";
import workoutsRoutes from "./routes/workouts";

const app = express();

// Tell Express it is behind a secure proxy (Fly.io)
app.set("trust proxy", 1);

// ── Core Middleware ────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, "")),
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ───────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// ── Feature Routes ─────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/trainers", trainersRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trainer-bookings", trainerBookingsRoutes);
app.use("/api/gym-classes", gymClassesRoutes);
app.use("/api/benefits", benefitsRoutes);
app.use("/api/pt-clients", ptClientsRoutes);
app.use("/api/injuries", injuriesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/injury-restrictions", injuryRestrictionsRoutes);
app.use("/api/workouts", workoutsRoutes);

// ── Error Handling ─────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;