import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import exercisesRoutes from "./routes/exercises";
import plansRoutes from "./routes/plans";
import progressRoutes from "./routes/progress";
import mealsRoutes from "./routes/meals";
import trainersRoutes from "./routes/trainers";
import subscriptionsRoutes from "./routes/subscriptions";

const app = express();

// ── Core Middleware ────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ── Error Handling ─────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;
