"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ExerciseLog,
  HealthDailyMetrics,
  HealthWorkout,
  Measurement,
  WorkoutSession,
} from "@/lib/types";
import {
  getDb,
  getLastExerciseLog,
  getSettings,
  getWeeklyCompletionPercent,
  getWorkoutStreak,
} from "@/lib/db/database";

export function useSettings() {
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getSettings>> | null>(null);

  const refresh = useCallback(async () => {
    setSettings(await getSettings());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, refresh };
}

export function useDashboardStats() {
  const [streak, setStreak] = useState(0);
  const [weeklyPercent, setWeeklyPercent] = useState(0);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<{ exerciseId: string; weight: number; reps: number }[]>([]);

  const refresh = useCallback(async () => {
    const db = getDb();
    setStreak(await getWorkoutStreak());
    setWeeklyPercent(await getWeeklyCompletionPercent());

    const weights = await db.measurements
      .where("type")
      .equals("weight")
      .reverse()
      .sortBy("date");
    setLatestWeight(weights[0]?.value ?? null);

    const sessions = await db.workoutSessions
      .orderBy("date")
      .reverse()
      .limit(7)
      .toArray();
    setRecentSessions(sessions);

    const logs = await db.exerciseLogs.toArray();
    const best = new Map<string, { weight: number; reps: number }>();
    for (const log of logs) {
      for (const set of log.sets) {
        const current = best.get(log.exerciseId);
        if (!current || set.weight > current.weight) {
          best.set(log.exerciseId, { weight: set.weight, reps: set.reps });
        }
      }
    }
    const prList = [...best.entries()]
      .filter(([, v]) => v.weight > 0)
      .map(([exerciseId, v]) => ({ exerciseId, ...v }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
    setPrs(prList);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { streak, weeklyPercent, latestWeight, recentSessions, prs, refresh };
}

export function useMeasurements(type?: string) {
  const [data, setData] = useState<Measurement[]>([]);

  const refresh = useCallback(async () => {
    const db = getDb();
    if (type) {
      setData(await db.measurements.where("type").equals(type).sortBy("date"));
    } else {
      setData(await db.measurements.orderBy("date").toArray());
    }
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, refresh };
}

export function useLastLog(exerciseId: string) {
  const [log, setLog] = useState<ExerciseLog | undefined>();

  useEffect(() => {
    getLastExerciseLog(exerciseId).then(setLog);
  }, [exerciseId]);

  return log;
}

export function useHealthSummary() {
  const [latestDaily, setLatestDaily] = useState<HealthDailyMetrics | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<HealthWorkout[]>([]);

  const refresh = useCallback(async () => {
    const db = getDb();
    const daily = await db.healthDaily?.orderBy("date").reverse().limit(1).toArray();
    setLatestDaily(daily?.[0] ?? null);

    const workouts = await db.healthWorkouts
      ?.orderBy("startTime")
      .reverse()
      .limit(5)
      .toArray();
    setRecentWorkouts(workouts ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { latestDaily, recentWorkouts, refresh };
}
