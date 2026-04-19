const fs = require('fs');

const exercisesContent = fs.readFileSync('./client/src/pages/exercises.tsx', 'utf8');
const mealsContent = fs.readFileSync('./client/src/pages/meals.tsx', 'utf8');

// Extract ALL_EXERCISES
const exMatch = exercisesContent.match(/const ALL_EXERCISES: Exercise\[\] = (\[[\s\S]*?\]);\n\n\/\* /);
// Extract alternativeMeals
const mealsMatch = mealsContent.match(/const alternativeMeals: Record<.*?> = (\{[\s\S]*?\});\n\n\/\* /);

if (!exMatch || !mealsMatch) {
  console.log("Could not find arrays");
  process.exit(1);
}

const exercisesRaw = exMatch[1];
const mealsRaw = mealsMatch[1];

const script = `
import { db } from '../services/db';
import bcrypt from 'bcryptjs';
import { ResultSetHeader } from "mysql2";

async function main() {
  console.log("Seeding database...");
  
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Seed Users
  await db.query("DELETE FROM User");
  const [userResult] = await db.query<ResultSetHeader>(
    "INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["John Doe", "john.doe@email.com", hashedPassword, "USER"]
  );
  const userId = userResult.insertId;
  console.log("✅ Seeded test user");

  // Seed Exercises
  await db.query("DELETE FROM Exercise");
  
  const exercisesRaw = ${exercisesRaw};
  
  for (const ex of exercisesRaw) {
    await db.query(
      \`INSERT INTO Exercise (name, category, difficulty, description, instructions, muscleGroups, imageUrl, equipment, defaultSets, defaultReps, defaultTimeSecs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
      [ex.name, ex.category, ex.difficulty, "See instructions", ex.instructions, ex.target, ex.image, ex.equipment, ex.sets, ex.reps, ex.time ? parseInt(ex.time) : null]
    );
  }
  console.log("✅ Seeded exercises");

  // Seed Alternative Meals
  await db.query("DELETE FROM AlternativeMeal");
  const altMeals = ${mealsRaw};
  for (const [injury, meals] of Object.entries(altMeals)) {
    for (const m of (meals as any[])) {
      await db.query(
        "INSERT INTO AlternativeMeal (injury, icon, name, benefit, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [injury, m.icon, m.name, m.benefit, m.calories, m.protein, m.carbs, m.fat]
      );
    }
  }
  console.log("✅ Seeded alternative meals");

  // Seed Dashboard Data
  // WorkoutPlan
  await db.query("DELETE FROM WorkoutPlan");
  const [planResult] = await db.query<ResultSetHeader>(
    "INSERT INTO WorkoutPlan (userId, name, description, daysPerWeek, isActive) VALUES (?, ?, ?, ?, ?)",
    [userId, "Hypertrophy Block", "Phase: Strength. Next: Deload Week", 4, true]
  );
  const planId = planResult.insertId;

  // History & Progress
  // Generate past 7 days of Calories and Weight
  await db.query("DELETE FROM MealLog");
  await db.query("DELETE FROM ProgressEntry");
  await db.query("DELETE FROM WorkoutSession");
  
  const dailyCalories = [420, 510, 0, 610, 480, 540, 390];
  const weeklyWeight = [82, 81.2, 80.5, 79.8, 79.1, 78.6, 78.2];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    
    // Meal
    if (dailyCalories[i] > 0) {
      await db.query(
        "INSERT INTO MealLog (userId, name, mealType, calories, date) VALUES (?, ?, ?, ?, ?)",
        [userId, 'Daily Summary Aggregated', 'snack', dailyCalories[i], d]
      );
    }
    
    // Weight
    await db.query(
      "INSERT INTO ProgressEntry (userId, weight, date) VALUES (?, ?, ?)",
      [userId, weeklyWeight[i], d]
    );
    
    // Workout Session (do on days with calories > 0 as rough logic)
    if (dailyCalories[i] > 0) {
      const [sessResult] = await db.query<ResultSetHeader>(
        "INSERT INTO WorkoutSession (userId, planId, name, durationSecs, caloriesBurned, date) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, planId, "Strength Day " + i, 3600, dailyCalories[i], d]
      );
      // Dummy Set History for the session
      await db.query(
        "INSERT INTO WorkoutSessionSet (sessionId, exerciseId, setNumber, reps, weight) VALUES (?, ?, ?, ?, ?)",
        [sessResult.insertId, 1, 1, 8, 100]
      );
    }
  }
  console.log("✅ Seeded dashboard history");
}

main()
  .then(() => {
    console.log("✅ Seeding finished.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
`;

fs.writeFileSync('../server/src/db/seed.ts', script);
console.log('Seed updated!');
