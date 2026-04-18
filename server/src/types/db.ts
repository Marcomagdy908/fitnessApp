import { RowDataPacket } from 'mysql2';

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password?: string;
  name: string;
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
  createdAt: Date;
  updatedAt: Date;
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
