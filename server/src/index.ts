import { env } from "./config/env";
import { db } from "./services/db";
import app from "./app";

const PORT = parseInt(env.PORT, 10);

async function main() {
  // Add "0.0.0.0" right here so Fly.io can reach it
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚀 Server running on port ${PORT} [${env.NODE_ENV}]`,
    );
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await db.end();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await db.end();
    process.exit(0);
  });
}

main();