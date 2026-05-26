import Dexie, { type Table } from "dexie";
import type {
  AppSettings,
  ExerciseLog,
  Measurement,
  PostureLog,
  ProgressPhoto,
  WorkoutSession,
} from "@/lib/types";

export const DEFAULT_SETTINGS: AppSettings = {
  restSeconds: 90,
  hydrationReminders: false,
  notificationsEnabled: true,
  theme: "system",
};

export class FitnessCoachDB extends Dexie {
  exerciseLogs!: Table<ExerciseLog, number>;
  workoutSessions!: Table<WorkoutSession, number>;
  measurements!: Table<Measurement, number>;
  progressPhotos!: Table<ProgressPhoto, number>;
  postureLogs!: Table<PostureLog, number>;
  settings!: Table<{ key: string; value: AppSettings }, string>;

  constructor() {
    super("MyFitnessCoachDB");
    this.version(1).stores({
      exerciseLogs: "++id, exerciseId, date",
      workoutSessions: "++id, date, dayOfWeek, completed",
      measurements: "++id, type, date",
      progressPhotos: "++id, date",
      postureLogs: "++id, exerciseId, date",
      settings: "key",
    });
  }
}

let dbInstance: FitnessCoachDB | null = null;

export function getDb(): FitnessCoachDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!dbInstance) {
    dbInstance = new FitnessCoachDB();
  }
  return dbInstance;
}

export async function getSettings(): Promise<AppSettings> {
  const db = getDb();
  const row = await db.settings.get("app");
  return row?.value ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = getDb();
  await db.settings.put({ key: "app", value: settings });
}

export async function logExerciseSet(
  exerciseId: string,
  date: string,
  set: { weight: number; reps: number }
): Promise<void> {
  const db = getDb();
  const existing = await db.exerciseLogs
    .where({ exerciseId, date })
    .first();

  if (existing?.id) {
    await db.exerciseLogs.update(existing.id, {
      sets: [...existing.sets, set],
    });
  } else {
    await db.exerciseLogs.add({
      exerciseId,
      date,
      sets: [set],
    });
  }
}

export async function getLastExerciseLog(
  exerciseId: string,
  beforeDate?: string
): Promise<ExerciseLog | undefined> {
  const db = getDb();
  const logs = await db.exerciseLogs
    .where("exerciseId")
    .equals(exerciseId)
    .reverse()
    .sortBy("date");
  if (beforeDate) {
    return logs.find((l) => l.date < beforeDate);
  }
  return logs[0];
}

export async function getExerciseLogsForDate(
  date: string
): Promise<ExerciseLog[]> {
  return getDb().exerciseLogs.where("date").equals(date).toArray();
}

export async function getWorkoutStreak(): Promise<number> {
  const sessions = await getDb()
    .workoutSessions.filter((s) => s.completed)
    .reverse()
    .sortBy("date");

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = sessions.some((s) => s.date === key && s.completed);
    if (found) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export async function getWeeklyCompletionPercent(): Promise<number> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);

  const completed = await getDb()
    .workoutSessions.filter(
      (s) =>
        s.completed &&
        new Date(s.date) >= start &&
        new Date(s.date) <= now
    )
    .count();

  const daysElapsed = now.getDay() === 0 ? 7 : now.getDay();
  return Math.round((completed / daysElapsed) * 100);
}
