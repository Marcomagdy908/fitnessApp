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

  /* ─── Exercises ─────────────────────────────────────────── */
  await db.query('DELETE FROM Exercise');
  const exercises = [
    // CHEST
    { name:'Barbell Bench Press', category:'chest', difficulty:'intermediate', target:'chest, front deltoids, triceps', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&fit=crop&q=80', instructions:'Lie flat on a bench. Grip the bar just outside shoulder-width. Lower to your chest, pause, then press back up explosively.' },
    { name:'Push-Ups', category:'chest', difficulty:'beginner', target:'chest, shoulders, triceps', equipment:'bodyweight', sets:3, reps:15, timeSecs:null, image:'https://images.unsplash.com/photo-1598971639058-fab3c3109a3d?w=600&fit=crop&q=80', instructions:'Start in a plank position with hands slightly wider than shoulder-width. Lower your chest to the floor, then push back up.' },
    { name:'Incline Dumbbell Press', category:'chest', difficulty:'intermediate', target:'upper chest, shoulders, triceps', equipment:'dumbbells', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&fit=crop&q=80', instructions:'Set bench to 30-45°. Press dumbbells from chest level upward, squeezing at the top. Lower with control.' },
    { name:'Cable Fly', category:'chest', difficulty:'intermediate', target:'chest, front deltoids', equipment:'cable machine', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&fit=crop&q=80', instructions:'Set cables at shoulder height. Step forward, extend arms out, then bring hands together in a hugging arc. Squeeze at the peak.' },
    { name:'Dips (Chest-Focused)', category:'chest', difficulty:'intermediate', target:'lower chest, triceps, shoulders', equipment:'bodyweight', sets:4, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&fit=crop&q=80', instructions:'Lean forward on parallel bars. Lower until elbows reach 90°, then push back up. Keep torso tilted for chest emphasis.' },
    // BACK
    { name:'Deadlift', category:'back', difficulty:'intermediate', target:'lower back, hamstrings, glutes, traps', equipment:'barbell', sets:4, reps:5, timeSecs:null, image:'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&fit=crop&q=80', instructions:'Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip bar, brace core. Drive through the floor to stand tall.' },
    { name:'Pull-Ups', category:'back', difficulty:'intermediate', target:'lats, biceps, rear deltoids', equipment:'bodyweight', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=600&fit=crop&q=80', instructions:'Hang from a bar with an overhand grip. Pull your chest toward the bar, squeezing the lats at the top. Lower with control.' },
    { name:'Barbell Row', category:'back', difficulty:'intermediate', target:'mid-back, lats, biceps', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&fit=crop&q=80', instructions:'Hinge forward to ~45°, bar in hands. Drive elbows back, rowing the bar to your lower chest. Squeeze shoulder blades together.' },
    { name:'Lat Pulldown', category:'back', difficulty:'beginner', target:'lats, rear deltoids, biceps', equipment:'cable machine', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&fit=crop&q=80', instructions:'Sit at a cable machine, grip the bar wide. Pull the bar to your upper chest while leaning back slightly. Squeeze the lats at the bottom.' },
    { name:'Seated Cable Row', category:'back', difficulty:'beginner', target:'mid-back, lats, biceps, rear deltoids', equipment:'cable machine', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&fit=crop&q=80', instructions:'Sit upright with feet on the platform. Pull the handle to your abdomen, driving elbows back and squeezing your shoulder blades.' },
    { name:'Face Pulls', category:'back', difficulty:'beginner', target:'rear deltoids, rotator cuff, traps', equipment:'cable machine', sets:3, reps:15, timeSecs:null, image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop&q=80', instructions:'Set cable at head height. Pull the rope to your face, flaring elbows out and externally rotating the shoulders at the end.' },
    { name:'Single-Arm Dumbbell Row', category:'back', difficulty:'beginner', target:'lats, mid-back, biceps', equipment:'dumbbells', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80', instructions:'Place one knee and hand on a bench. Hold a dumbbell in the free hand, row it to your hip, elbow close to the torso.' },
    // LEGS
    { name:'Barbell Squat', category:'legs', difficulty:'intermediate', target:'quadriceps, glutes, hamstrings', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&fit=crop&q=80', instructions:'Bar on upper traps, feet shoulder-width. Break at the hips and knees, descend until thighs are parallel, drive back up.' },
    { name:'Lunges', category:'legs', difficulty:'beginner', target:'quadriceps, glutes, hamstrings', equipment:'bodyweight', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&fit=crop&q=80', instructions:'Step forward with one leg and lower your hips until both knees are at 90°. Push back and repeat on the other side.' },
    { name:'Romanian Deadlift', category:'legs', difficulty:'intermediate', target:'hamstrings, glutes, lower back', equipment:'barbell', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1616803689943-5601631c7fec?w=600&fit=crop&q=80', instructions:'Hold a bar in front of thighs. Hinge at hips, pushing them back, lowering the bar along your legs until you feel a hamstring stretch.' },
    { name:'Leg Press', category:'legs', difficulty:'beginner', target:'quadriceps, glutes, hamstrings', equipment:'machine', sets:4, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1590239926044-4131a8e4e9d7?w=600&fit=crop&q=80', instructions:'Sit in the leg press machine. Place feet shoulder-width on the platform. Lower the weight until knees reach 90°, then press back.' },
    { name:'Bulgarian Split Squat', category:'legs', difficulty:'intermediate', target:'quadriceps, glutes, hip flexors', equipment:'dumbbells', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&fit=crop&q=80', instructions:'Rear foot elevated on a bench. Lower your front knee toward the floor, keeping your torso upright. Drive back up through the heel.' },
    { name:'Hip Thrust', category:'legs', difficulty:'intermediate', target:'glutes, hamstrings', equipment:'barbell', sets:4, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1571019114074-0d5f30870e42?w=600&fit=crop&q=80', instructions:'Shoulders on a bench, bar across hips. Drive your hips upward, squeezing glutes at the top. Lower slowly and repeat.' },
    { name:'Leg Curl', category:'legs', difficulty:'beginner', target:'hamstrings', equipment:'machine', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1583454155184-870a1f63be24?w=600&fit=crop&q=80', instructions:'Lie face down on the machine. Curl your legs up toward your glutes, squeezing the hamstrings fully. Lower with control.' },
    { name:'Leg Extension', category:'legs', difficulty:'beginner', target:'quadriceps', equipment:'machine', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&fit=crop&q=80', instructions:'Sit in the leg extension machine. Fully extend your legs upward, squeezing quads at the top. Lower with control.' },
    { name:'Calf Raise', category:'legs', difficulty:'beginner', target:'gastrocnemius, soleus', equipment:'bodyweight', sets:5, reps:15, timeSecs:null, image:'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=600&fit=crop&q=80', instructions:'Stand on the edge of a step. Rise onto your toes, hold for a count, then lower your heels below the step for a full stretch.' },
    // SHOULDERS
    { name:'Overhead Press', category:'shoulders', difficulty:'intermediate', target:'front deltoids, lateral deltoids, triceps', equipment:'barbell', sets:4, reps:8, timeSecs:null, image:'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&fit=crop&q=80', instructions:'Hold the bar at shoulder height. Press straight up overhead, locking out elbows at the top. Lower to shoulder height with control.' },
    { name:'Lateral Raises', category:'shoulders', difficulty:'beginner', target:'lateral deltoids', equipment:'dumbbells', sets:4, reps:15, timeSecs:null, image:'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&fit=crop&q=80', instructions:'Hold dumbbells at sides. Raise arms out to shoulder height with a slight elbow bend, leading with the pinky. Lower slowly.' },
    { name:'Dumbbell Shoulder Press', category:'shoulders', difficulty:'beginner', target:'front & lateral deltoids, triceps', equipment:'dumbbells', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&fit=crop&q=80', instructions:'Hold dumbbells at ear-level. Press overhead until arms are fully extended, then lower back to ear-level.' },
    { name:'Rear Delt Fly', category:'shoulders', difficulty:'beginner', target:'rear deltoids, rhomboids', equipment:'dumbbells', sets:3, reps:15, timeSecs:null, image:'https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=600&fit=crop&q=80', instructions:'Bend forward at the hips. Raise dumbbells out to the sides with a slight bend in the elbow, pinching the shoulder blades.' },
    { name:'Upright Row', category:'shoulders', difficulty:'intermediate', target:'lateral deltoids, traps', equipment:'barbell', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&fit=crop&q=80', instructions:'Hold bar with a narrow overhand grip. Pull it straight up to chin level, leading with the elbows. Lower with control.' },
    // ARMS
    { name:'Barbell Curl', category:'arms', difficulty:'beginner', target:'biceps brachii, brachialis', equipment:'barbell', sets:4, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&fit=crop&q=80', instructions:'Stand with an underhand grip, elbows at sides. Curl the bar to shoulder height while keeping upper arms fixed. Lower slowly.' },
    { name:'Hammer Curl', category:'arms', difficulty:'beginner', target:'brachialis, brachioradialis, biceps', equipment:'dumbbells', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=600&fit=crop&q=80', instructions:'Hold dumbbells with a neutral (hammer) grip. Curl toward shoulder while keeping the wrist neutral. Lower with control.' },
    { name:'Skull Crushers', category:'arms', difficulty:'intermediate', target:'triceps (long head)', equipment:'barbell', sets:3, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80', instructions:'Lie flat, hold a bar above your chest. Lower it toward your forehead by bending only at the elbow, then extend back up.' },
    { name:'Tricep Rope Pushdown', category:'arms', difficulty:'beginner', target:'triceps (lateral & medial head)', equipment:'cable machine', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&fit=crop&q=80', instructions:'Attach a rope to a high pulley. Pull the rope down and split the ends at the bottom, fully extending elbows. Return slowly.' },
    // CORE
    { name:'Plank', category:'core', difficulty:'beginner', target:'core, shoulders, lower back', equipment:'bodyweight', sets:3, reps:null, timeSecs:45, image:'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&fit=crop&q=80', instructions:'Hold a forearm plank, body in a straight line from head to heels. Squeeze glutes and abs. Breathe steadily.' },
    { name:'Crunches', category:'core', difficulty:'beginner', target:'abdominals, obliques', equipment:'bodyweight', sets:3, reps:20, timeSecs:null, image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80', instructions:'Lie with knees bent. Curl shoulders toward knees, contracting the abs. Lower slowly without fully relaxing at the bottom.' },
    { name:'Hanging Leg Raise', category:'core', difficulty:'intermediate', target:'lower abdominals, hip flexors', equipment:'bodyweight', sets:3, reps:12, timeSecs:null, image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop&q=80', instructions:'Hang from a pull-up bar. Raise your legs to 90° (or higher) while minimising swing. Lower with control.' },
    { name:'Russian Twist', category:'core', difficulty:'beginner', target:'obliques, rectus abdominis', equipment:'bodyweight', sets:3, reps:20, timeSecs:null, image:'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&fit=crop&q=80', instructions:'Sit with knees bent, lean back slightly. Rotate your torso side to side, touching the floor each time. Hold a plate to progress.' },
    // CARDIO
    { name:'Treadmill Run', category:'cardio', difficulty:'beginner', target:'cardiovascular system, legs', equipment:'treadmill', sets:1, reps:null, timeSecs:1200, image:'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&fit=crop&q=80', instructions:'Set a comfortable pace. Keep a slight forward lean, arms at 90°. Breathe rhythmically and maintain consistent cadence.' },
    { name:'Jump Rope', category:'cardio', difficulty:'beginner', target:'calves, coordination, cardiovascular', equipment:'jump rope', sets:5, reps:null, timeSecs:60, image:'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&fit=crop&q=80', instructions:'Keep elbows close to body, turn rope with wrists. Land softly on the balls of your feet. Keep a steady rhythm.' },
    { name:'Burpees', category:'cardio', difficulty:'intermediate', target:'full body, cardiovascular', equipment:'bodyweight', sets:4, reps:10, timeSecs:null, image:'https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=600&fit=crop&q=80', instructions:'From standing, drop into a squat and kick feet back to plank. Do a push-up, jump feet forward, then explode upward into a jump.' },
    { name:'Battle Ropes', category:'cardio', difficulty:'intermediate', target:'shoulders, arms, core, cardiovascular', equipment:'battle ropes', sets:5, reps:null, timeSecs:30, image:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&fit=crop&q=80', instructions:'Grip both ends of the rope. Alternate slamming each arm up and down rapidly. Keep a stable athletic base throughout.' },
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
  console.log(`✅ Seeded ${exercises.length} exercises`);

  /* ─── Alternative Meals ─────────────────────────────────── */
  await db.query('DELETE FROM AlternativeMeal');
  const altMeals = [
    { injury:'Lower Back', icon:'🐟', name:'Grilled Salmon + Quinoa', benefit:'Omega-3s reduce spinal inflammation', calories:520, protein:42, carbs:40, fat:18 },
    { injury:'Lower Back', icon:'🥑', name:'Avocado & Egg Toast', benefit:'Healthy fats support nerve recovery', calories:380, protein:18, carbs:28, fat:22 },
    { injury:'Lower Back', icon:'🍵', name:'Turmeric Chicken Soup', benefit:'Curcumin is a natural anti-inflammatory', calories:310, protein:36, carbs:20, fat:8 },
    { injury:'Knee', icon:'🦴', name:'Bone Broth + Vegetables', benefit:'Collagen rebuilds cartilage', calories:180, protein:14, carbs:12, fat:4 },
    { injury:'Knee', icon:'🍦', name:'Greek Yogurt & Berries', benefit:'Antioxidants reduce joint swelling', calories:220, protein:18, carbs:24, fat:4 },
    { injury:'Knee', icon:'🥦', name:'Broccoli & Chicken Stir-fry', benefit:'Sulforaphane protects joint tissue', calories:440, protein:48, carbs:24, fat:12 },
    { injury:'Shoulder', icon:'🥜', name:'Almond Butter Smoothie', benefit:'Vitamin E speeds tendon healing', calories:380, protein:20, carbs:36, fat:16 },
    { injury:'Shoulder', icon:'🍳', name:'Eggs & Spinach Omelette', benefit:'Collagen amino acids repair rotator cuff', calories:290, protein:28, carbs:6, fat:16 },
    { injury:'Shoulder', icon:'🍠', name:'Sweet Potato & Turkey Bowl', benefit:'Beta-carotene reduces inflammation', calories:480, protein:42, carbs:48, fat:8 },
    { injury:'Wrist', icon:'🍊', name:'Citrus Fruit Salad', benefit:'Vitamin C boosts collagen synthesis', calories:140, protein:2, carbs:34, fat:1 },
    { injury:'Wrist', icon:'🐚', name:'Shrimp & Brown Rice', benefit:'Selenium supports tendon repair', calories:380, protein:38, carbs:42, fat:6 },
    { injury:'Wrist', icon:'🥛', name:'Kefir & Banana Smoothie', benefit:'Probiotics reduce systemic inflammation', calories:260, protein:14, carbs:44, fat:4 },
  ];
  for (const m of altMeals) {
    await db.query(
      'INSERT INTO AlternativeMeal (injury, icon, name, benefit, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [m.injury, m.icon, m.name, m.benefit, m.calories, m.protein, m.carbs, m.fat]
    );
  }
  console.log('✅ Seeded alternative meals');

  /* ─── Training Plan ─────────────────────────────────────── */
  await db.query('DELETE FROM WorkoutPlan');
  const [planResult] = await db.query<ResultSetHeader>(
    `INSERT INTO WorkoutPlan (userId, name, description, daysPerWeek, isActive) VALUES (?, ?, ?, ?, ?)`,
    [userId, 'Hypertrophy Block', 'Strength Phase — Next: Deload Week', 4, true]
  );
  const planId = planResult.insertId;

  // Link 4 main exercises to the plan
  const benchId = exerciseIds[0]; // Barbell Bench Press
  const squatId = exerciseIds[12]; // Barbell Squat
  const deadliftId = exerciseIds[5]; // Deadlift
  const ohpId = exerciseIds[20]; // Overhead Press
  await db.query(
    `INSERT INTO WorkoutExercise (planId, exerciseId, sets, reps, restSecs, day, orderIndex) VALUES
     (?, ?, 4, 8, 120, 1, 0),
     (?, ?, 4, 8, 120, 2, 0),
     (?, ?, 4, 5, 180, 3, 0),
     (?, ?, 4, 8, 120, 4, 0)`,
    [planId, benchId, planId, squatId, planId, deadliftId, planId, ohpId]
  );
  console.log('✅ Seeded training plan');

  /* ─── Progress Entries (past 6 weeks weight) ────────────── */
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

  /* ─── Meals (past 7 days for calorie chart) ─────────────── */
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

  /* ─── Workout Sessions (11 historical sessions) ─────────── */
  await db.query('DELETE FROM WorkoutSessionSet');
  await db.query('DELETE FROM WorkoutSession');

  // 11 sessions over the past 3 weeks (matches dashboard mock: 11/24 sessions)
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

    // Log representative sets for this session
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
  console.log('✅ Seeded 11 workout sessions with set history');

  console.log('\n🎉 All done! Login: john.doe@email.com / password123');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
