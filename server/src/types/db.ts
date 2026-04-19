import { RowDataPacket } from 'mysql2';

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password?: string;
  name: string;
  username: string | null;
  avatar: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseRow extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  instructions: string;
  muscleGroups: string;
  imageUrl: string | null;
  videoUrl: string | null;
  equipment: string;
  defaultSets: number;
  defaultReps: number;
  defaultTimeSecs: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlternativeMealRow extends RowDataPacket {
  id: number;
  injury: string;
  icon: string;
  name: string;
  benefit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}

export interface WorkoutSessionRow extends RowDataPacket {
  id: number;
  userId: number;
  planId: number | null;
  name: string;
  durationSecs: number;
  caloriesBurned: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSessionSetRow extends RowDataPacket {
  id: number;
  sessionId: number;
  exerciseId: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  timeSecs: number | null;
  isCompleted: boolean | number;
  createdAt: Date;
}

export interface WorkoutPlanRow extends RowDataPacket {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  daysPerWeek: number;
  isActive: boolean | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExerciseRow extends RowDataPacket {
  id: number;
  planId: number;
  exerciseId: number;
  sets: number;
  reps: number;
  restSecs: number;
  day: number;
  orderIndex: number;
  createdAt: Date;
}

export interface ProgressEntryRow extends RowDataPacket {
  id: number;
  userId: number;
  weight: number | null;
  bodyFat: number | null;
  notes: string | null;
  date: Date;
  createdAt: Date;
}

export interface MealLogRow extends RowDataPacket {
  id: number;
  userId: number;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
  createdAt: Date;
}

export interface TrainerRow extends RowDataPacket {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl: string | null;
  rating: number;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionRow extends RowDataPacket {
  id: number;
  userId: number;
  plan: string;
  status: string;
  startsAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
