import { db } from '../services/db';
import bcrypt from 'bcryptjs';
import { ResultSetHeader } from 'mysql2';

async function main() {
  console.log('🌱 Starting ULTRA-REALISTIC Database Seed…');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  /* ─── 1. Users ────────────────────────────────────────────── */
  await db.query('DELETE FROM User');
  const userNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Chris Brown',
    'Emma Davis', 'Alex Wilson', 'Olivia Taylor', 'Ryan Martinez', 'Sophia Anderson',
    'Liam Thomas', 'Isabella Jackson', 'Noah White', 'Mia Harris', 'Lucas Martin',
    'Charlotte Thompson', 'Ethan Garcia', 'Amelia Robinson', 'Mason Clark', 'Harper Lewis',
    'Jacob Lee', 'Evelyn Walker', 'Logan Hall', 'Abigail Young', 'Jackson Allen',
    'Ella King', 'Aiden Wright', 'Scarlett Scott', 'Jack Green', 'Grace Adams',
    'Luke Baker', 'Chloe Hill', 'Daniel Nelson', 'Riley Campbell', 'Henry Mitchell',
    'Zoey Roberts', 'Sebastian Carter', 'Nora Phillips', 'William Evans', 'Lily Turner',
    'David Torres', 'Victoria Parker', 'Andrew Collins', 'Hannah Edwards', 'Gabriel Stewart',
    'Alice Cooper', 'Bob Dylan', 'Charlie Sheen', 'David Bowie', 'Elvis Presley'
  ];

  const userIds: number[] = [];
  const trainerUserIds: number[] = [];

  const testUsers = [
    { name: 'Admin Account', email: 'admin@test.com', role: 'ADMIN' },
    { name: 'Trainer Account', email: 'trainer@test.com', role: 'TRAINER' },
    { name: 'User Account', email: 'user@test.com', role: 'USER' },
  ];

  for (const tu of testUsers) {
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO User (name, email, password, role, targetCalories, targetProtein, targetCarbs, targetFat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tu.name, tu.email, hashedPassword, tu.role, 2500, 200, 300, 80]
    );
    userIds.push(res.insertId);
    if (tu.role === 'TRAINER') trainerUserIds.push(res.insertId);
  }

  for (let i = 0; i < userNames.length; i++) {
    const name = userNames[i];
    const email = name.toLowerCase().replace(/\s+/g, '.') + (i > 0 ? i : '') + '@email.com';
    const role = i < 15 ? 'TRAINER' : 'USER';
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO User (name, email, password, role, targetCalories, targetProtein, targetCarbs, targetFat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, randomInt(1800, 4000), randomInt(140, 280), randomInt(150, 500), randomInt(50, 120)]
    );
    userIds.push(res.insertId);
    if (role === 'TRAINER') trainerUserIds.push(res.insertId);
  }
  const johnDoeId = userIds[2]; 
  console.log(`✅ Seeded ${userIds.length} users`);

  /* ─── 2. Subscription Plans ────────────────────────────── */
  await db.query('DELETE FROM UserBenefit');
  await db.query('DELETE FROM SubscriptionPlan');
  const planData = [
    { planId: "free", name: "Free Tier", price: 0, annualPrice: 0, popular: false, description: "Basic access to gym floor and public lockers.", benefits: "[]" },
    { planId: "pro", name: "Pro Athlete", price: 59.99, annualPrice: 47.99, popular: true, description: "Unlimited group classes, sauna access, and priority booking.", benefits: JSON.stringify([{key:'gym_247', text:'24/7 Access'}, {key:'classes', text:'Unlimited Classes'}]) },
    { planId: "elite", name: "VIP Elite", price: 99.99, annualPrice: 79.99, popular: false, description: "Personal trainer sessions, guest passes, and premium lounge access.", benefits: JSON.stringify([{key:'pt', text:'4x PT Sessions', limit: 4}, {key:'guest', text:'Guest Passes', limit: 4}]) }
  ];
  for (const p of planData) {
    await db.query('INSERT INTO SubscriptionPlan (planId, name, price, annualPrice, description, popular, benefits) VALUES (?, ?, ?, ?, ?, ?, ?)', [p.planId, p.name, p.price, p.annualPrice, p.description, p.popular, p.benefits]);
  }
  console.log('✅ Seeded subscription plans');

  /* ─── 3. Subscriptions ────────────────────────────────── */
  await db.query('DELETE FROM Subscription');
  for (const uid of userIds) {
    await db.query(
      'INSERT INTO Subscription (userId, planId, status, billingCycle, autoRenew, maxVisits, usedVisits, startsAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH))',
      [uid, pick(['free', 'pro', 'elite']), 'active', 'monthly', true, randomInt(10, 30), randomInt(0, 10)]
    );
  }

  /* ─── 4. Trainers ─────────────────────────────────────── */
  await db.query('DELETE FROM Trainer');
  const trainerDetails = [
    { spec: 'Powerlifting', title: 'Strength Specialist', bio: 'Focused on SBD total and professional competition prep.' },
    { spec: 'Yoga', title: 'Vinyasa Flow Master', bio: 'Helping you find balance and flexibility through mindful movement.' },
    { spec: 'HIIT', title: 'Metabolic Expert', bio: 'High energy sessions designed to torch fat and build endurance.' },
    { spec: 'Bodybuilding', title: 'Hypertrophy Coach', bio: 'Specializing in aesthetic physique transformation and muscle gain.' },
    { spec: 'CrossFit', title: 'Performance Coach', bio: 'Building functional strength for real-world challenges.' }
  ];
  const trainerIds: number[] = [];
  for (let i = 0; i < trainerUserIds.length; i++) {
    const detail = trainerDetails[i % trainerDetails.length];
    const [res] = await db.query<ResultSetHeader>(
      `INSERT INTO Trainer (userId, name, title, specialty, avatar, rating, reviews, experience, pricePerSession, sessionsCompleted, bio, certifications, tags, available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trainerUserIds[i], userNames[i] || 'Elite Coach', detail.title, detail.spec, pick(['🏋️','🧘','🔥','💪','🏃']), (4.5 + Math.random() * 0.5).toFixed(1), randomInt(100, 800), randomInt(5, 20), randomInt(60, 120), randomInt(1000, 5000), detail.bio, '["NASM-CPT", "CSCS", "Precision Nutrition"]', `["${detail.spec}", "Transformation"]`, true]
    );
    trainerIds.push(res.insertId);
  }
  console.log(`✅ Seeded ${trainerIds.length} trainers`);

  /* ─── 5. Exercises (REAL NAMES) ───────────────────────── */
  await db.query('DELETE FROM Exercise');
  const realExercises = [
    { name: 'Barbell Bench Press', category: 'chest', equip: 'barbell' },
    { name: 'Low-to-High Cable Fly', category: 'chest', equip: 'cable' },
    { name: 'Deadlift (Conventional)', category: 'back', equip: 'barbell' },
    { name: 'Weighted Pull Ups', category: 'back', equip: 'bodyweight' },
    { name: 'High Bar Squat', category: 'legs', equip: 'barbell' },
    { name: 'Leg Press (45 Degree)', category: 'legs', equip: 'machine' },
    { name: 'Seated Military Press', category: 'shoulders', equip: 'barbell' },
    { name: 'Dumbbell Lateral Raise', category: 'shoulders', equip: 'dumbbell' },
    { name: 'EZ-Bar Bicep Curl', category: 'arms', equip: 'barbell' },
    { name: 'Rope Tricep Pushdown', category: 'arms', equip: 'cable' },
    { name: 'Hanging Leg Raise', category: 'core', equip: 'bodyweight' },
    { name: 'Treadmill Sprints', category: 'cardio', equip: 'machine' }
  ];
  const exerciseIds: number[] = [];
  for (const ex of realExercises) {
    const [res] = await db.query<ResultSetHeader>(
      `INSERT INTO Exercise (name, category, difficulty, description, instructions, muscleGroups, imageUrl, equipment, defaultSets, defaultReps)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ex.name, ex.category, 'intermediate', `Standard ${ex.name} for ${ex.category} growth.`, 'Keep core tight and maintain proper form throughout.', ex.category, `https://images.unsplash.com/photo-${randomInt(1500000000000, 1600000000000)}?w=600`, ex.equip, 3, 10]
    );
    exerciseIds.push(res.insertId);
  }

  /* ─── 6. Workout Plans (REALLY DETAILED) ──────────────── */
  await db.query('DELETE FROM WorkoutExercise');
  await db.query('DELETE FROM WorkoutPlan');
  const detailedWorkouts = [
    { name: 'PPL Hypertrophy Split', goal: 'Mass Gain', level: 'Intermediate', desc: 'A classic 6-day Push-Pull-Legs routine focused on maximum muscle growth.' },
    { name: '5/3/1 Powerlifting Peak', goal: 'Strength', level: 'Advanced', desc: 'Intense strength cycle focused on Bench, Squat, and Deadlift PRs.' },
    { name: 'Fat Loss Circuit Blast', goal: 'Fat Loss', level: 'Beginner', desc: 'High heart-rate circuits designed to burn calories while preserving muscle.' },
    { name: 'Arnold Volume Classic', goal: 'Mass Gain', level: 'Advanced', desc: 'High volume training inspired by the Golden Era of bodybuilding.' },
    { name: 'Functional Core & Mobility', goal: 'Fitness', level: 'Beginner', desc: 'Improve daily movement and core stability through functional exercises.' }
  ];
  for (let i = 0; i < 50; i++) {
    const dw = detailedWorkouts[i % detailedWorkouts.length];
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO WorkoutPlan (userId, trainerId, name, description, daysPerWeek, level, weeks, goal, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [pick([null, johnDoeId]), pick(trainerIds), `${dw.name} #${i+1}`, dw.desc, randomInt(3, 6), dw.level, 12, dw.goal, true]
    );
    for (let j = 0; j < 6; j++) {
      await db.query(
        'INSERT INTO WorkoutExercise (planId, exerciseId, sets, reps, restSecs, day, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [res.insertId, pick(exerciseIds), 4, 12, 90, randomInt(1, 5), j]
      );
    }
  }
  console.log('✅ Seeded 50 detailed workout plans');

  /* ─── 7. Workout Sessions ─────────────────────────────── */
  await db.query('DELETE FROM WorkoutSessionSet');
  await db.query('DELETE FROM WorkoutSession');
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 60));
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO WorkoutSession (userId, planId, name, durationSecs, caloriesBurned, date) VALUES (?, ?, ?, ?, ?, ?)',
      [pick(userIds), null, 'Strength Training', randomInt(3600, 7200), randomInt(400, 900), date]
    );
    for (let j = 0; j < 5; j++) {
      const exId = pick(exerciseIds);
      for (let set = 1; set <= 4; set++) {
        await db.query(
          'INSERT INTO WorkoutSessionSet (sessionId, exerciseId, setNumber, reps, weight, isCompleted) VALUES (?, ?, ?, ?, ?, ?)',
          [res.insertId, exId, set, 8, randomInt(40, 140), true]
        );
      }
    }
  }
  console.log('✅ Seeded 50 training sessions');

  /* ─── 8. Diet Plans (ULTRA DETAILED) ─────────────────── */
  await db.query('DELETE FROM DietPlanMeal');
  await db.query('DELETE FROM DietPlan');
  const detailedDiets = [
    { 
      name: 'Keto Fat Shredder', goal: 'Fat Loss', desc: 'Very low carb, high fat diet designed for rapid ketosis.', 
      meals: [
        { t: 'Breakfast', n: 'Avocado & Bacon Omelette', f: ['3 Eggs', 'Half Avocado', '2 Bacon Strips'], cal: 550, p: 35, c: 5, f: 45 },
        { t: 'Lunch', n: 'Chicken Thigh Salad', f: ['200g Chicken Thigh', 'Leafy Greens', 'Olive Oil Dressing'], cal: 600, p: 45, c: 8, f: 40 },
        { t: 'Dinner', n: 'Salmon & Asparagus', f: ['250g Salmon Fillet', 'Asparagus', 'Grass-fed Butter'], cal: 700, p: 50, c: 4, f: 55 },
        { t: 'Snack', n: 'Macadamia Nuts', f: ['30g Macadamias'], cal: 200, p: 3, c: 4, f: 21 }
      ]
    },
    { 
      name: 'Clean Bulk Protocol', goal: 'Mass Gain', desc: 'Caloric surplus with high quality whole food sources.', 
      meals: [
        { t: 'Breakfast', n: 'Oatmeal & Peanut Butter', f: ['100g Oats', '30g Peanut Butter', '1 Banana'], cal: 650, p: 25, c: 80, f: 25 },
        { t: 'Lunch', n: 'Lean Beef & White Rice', f: ['200g Extra Lean Beef', '150g Rice', 'Broccoli'], cal: 800, p: 55, c: 100, f: 15 },
        { t: 'Dinner', n: 'Turkey Meatballs & Pasta', f: ['200g Turkey Meatballs', '100g Pasta', 'Tomato Sauce'], cal: 850, p: 60, c: 110, f: 12 },
        { t: 'Snack', n: 'Mass Gainer Shake', f: ['Whey Protein', 'Milk', 'Blueberries'], cal: 400, p: 40, c: 50, f: 5 }
      ]
    },
    { 
      name: 'Mediterranean Wellness', goal: 'Fitness', desc: 'Heart-healthy balance of unsaturated fats and fiber.', 
      meals: [
        { t: 'Breakfast', n: 'Greek Yogurt & Honey', f: ['200g Greek Yogurt', 'Honey', 'Walnuts'], cal: 400, p: 25, c: 35, f: 18 },
        { t: 'Lunch', n: 'Quinoa Tabbouleh', f: ['Quinoa', 'Chickpeas', 'Cucumber', 'Lemon'], cal: 500, p: 20, c: 75, f: 12 },
        { t: 'Dinner', n: 'Grilled Sea Bass', f: ['Sea Bass Fillet', 'Roasted Vegetables', 'Feta Cheese'], cal: 600, p: 40, c: 30, f: 28 },
        { t: 'Snack', n: 'Apple & Almonds', f: ['1 Apple', '15 Almonds'], cal: 250, p: 5, c: 25, f: 15 }
      ]
    }
  ];

  for (let i = 0; i < 50; i++) {
    const dd = detailedDiets[i % detailedDiets.length];
    const planIdStr = `elite-diet-${i+1}`;
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO DietPlan (userId, trainerId, planId, name, goal, description, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [pick([null, johnDoeId]), pick(trainerIds), planIdStr, `${dd.name} Plan`, dd.goal, dd.desc, 2500, 180, 250, 70]
    );
    for (const m of dd.meals) {
      await db.query(
        'INSERT INTO DietPlanMeal (dietPlanId, time, name, foods, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [res.insertId, m.t, m.n, JSON.stringify(m.f), m.cal, m.p, m.c, m.f]
      );
    }
  }
  console.log('✅ Seeded 50 professional diet plans');

  /* ─── 9. Bookings & Other ────────────────────────────── */
  await db.query('DELETE FROM GymClassBooking');
  await db.query('DELETE FROM GymClass');
  const classNames = ['Zumba Gold', 'Advanced Pilates', 'Olympic Lifting', 'Night HIIT', 'Aqua Aerobics', 'Morning Yoga'];
  const classIds: number[] = [];
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(date.getDate() + randomInt(-7, 21));
    date.setHours(randomInt(6, 22), 0, 0, 0);
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO GymClass (name, trainerId, scheduledAt, durationMins, maxSpots, spotsBooked, description, requiredPlan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [pick(classNames), pick(trainerIds), date, 60, 25, randomInt(5, 25), 'Professional instructor-led class.', pick(['free', 'pro', 'elite'])]
    );
    classIds.push(res.insertId);
  }

  for (let i = 0; i < 150; i++) {
    await db.query('INSERT IGNORE INTO GymClassBooking (userId, classId, status) VALUES (?, ?, ?)', [pick(userIds), pick(classIds), 'confirmed']);
  }

  await db.query('DELETE FROM NutritionTip');
  const tips = [
    { title: 'Liquid Calories', desc: 'Smoothies are great, but eating whole fruit provides more fiber and satiety.' },
    { title: 'The 80/20 Rule', desc: 'Eat whole foods 80% of the time, and allow for flexibility in the other 20%.' },
    { title: 'Night Cravings', desc: 'Drinking herbal tea can often satisfy the "need" to snack before bed.' },
    { title: 'Caffeine Timing', desc: 'Stop caffeine intake 8-10 hours before bed for optimal deep sleep recovery.' },
    { title: 'Salt Intake', desc: 'When training hard, sodium is crucial for muscle contraction and preventing cramps.' }
  ];
  for (const t of tips) {
    await db.query('INSERT INTO NutritionTip (title, description) VALUES (?, ?)', [t.title, t.desc]);
  }

  console.log('\n🚀 ULTRA-REALISTIC SEED COMPLETE!');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
