export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkoutPhase =
  | "warmup"
  | "strength"
  | "cardio"
  | "core"
  | "stretch"
  | "mobility"
  | "recovery";

export type ExerciseCategory =
  | "strength"
  | "warmup"
  | "stretch"
  | "cardio"
  | "core"
  | "posture"
  | "mobility";

export interface ExerciseMeta {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscles: string[];
  description: string;
  setup: string[];
  execution: string[];
  breathing: string;
  mistakes: string[];
  safety: string[];
  animationKey: string;
}

export interface ScheduledExercise {
  exerciseId: string;
  sets?: number;
  reps?: number | string;
  durationMinutes?: number;
  notes?: string;
}

export interface DayPlan {
  dayOfWeek: DayOfWeek;
  name: string;
  subtitle: string;
  estimatedMinutes: number;
  warmup: ScheduledExercise[];
  strength: ScheduledExercise[];
  cardio: ScheduledExercise[];
  core?: ScheduledExercise[];
  stretching: ScheduledExercise[];
  mobility?: ScheduledExercise[];
}

export interface SetLog {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  id?: number;
  exerciseId: string;
  date: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id?: number;
  date: string;
  dayOfWeek: DayOfWeek;
  dayName: string;
  completed: boolean;
  completedAt?: string;
  durationMinutes?: number;
  phasesCompleted: WorkoutPhase[];
}

export type MeasurementType =
  | "weight"
  | "waist"
  | "chest"
  | "arms"
  | "thighs"
  | "neck";

export interface Measurement {
  id?: number;
  type: MeasurementType;
  value: number;
  unit: string;
  date: string;
}

export interface ProgressPhoto {
  id?: number;
  date: string;
  label?: string;
  dataUrl: string;
}

export interface PostureLog {
  id?: number;
  exerciseId: string;
  date: string;
}

export interface AppSettings {
  restSeconds: number;
  hydrationReminders: boolean;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
}

export interface GuidedExerciseStep {
  id: string;
  phase: WorkoutPhase;
  exerciseId: string;
  setNumber: number;
  totalSets: number;
  targetReps: string;
  trackWeight: boolean;
  durationSeconds?: number;
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  exerciseLogs: ExerciseLog[];
  workoutSessions: WorkoutSession[];
  measurements: Measurement[];
  progressPhotos: ProgressPhoto[];
  postureLogs: PostureLog[];
  settings: AppSettings;
}
