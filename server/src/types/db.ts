import { RowDataPacket } from 'mysql2';

export interface DietPlanRow extends RowDataPacket {
  id: number;
  userId: number | null;
  planId: string;
  name: string;
  goal: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}

export interface DietPlanMealRow extends RowDataPacket {
  id: number;
  dietPlanId: number;
  time: string;
  name: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password?: string;
  name: string;
  username: string | null;
  avatar: string | null;
  role: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
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
  userId: number | null;
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
  userId: number | null;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
  bio: string;
  certifications: string; // JSON string
  tags: string; // JSON string
  imageUrl: string | null;
  rating: number;
  reviews: number;
  experience: number;
  pricePerSession: number;
  sessionsCompleted: number;
  available: boolean | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionRow extends RowDataPacket {
  id: number;
  userId: number;
  plan: string;
  status: string;
  billingCycle: string;
  autoRenew: boolean | number;
  startsAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GymClassRow extends RowDataPacket {
  id: number;
  name: string;
  trainerId: number | null;
  scheduledAt: Date;
  durationMins: number;
  maxSpots: number;
  spotsBooked: number;
  description: string | null;
  requiredPlan: string;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  trainerName?: string;
  trainerAvatar?: string;
  isBooked?: boolean | number;
}

export interface GymClassBookingRow extends RowDataPacket {
  id: number;
  userId: number;
  classId: number;
  status: string;
  bookedAt: Date;
  // Joined fields
  className?: string;
  scheduledAt?: Date;
  durationMins?: number;
  trainerName?: string;
}

export interface TrainerBookingRow extends RowDataPacket {
  id: number;
  userId: number;
  trainerId: number;
  scheduledAt: Date;
  durationMins: number;
  status: string;
  notes: string | null;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  trainerName?: string;
  trainerAvatar?: string;
  trainerSpecialty?: string;
  // Client fields (trainer-side)
  clientName?: string;
  clientEmail?: string;
}

export interface PaymentRow extends RowDataPacket {
  id: number;
  trainerBookingId: number | null;
  classBookingId: number | null;
  subscriptionId: number | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  transactionRef: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanRow extends RowDataPacket {
  id: number;
  planId: string;
  name: string;
  price: number;
  annualPrice: number;
  description: string;
  popular: boolean | number;
  createdAt: Date;
}

export interface NutritionTipRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
}

export interface InjuryRestrictionRow extends RowDataPacket {
  id: number;
  injuryType: string;
  tip: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InjuryExcludedExerciseRow extends RowDataPacket {
  id: number;
  restrictionId: number;
  exerciseId: number;
  createdAt: Date;
}
