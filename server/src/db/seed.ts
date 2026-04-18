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
    ["Test User", "test@test.com", hashedPassword, "USER"]
  );
  
  console.log("✅ Seeded test user");

  // Seed Exercises
  await db.query("DELETE FROM Exercise");
  
  const exercises = [
    ["Bench Press", "strength", "intermediate", "Lie on bench and push barbell up", "1. Unrack 2. Lower 3. Press", "chest,triceps,shoulders"],
    ["Squat", "strength", "intermediate", "Stand with barbell on back, squat down", "1. Stand 2. Squat 3. Stand", "legs,glutes,core"],
    ["Deadlift", "strength", "advanced", "Lift barbell from ground", "1. Bend 2. Grip 3. Lift", "back,legs,glutes,core"],
    ["Pull-up", "strength", "intermediate", "Hang from bar and pull up", "1. Hang 2. Pull 3. Lower", "back,biceps"],
  ];
  
  for (const ex of exercises) {
    await db.query(
      `INSERT INTO Exercise (name, category, difficulty, description, instructions, muscleGroups)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ex
    );
  }

  console.log("✅ Seeded exercises");
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
