import { db } from '../services/db';
import bcrypt from 'bcryptjs';
import { ResultSetHeader } from 'mysql2';

async function main() {
  console.log('🌱 Seeding database…');

  /* ─── User ──────────────────────────────────────────────── */
  const hashedPassword = await bcrypt.hash('password123', 10);
  await db.query('DELETE FROM User');
  const [userResult] = await db.query<ResultSetHeader>(
    'INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['John Doe', 'john.doe@email.com', hashedPassword, 'USER']
  );
  const userId = userResult.insertId;
  console.log('✅ Seeded test user (john.doe@email.com / password123)');

  const [adminResult] = await db.query<ResultSetHeader>(
    'INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin User', 'admin@apextrack.com', hashedPassword, 'ADMIN']
  );
  console.log('✅ Seeded admin user (admin@apextrack.com / admin123)');

  const [trainerUserResult] = await db.query<ResultSetHeader>(
    'INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Alex Carter', 'alex.trainer@email.com', hashedPassword, 'TRAINER']
  );
  const trainerUserId = trainerUserResult.insertId;
  console.log('✅ Seeded trainer user (alex.trainer@email.com / password123)');

  /* ─── Subscription ──────────────────────────────────────── */
  await db.query('DELETE FROM Subscription');
  await db.query(
    `INSERT INTO Subscription (userId, plan, status, billingCycle, autoRenew, maxVisits, usedVisits, startsAt, expiresAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH))`,
    [userId, 'pro', 'active', 'monthly', true, 4, 1]
  );
  console.log('✅ Seeded user subscription (Pro plan)');

  /* ─── Trainers ──────────────────────────────────────────── */
  await db.query('DELETE FROM Trainer');
  const trainers = [
    {
      userId: trainerUserId,
      name: "Alex Carter",
      title: "Head Strength Coach",
      specialty: "Powerlifting & Strength",
      specialtyIcon: "faDumbbell",
      specialtyColor: "#ff6b6b",
      avatar: "🏋️",
      rating: 4.9,
      reviews: 214,
      experience: 8,
      pricePerSession: 65,
      sessionsCompleted: 1840,
      bio: "Former national-level powerlifter turned elite coach. Alex specialises in building raw strength through progressive overload and perfecting technique on the big three lifts. His clients average a 30% strength increase in 12 weeks.",
      certifications: JSON.stringify(["NSCA-CSCS", "IPF Coaching Level 2", "Precision Nutrition L1"]),
      tags: JSON.stringify(["Strength", "Powerlifting", "Muscle Gain", "Technique"]),
      available: true,
    },
    {
      name: "Sofia Mendes",
      title: "Yoga & Mindful Movement",
      specialty: "Yoga & Flexibility",
      specialtyIcon: "faLeaf",
      specialtyColor: "#a98dff",
      avatar: "🧘",
      rating: 4.8,
      reviews: 178,
      experience: 6,
      pricePerSession: 55,
      sessionsCompleted: 1320,
      bio: "Certified yoga instructor and corrective exercise specialist. Sofia blends Vinyasa flow with mobility work to fix movement patterns, reduce injury risk, and build the flexibility that translates directly to better gym performance.",
      certifications: JSON.stringify(["RYT-500", "FMS Level 2", "TRX Suspension Training"]),
      tags: JSON.stringify(["Yoga", "Flexibility", "Mindfulness", "Injury Prevention"]),
      available: true,
    },
    {
      name: "Radu Ionescu",
      title: "Performance & HIIT Coach",
      specialty: "HIIT & Fat Loss",
      specialtyIcon: "faFire",
      specialtyColor: "#ffc832",
      avatar: "🔥",
      rating: 4.9,
      reviews: 302,
      experience: 10,
      pricePerSession: 70,
      sessionsCompleted: 2650,
      bio: "High-intensity specialist with a background in competitive athletics. Radu designs metabolic conditioning programs that maximise calorie burn and athletic performance. His 8-week transformation programmes have an 96% completion rate.",
      certifications: JSON.stringify(["ACSM-CPT", "CrossFit Level 2", "Kettlebell Athletics Coach"]),
      tags: JSON.stringify(["HIIT", "Fat Loss", "Conditioning", "Athletic Performance"]),
      available: false,
    },
    {
      name: "Elena Vasile",
      title: "Pilates & Core Specialist",
      specialty: "Pilates & Core",
      specialtyIcon: "faHeartPulse",
      specialtyColor: "#50e678",
      avatar: "🌿",
      rating: 4.7,
      reviews: 143,
      experience: 7,
      pricePerSession: 60,
      sessionsCompleted: 980,
      bio: "STOTT-certified Pilates instructor specialising in core rehabilitation and postnatal fitness. Elena's sessions focus on deep stabiliser muscles, helping clients eliminate back pain, improve posture, and build a bulletproof core.",
      certifications: JSON.stringify(["STOTT Pilates", "Pre/Post Natal Fitness", "ACSM-CPT"]),
      tags: JSON.stringify(["Pilates", "Core Strength", "Rehab", "Posture"]),
      available: true,
    },
    {
      name: "Dan Petrescu",
      title: "Cardio & Endurance Coach",
      specialty: "Running & Endurance",
      specialtyIcon: "faPersonRunning",
      specialtyColor: "#3dffff",
      avatar: "🏃",
      rating: 4.8,
      reviews: 167,
      experience: 9,
      pricePerSession: 58,
      sessionsCompleted: 1450,
      bio: "Former marathon runner (sub-3h PB) coaching recreational to competitive athletes. Dan builds aerobic engines with structured heart-rate training, VO₂ max development, and race-specific programming for 5K to full marathon.",
      certifications: JSON.stringify(["USATF Level 2", "Heart Rate Training", "Precision Nutrition L1"]),
      tags: JSON.stringify(["Running", "Endurance", "Cardio", "Marathon Prep"]),
      available: true,
    },
    {
      name: "Mia Florescu",
      title: "Body Transformation Coach",
      specialty: "Hypertrophy & Aesthetics",
      specialtyIcon: "faMedal",
      specialtyColor: "#ff9f43",
      avatar: "💎",
      rating: 5.0,
      reviews: 89,
      experience: 5,
      pricePerSession: 75,
      sessionsCompleted: 730,
      bio: "Bikini competitor and body-recomposition expert. Mia's evidence-based approach to hypertrophy training, paired with tailored nutrition protocols, delivers visible body composition changes within 8 weeks — guaranteed.",
      certifications: JSON.stringify(["NASM-CPT", "NASM Physique Spec.", "PN Level 2"]),
      tags: JSON.stringify(["Hypertrophy", "Aesthetics", "Body Recomposition", "Nutrition"]),
      available: true,
    }
  ];

  const trainerIds: number[] = [];
  for (const t of trainers) {
    const [res] = await db.query<ResultSetHeader>(
      `INSERT INTO Trainer (userId, name, title, specialty, specialtyIcon, specialtyColor, avatar, rating, reviews, experience, pricePerSession, sessionsCompleted, bio, certifications, tags, available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [(t as any).userId || null, t.name, t.title, t.specialty, t.specialtyIcon, t.specialtyColor, t.avatar, t.rating, t.reviews, t.experience, t.pricePerSession, t.sessionsCompleted, t.bio, t.certifications, t.tags, t.available]
    );
    trainerIds.push(res.insertId);
  }
  console.log('✅ Seeded trainers');

  /* ─── Gym Classes ───────────────────────────────────────── */
  await db.query('DELETE FROM GymClassBooking');
  await db.query('DELETE FROM GymClass');

  const now = new Date();
  
  // Classes for the next 3 days
  const classes = [
    { name: "HIIT Blast", trainerIdx: 2, duration: 45, maxSpots: 20, booked: 18, color: "#ffc832", desc: "High intensity interval training to maximize calorie burn.", required: "pro", offsetHours: 2 },
    { name: "Yoga Flow", trainerIdx: 1, duration: 60, maxSpots: 15, booked: 7, color: "#a98dff", desc: "Vinyasa flow focusing on breathing, mobility, and core strength.", required: "basic", offsetHours: 5 },
    { name: "Strength & Power", trainerIdx: 0, duration: 60, maxSpots: 12, booked: 12, color: "#ff6b6b", desc: "Compound lifts focusing on raw strength.", required: "pro", offsetHours: 24 },
    { name: "Pilates Core", trainerIdx: 3, duration: 50, maxSpots: 18, booked: 10, color: "#50e678", desc: "Deep core activation and postural alignment.", required: "basic", offsetHours: 28 },
    { name: "Spin Cycle", trainerIdx: 4, duration: 45, maxSpots: 25, booked: 20, color: "#3dffff", desc: "High energy indoor cycling.", required: "pro", offsetHours: 48 },
  ];

  const classIds: number[] = [];
  for (const c of classes) {
    const scheduled = new Date(now.getTime() + c.offsetHours * 60 * 60 * 1000);
    const [res] = await db.query<ResultSetHeader>(
      `INSERT INTO GymClass (name, trainerId, scheduledAt, durationMins, maxSpots, spotsBooked, color, description, requiredPlan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.name, trainerIds[c.trainerIdx], scheduled, c.duration, c.maxSpots, c.booked, c.color, c.desc, c.required]
    );
    classIds.push(res.insertId);
  }
  console.log('✅ Seeded gym classes');

  /* ─── Bookings ──────────────────────────────────────────── */
  await db.query('DELETE FROM TrainerBooking');
  
  // Book one class
  await db.query(
    `INSERT INTO GymClassBooking (userId, classId, status) VALUES (?, ?, 'confirmed')`,
    [userId, classIds[1]]
  );
  
  // Book one trainer session
  const trainerSessDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 2 days from now
  await db.query(
    `INSERT INTO TrainerBooking (userId, trainerId, scheduledAt, durationMins, status, notes, totalPrice)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, trainerIds[0], trainerSessDate, 60, 'confirmed', 'Focus on deadlift form', trainers[0].pricePerSession]
  );
  console.log('✅ Seeded sample bookings');

  /* ─── Exercises ─────────────────────────────────────────── */
  await db.query('DELETE FROM WorkoutSessionSet');
  await db.query('DELETE FROM WorkoutSession');
  await db.query('DELETE FROM WorkoutExercise');
  await db.query('DELETE FROM WorkoutPlan');
  await db.query('DELETE FROM Exercise');
  const exercises = [
    { name:'Barbell Bench Press', category:'chest', difficulty:'intermediate', target:'chest, front deltoids, triceps', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&fit=crop&q=80', instructions:'Lie flat on a bench. Grip the bar just outside shoulder-width. Lower to your chest, pause, then press back up explosively.' },
    { name:'Push-Ups', category:'chest', difficulty:'beginner', target:'chest, shoulders, triceps', equipment:'bodyweight', sets:3, reps:15, timeSecs:null, image:'https://images.unsplash.com/photo-1598971639058-fab3c3109a3d?w=600&fit=crop&q=80', instructions:'Start in a plank position with hands slightly wider than shoulder-width. Lower your chest to the floor, then push back up.' },
    { name:'Deadlift', category:'back', difficulty:'intermediate', target:'lower back, hamstrings, glutes, traps', equipment:'barbell', sets:4, reps:5, timeSecs:null, image:'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&fit=crop&q=80', instructions:'Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip bar, brace core. Drive through the floor to stand tall.' },
    { name:'Barbell Squat', category:'legs', difficulty:'intermediate', target:'quadriceps, glutes, hamstrings', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&fit=crop&q=80', instructions:'Bar on upper traps, feet shoulder-width. Break at the hips and knees, descend until thighs are parallel, drive back up.' },
    { name:'Overhead Press', category:'shoulders', difficulty:'intermediate', target:'front deltoids, lateral deltoids, triceps', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&fit=crop&q=80', instructions:'Hold the bar at shoulder height. Press straight up overhead, locking out elbows at the top. Lower to shoulder height with control.' },
  ];

  const exerciseIds: number[] = [];
  for (const ex of exercises) {
    const [r] = await db.query<ResultSetHeader>(
      `INSERT INTO Exercise (name, category, difficulty, description, instructions, muscleGroups, imageUrl, equipment, defaultSets, defaultReps, defaultTimeSecs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ex.name, ex.category, ex.difficulty, `Targets: ${ex.target}`, ex.instructions, ex.target, ex.image, ex.equipment, ex.sets, ex.reps ?? null, ex.timeSecs]
    );
    exerciseIds.push(r.insertId);
  }
  console.log(`✅ Seeded exercises`);

  /* ─── Training Plan ─────────────────────────────────────── */
  const [planResult] = await db.query<ResultSetHeader>(
    `INSERT INTO WorkoutPlan (userId, name, description, daysPerWeek, isActive) VALUES (?, ?, ?, ?, ?)`,
    [userId, 'Hypertrophy Block', 'Strength Phase — Next: Deload Week', 4, true]
  );
  const planId = planResult.insertId;

  const benchId = exerciseIds[0];
  const squatId = exerciseIds[3];
  const deadliftId = exerciseIds[2];
  const ohpId = exerciseIds[4];
  await db.query(
    `INSERT INTO WorkoutExercise (planId, exerciseId, sets, reps, restSecs, day, orderIndex) VALUES
     (?, ?, 4, 8, 120, 1, 0),
     (?, ?, 4, 8, 120, 2, 0),
     (?, ?, 4, 5, 180, 3, 0),
     (?, ?, 4, 8, 120, 4, 0)`,
    [planId, benchId, planId, squatId, planId, deadliftId, planId, ohpId]
  );
  console.log('✅ Seeded training plan');

  /* ─── Progress Entries ──────────────────────────────────── */
  await db.query('DELETE FROM ProgressEntry');
  const weights = [82, 81.2, 80.5, 79.8, 79.1, 78.6];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i) * 7);
    await db.query(
      'INSERT INTO ProgressEntry (userId, weight, date) VALUES (?, ?, ?)',
      [userId, weights[i], d]
    );
  }
  console.log('✅ Seeded progress entries');

  /* ─── Meals ─────────────────────────────────────────────── */
  await db.query('DELETE FROM MealLog');
  const mealData = [
    { name:'Oatmeal + Protein Shake', type:'breakfast', cal:480, p:42, c:62, f:8 },
    { name:'Chicken & Rice Bowl', type:'lunch', cal:660, p:52, c:80, f:12 },
    { name:'Greek Yogurt & Berries', type:'snack', cal:220, p:18, c:24, f:4 },
  ];
  const weeklyCalories = [420, 510, 0, 610, 480, 540, 390];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const totalCal = weeklyCalories[6 - dayOffset];
    if (totalCal > 0) {
      for (const m of mealData) {
        const mealDate = new Date(d);
        await db.query(
          'INSERT INTO MealLog (userId, name, mealType, calories, protein, carbs, fat, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [userId, m.name, m.type, m.cal, m.p, m.c, m.f, mealDate]
        );
      }
    }
  }
  console.log('✅ Seeded meal logs');

  /* ─── Workout Sessions ──────────────────────────────────── */
  const sessionDays = [21, 19, 17, 14, 12, 10, 9, 7, 5, 3, 1];
  const sessionNames = [
    { name:'Push Day A', kcal:420, exId:benchId },
    { name:'Leg Day A', kcal:510, exId:squatId },
    { name:'Pull Day A', kcal:480, exId:deadliftId },
    { name:'Shoulder Day', kcal:380, exId:ohpId },
    { name:'Push Day B', kcal:440, exId:benchId },
    { name:'Leg Day B', kcal:590, exId:squatId },
    { name:'Pull Day B', kcal:500, exId:deadliftId },
    { name:'Full Body A', kcal:460, exId:benchId },
    { name:'Full Body B', kcal:520, exId:squatId },
    { name:'Strength Peak', kcal:610, exId:deadliftId },
    { name:'Hypertrophy Day', kcal:480, exId:ohpId },
  ];

  for (let i = 0; i < sessionDays.length; i++) {
    const d = new Date();
    d.setDate(d.getDate() - sessionDays[i]);
    const s = sessionNames[i];
    const [sessResult] = await db.query<ResultSetHeader>(
      'INSERT INTO WorkoutSession (userId, planId, name, durationSecs, caloriesBurned, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, planId, s.name, 3600, s.kcal, d]
    );
    const sessionId = sessResult.insertId;

    const sampleSets = [
      { exerciseId: s.exId, setNumber: 1, reps: 8, weight: 100 },
      { exerciseId: s.exId, setNumber: 2, reps: 8, weight: 100 },
      { exerciseId: s.exId, setNumber: 3, reps: 7, weight: 100 },
      { exerciseId: s.exId, setNumber: 4, reps: 6, weight: 102.5 },
    ];
    for (const set of sampleSets) {
      await db.query(
        'INSERT INTO WorkoutSessionSet (sessionId, exerciseId, setNumber, reps, weight) VALUES (?, ?, ?, ?, ?)',
        [sessionId, set.exerciseId, set.setNumber, set.reps, set.weight]
      );
    }
  }
  /* ─── Subscription Benefits ────────────────────────────── */
  await db.query('DELETE FROM SubscriptionBenefit');
  const benefits = [
    // Basic
    { planId: 'basic', text: 'Gym floor access (6AM – 10PM)', included: true },
    { planId: 'basic', text: 'Free weights & machines', included: true },
    { planId: 'basic', text: 'Cardio zone (treadmills, bikes)', included: true },
    { planId: 'basic', text: 'Changing rooms & lockers', included: true },
    { planId: 'basic', text: 'Group fitness classes', included: false },
    { planId: 'basic', text: 'Swimming pool & jacuzzi', included: false },
    // Pro
    { planId: 'pro', text: 'Gym floor access (24/7)', included: true },
    { planId: 'pro', text: 'Unlimited group fitness classes', included: true },
    { planId: 'pro', text: 'Swimming pool & jacuzzi', included: true },
    { planId: 'pro', text: 'Sauna & steam room', included: true },
    { planId: 'pro', text: 'Personal trainer sessions', included: false },
    // Elite
    { planId: 'elite', text: 'Everything in Pro', included: true },
    { planId: 'elite', text: '4× personal trainer sessions / mo', included: true },
    { planId: 'elite', text: 'Monthly nutrition consultation', included: true },
    { planId: 'elite', text: 'Guest passes (4/month)', included: true },
  ];

  for (const b of benefits) {
    await db.query(
      'INSERT INTO SubscriptionBenefit (planId, benefitText, isIncluded) VALUES (?, ?, ?)',
      [b.planId, b.text, b.included]
    );
  }
  console.log('✅ Seeded subscription benefits');

  await seedDiet();
  console.log('\n🎉 All done! Login: john.doe@email.com / password123');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });

async function seedDiet() {
  console.log('🌱 Seeding diet plans…');
  await db.query("DELETE FROM DietPlanMeal");
  await db.query("DELETE FROM DietPlan");

  const plans = [
    {
      planId: "bulk",
      label: "Mass Gain",
      labelColor: "#ff6b6b",
      name: "Hypertrophy Bulking Plan",
      goal: "Muscle & Mass",
      goalIcon: "faArrowTrendUp",
      description: "Designed for hardgainers and those looking to maximize muscle hypertrophy. This plan provides a significant caloric surplus with a focus on complex carbohydrates and high-quality protein sources.",
      calories: 3200,
      protein: 220,
      carbs: 380,
      fat: 80,
      accentColor: "#ff6b6b",
      gradientFrom: "rgba(255, 107, 107, 0.15)",
      gradientTo: "rgba(255, 107, 107, 0.05)",
      meals: [
        { time: "7:00 AM", name: "Breakfast: Power Oats", foods: ["100g Rolled Oats", "2 scoops Whey Protein", "1tbsp Peanut Butter", "1 Large Banana"], calories: 750, protein: 48, carbs: 85, fat: 22 },
        { time: "10:30 AM", name: "Mid-Morning: Greek Yogurt & Nuts", foods: ["250g Greek Yogurt (0%)", "30g Almonds", "Blueberries"], calories: 420, protein: 32, carbs: 24, fat: 20 },
        { time: "1:30 PM", name: "Lunch: Chicken & Sweet Potato", foods: ["200g Grilled Chicken Breast", "300g Roasted Sweet Potato", "Asparagus"], calories: 680, protein: 62, carbs: 75, fat: 12 },
        { time: "4:30 PM", name: "Pre-Workout: Rice Cakes & Honey", foods: ["4 Rice Cakes", "2tbsp Honey", "1 scoop Whey Protein"], calories: 450, protein: 28, carbs: 80, fat: 2 },
        { time: "8:30 PM", name: "Dinner: Lean Beef & Pasta", foods: ["180g Lean Ground Beef", "100g Whole Wheat Pasta", "Tomato Sauce", "Side Salad"], calories: 900, protein: 50, carbs: 116, fat: 24 }
      ]
    },
    {
      planId: "cut",
      label: "Fat Loss",
      labelColor: "#3dffff",
      name: "Shredded Definition Plan",
      goal: "Weight Loss",
      goalIcon: "faArrowTrendDown",
      description: "A calorie-restricted plan optimized for fat loss while preserving lean muscle mass. High protein intake keeps you satiated, while lower fats and controlled carbs drive the deficit.",
      calories: 2100,
      protein: 190,
      carbs: 160,
      fat: 65,
      accentColor: "#3dffff",
      gradientFrom: "rgba(61, 255, 255, 0.15)",
      gradientTo: "rgba(61, 255, 255, 0.05)",
      meals: [
        { time: "8:00 AM", name: "Breakfast: Egg White Scramble", foods: ["2 Whole Eggs", "4 Egg Whites", "Spinach", "Mushrooms", "1 slice Sourdough"], calories: 450, protein: 38, carbs: 25, fat: 18 },
        { time: "1:00 PM", name: "Lunch: Salmon & Greens", foods: ["150g Grilled Salmon", "Large Mixed Leaf Salad", "Lemon Dressing", "50g Brown Rice"], calories: 520, protein: 35, carbs: 20, fat: 28 },
        { time: "4:00 PM", name: "Snack: Protein Shake", foods: ["1.5 scoops Whey Protein", "Water", "10g Cashews"], calories: 250, protein: 35, carbs: 5, fat: 8 },
        { time: "7:30 PM", name: "Dinner: White Fish & Broccoli", foods: ["250g Cod Fillet", "200g Steamed Broccoli", "150g Boiled Potatoes"], calories: 880, protein: 82, carbs: 110, fat: 11 }
      ]
    },
    {
      planId: "maintain",
      label: "Performance",
      labelColor: "#50e678",
      name: "Athletic Maintenance",
      goal: "Body Recomp",
      goalIcon: "faScaleBalanced",
      description: "Perfect for maintaining your current weight while focusing on improving athletic performance and body composition. Balanced macros provide steady energy throughout the day.",
      calories: 2600,
      protein: 180,
      carbs: 280,
      fat: 85,
      accentColor: "#50e678",
      gradientFrom: "rgba(80, 230, 120, 0.15)",
      gradientTo: "rgba(80, 230, 120, 0.05)",
      meals: [
        { time: "7:30 AM", name: "Breakfast: Avocado Toast & Eggs", foods: ["2 Slices Toast", "Half Avocado", "2 Poached Eggs"], calories: 550, protein: 24, carbs: 45, fat: 32 },
        { time: "12:30 PM", name: "Lunch: Turkey Quinoa Bowl", foods: ["180g Ground Turkey", "150g Cooked Quinoa", "Peppers", "Zucchini"], calories: 620, protein: 42, carbs: 65, fat: 18 },
        { time: "4:00 PM", name: "Snack: Apple & Cottage Cheese", foods: ["200g Cottage Cheese", "1 Large Apple", "Cinnamon"], calories: 350, protein: 28, carbs: 40, fat: 8 },
        { time: "8:00 PM", name: "Dinner: Steak & Rice", foods: ["200g Sirloin Steak", "200g Jasmine Rice", "Grilled Asparagus"], calories: 1080, protein: 86, carbs: 130, fat: 27 }
      ]
    }
  ];

  for (const p of plans) {
    const [res] = await db.query<ResultSetHeader>(
      `INSERT INTO DietPlan (planId, label, labelColor, name, goal, goalIcon, description, calories, protein, carbs, fat, accentColor, gradientFrom, gradientTo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.planId, p.label, p.labelColor, p.name, p.goal, p.goalIcon, p.description, p.calories, p.protein, p.carbs, p.fat, p.accentColor, p.gradientFrom, p.gradientTo]
    );

    for (const m of p.meals) {
      await db.query(
        `INSERT INTO DietPlanMeal (dietPlanId, time, name, foods, calories, protein, carbs, fat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [res.insertId, m.time, m.name, JSON.stringify(m.foods), m.calories, m.protein, m.carbs, m.fat]
      );
    }
  }

  console.log('✅ Seeded diet plans');
}
