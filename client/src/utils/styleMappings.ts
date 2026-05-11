import {
  faShieldHalved,
  faDumbbell,
  faTrophy,
  faArrowTrendUp,
  faArrowTrendDown,
  faScaleBalanced,
  faLeaf,
  faFire,
  faHeartPulse,
  faPersonRunning,
  faMedal,
  faAppleWhole,
  faUtensils
} from "@fortawesome/free-solid-svg-icons";

export const SUBSCRIPTION_PLAN_STYLES: Record<string, any> = {
  basic: {
    icon: faShieldHalved,
    accentColor: "#888",
    glowColor: "rgba(136,136,136,0.15)",
    borderColor: "rgba(136,136,136,0.15)",
    bgGradient: "linear-gradient(135deg, #0d0d0d 0%, #111 100%)",
    cta: "Join Basic",
    badge: null,
    period: "/ month",
  },
  pro: {
    icon: faDumbbell,
    accentColor: "var(--accent-cyan)",
    glowColor: "var(--accent-cyan-dim)",
    borderColor: "var(--accent-cyan-border)",
    bgGradient: "linear-gradient(135deg, #080f0f 0%, #0a1515 100%)",
    cta: "Join Pro — First Week Free",
    badge: "Most Popular",
    period: "/ month",
  },
  elite: {
    icon: faTrophy,
    accentColor: "#ffc832",
    glowColor: "rgba(255,200,50,0.15)",
    borderColor: "rgba(255,200,50,0.35)",
    bgGradient: "linear-gradient(135deg, #111009 0%, #181400 100%)",
    cta: "Go VIP Elite",
    badge: "Best Value",
    period: "/ month",
  },
};

export const DIET_PLAN_STYLES: Record<string, any> = {
  bulk: {
    label: "Mass Gain",
    labelColor: "#ff6b6b",
    goalIcon: faArrowTrendUp,
    accentColor: "#ff6b6b",
    gradientFrom: "rgba(255, 107, 107, 0.15)",
    gradientTo: "rgba(255, 107, 107, 0.05)",
  },
  cut: {
    label: "Fat Loss",
    labelColor: "#3dffff",
    goalIcon: faArrowTrendDown,
    accentColor: "#3dffff",
    gradientFrom: "rgba(61, 255, 255, 0.15)",
    gradientTo: "rgba(61, 255, 255, 0.05)",
  },
  maintain: {
    label: "Performance",
    labelColor: "#50e678",
    goalIcon: faScaleBalanced,
    accentColor: "#50e678",
    gradientFrom: "rgba(80, 230, 120, 0.15)",
    gradientTo: "rgba(80, 230, 120, 0.05)",
  },
  // Default style for custom plans
  default: {
    label: "Custom",
    labelColor: "#7b61ff",
    goalIcon: faUtensils,
    accentColor: "#7b61ff",
    gradientFrom: "rgba(123, 97, 255, 0.15)",
    gradientTo: "rgba(123, 97, 255, 0.05)",
  }
};

export const TRAINER_STYLES: Record<string, any> = {
  "Powerlifting & Strength": { icon: faDumbbell, color: "#ff6b6b", avatar: "🏋️" },
  "Yoga & Flexibility": { icon: faLeaf, color: "#a98dff", avatar: "🧘" },
  "HIIT & Fat Loss": { icon: faFire, color: "#ffc832", avatar: "🔥" },
  "Pilates & Core": { icon: faHeartPulse, color: "#50e678", avatar: "🌿" },
  "Running & Endurance": { icon: faPersonRunning, color: "#3dffff", avatar: "🏃" },
  "Hypertrophy & Aesthetics": { icon: faMedal, color: "#ff9f43", avatar: "💎" },
  "General Fitness": { icon: faAppleWhole, color: "var(--accent-cyan)", avatar: "🏋️" },
};

export const NUTRITION_TIP_STYLES: Record<string, any> = {
  "Stay Hydrated": { icon: "💧", color: "rgba(61,255,255,0.12)" },
  "Meal Timing": { icon: "⏰", color: "rgba(255,200,50,0.12)" },
  "Micronutrients": { icon: "🥦", color: "rgba(80,230,120,0.12)" },
  "Track Everything": { icon: "🏷️", color: "rgba(169,141,255,0.12)" },
};

export const GYM_CLASS_STYLES: Record<string, string> = {
  "HIIT Blast": "#ffc832",
  "Yoga Flow": "#a98dff",
  "Strength & Power": "#ff6b6b",
  "Pilates Core": "#50e678",
  "Spin Cycle": "#3dffff",
};
