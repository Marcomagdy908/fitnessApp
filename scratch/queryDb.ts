import { db } from "../server/src/services/db";

async function run() {
  try {
    const [rows] = await db.query("SELECT * FROM DietPlanMeal LIMIT 5");
    console.log("DietPlanMeal Rows:", JSON.stringify(rows, null, 2));
    for (const r of rows as any[]) {
      console.log(`Row ID: ${r.id}, foods: ${r.foods}, typeof foods: ${typeof r.foods}, isArray: ${Array.isArray(r.foods)}`);
    }
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    process.exit(0);
  }
}

run();
