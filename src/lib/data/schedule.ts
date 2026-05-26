import type { DayPlan, DayOfWeek } from "@/lib/types";

export const WEEKLY_SCHEDULE: DayPlan[] = [
  {
    dayOfWeek: 1,
    name: "Monday",
    subtitle: "Upper Body Strength",
    estimatedMinutes: 75,
    warmup: [
      { exerciseId: "thoracic-extensions", sets: 1, reps: 10 },
      { exerciseId: "doorway-chest-stretch", sets: 1, reps: "30s" },
      { exerciseId: "wall-slides", sets: 2, reps: 12 },
      { exerciseId: "band-pull-aparts", sets: 2, reps: 15 },
      { exerciseId: "chin-tucks", sets: 2, reps: 10 },
      { exerciseId: "light-face-pulls", sets: 2, reps: 15 },
    ],
    strength: [
      { exerciseId: "chest-press-machine", sets: 4, reps: "8-10" },
      { exerciseId: "lat-pulldown", sets: 4, reps: "8-10" },
      { exerciseId: "incline-dumbbell-press", sets: 3, reps: 10 },
      { exerciseId: "seated-cable-row", sets: 3, reps: 10 },
      { exerciseId: "dumbbell-shoulder-press", sets: 3, reps: 10 },
      { exerciseId: "lateral-raises", sets: 3, reps: 15 },
      { exerciseId: "cable-tricep-pushdown", sets: 3, reps: 12 },
      { exerciseId: "dumbbell-curl", sets: 3, reps: 12 },
    ],
    cardio: [
      {
        exerciseId: "incline-treadmill-walk",
        durationMinutes: 15,
        notes: "Incline 8–12%",
      },
    ],
    stretching: [
      { exerciseId: "chest-stretch", sets: 1, reps: "45s" },
      { exerciseId: "lat-stretch", sets: 1, reps: "45s" },
      { exerciseId: "neck-stretch", sets: 1, reps: "30s" },
      { exerciseId: "childs-pose", sets: 1, reps: "60s" },
    ],
  },
  {
    dayOfWeek: 2,
    name: "Tuesday",
    subtitle: "Lower Body",
    estimatedMinutes: 70,
    warmup: [
      { exerciseId: "leg-swings", sets: 2, reps: 12 },
      { exerciseId: "hip-circles", sets: 2, reps: 10 },
      { exerciseId: "bodyweight-squats", sets: 2, reps: 15 },
      { exerciseId: "glute-bridges", sets: 2, reps: 15 },
    ],
    strength: [
      { exerciseId: "leg-press", sets: 4, reps: 10 },
      { exerciseId: "romanian-deadlift", sets: 3, reps: 10 },
      { exerciseId: "walking-lunges", sets: 3, reps: 12 },
      { exerciseId: "leg-curl", sets: 3, reps: 12 },
      { exerciseId: "leg-extension", sets: 3, reps: 12 },
      { exerciseId: "standing-calf-raises", sets: 4, reps: 15 },
    ],
    cardio: [{ exerciseId: "stationary-bike", durationMinutes: 20 }],
    stretching: [
      { exerciseId: "hamstring-stretch", sets: 1, reps: "45s" },
      { exerciseId: "quad-stretch", sets: 1, reps: "45s" },
      { exerciseId: "hip-flexor-stretch", sets: 1, reps: "45s" },
      { exerciseId: "calf-stretch", sets: 1, reps: "45s" },
    ],
  },
  {
    dayOfWeek: 3,
    name: "Wednesday",
    subtitle: "Cardio and Core",
    estimatedMinutes: 60,
    warmup: [{ exerciseId: "bodyweight-squats", sets: 2, reps: 10 }],
    strength: [],
    cardio: [
      {
        exerciseId: "steady-cardio",
        durationMinutes: 45,
        notes: "Moderate steady pace",
      },
    ],
    core: [
      { exerciseId: "plank", sets: 3, reps: "45s" },
      { exerciseId: "dead-bug", sets: 3, reps: 10 },
      { exerciseId: "bird-dog", sets: 3, reps: 10 },
    ],
    stretching: [],
    mobility: [{ exerciseId: "mobility-flow", sets: 1, reps: "10 min" }],
  },
  {
    dayOfWeek: 4,
    name: "Thursday",
    subtitle: "Push Day",
    estimatedMinutes: 65,
    warmup: [
      { exerciseId: "band-pull-aparts", sets: 2, reps: 15 },
      { exerciseId: "doorway-chest-stretch", sets: 1, reps: "30s" },
    ],
    strength: [
      { exerciseId: "bench-press", sets: 4, reps: "6-8" },
      { exerciseId: "incline-press", sets: 3, reps: 10 },
      { exerciseId: "shoulder-press", sets: 3, reps: 10 },
      { exerciseId: "lateral-raises", sets: 3, reps: 15 },
      { exerciseId: "rear-delt-fly", sets: 3, reps: 15 },
      { exerciseId: "tricep-pushdown", sets: 3, reps: 12 },
      { exerciseId: "overhead-rope-extension", sets: 3, reps: 12 },
    ],
    cardio: [],
    stretching: [
      { exerciseId: "chest-stretch", sets: 1, reps: "45s" },
      { exerciseId: "childs-pose", sets: 1, reps: "60s" },
    ],
  },
  {
    dayOfWeek: 5,
    name: "Friday",
    subtitle: "Pull Day",
    estimatedMinutes: 65,
    warmup: [
      { exerciseId: "band-pull-aparts", sets: 2, reps: 15 },
      { exerciseId: "lat-stretch", sets: 1, reps: "30s" },
    ],
    strength: [
      { exerciseId: "lat-pulldown", sets: 4, reps: 10 },
      { exerciseId: "seated-cable-row", sets: 3, reps: 10 },
      { exerciseId: "dumbbell-row", sets: 3, reps: 10 },
      { exerciseId: "face-pull", sets: 3, reps: 15 },
      { exerciseId: "hammer-curl", sets: 3, reps: 12 },
      { exerciseId: "ez-curl", sets: 3, reps: 12 },
    ],
    cardio: [],
    stretching: [
      { exerciseId: "lat-stretch", sets: 1, reps: "45s" },
      { exerciseId: "childs-pose", sets: 1, reps: "60s" },
    ],
  },
  {
    dayOfWeek: 6,
    name: "Saturday",
    subtitle: "Cardio Recovery",
    estimatedMinutes: 55,
    warmup: [{ exerciseId: "hip-circles", sets: 2, reps: 10 }],
    strength: [],
    cardio: [
      {
        exerciseId: "steady-cardio",
        durationMinutes: 50,
        notes: "45–60 min easy–moderate",
      },
    ],
    stretching: [
      { exerciseId: "hamstring-stretch", sets: 1, reps: "45s" },
      { exerciseId: "calf-stretch", sets: 1, reps: "45s" },
    ],
  },
  {
    dayOfWeek: 0,
    name: "Sunday",
    subtitle: "Recovery",
    estimatedMinutes: 45,
    warmup: [],
    strength: [],
    cardio: [{ exerciseId: "recovery-walk", durationMinutes: 30 }],
    stretching: [{ exerciseId: "recovery-stretching", sets: 1, reps: "15 min" }],
    mobility: [{ exerciseId: "recovery-mobility", sets: 1, reps: "10 min" }],
  },
];

export function getDayPlan(dayOfWeek: DayOfWeek): DayPlan {
  return (
    WEEKLY_SCHEDULE.find((d) => d.dayOfWeek === dayOfWeek) ?? WEEKLY_SCHEDULE[0]
  );
}

export function getTodayPlan(date = new Date()): DayPlan {
  return getDayPlan(date.getDay() as DayOfWeek);
}
