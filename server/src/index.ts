import { env } from "./config/env";
import { db } from "./services/db";
import app from "./app";

const PORT = parseInt(env.PORT, 10);

async function main() {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${PORT} [${env.NODE_ENV}]`,
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
