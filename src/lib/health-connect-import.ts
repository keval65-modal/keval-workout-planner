import { getDb } from "@/lib/db/database";
import type { HealthDailyMetrics, HealthWorkout } from "@/lib/types";

export interface HealthConnectExportV1 {
  version: 1;
  exportedAt: string; // ISO
  source: "health-connect";
  workouts: Array<{
    externalId: string;
    startTime: string;
    endTime: string;
    activityType: string;
    title?: string;
    distanceKm?: number;
    activeCaloriesKcal?: number;
    steps?: number;
    avgHeartRateBpm?: number;
    maxHeartRateBpm?: number;
    heartRateSeries?: Array<{ time: string; bpm: number }>;
  }>;
  daily: Array<{
    date: string; // yyyy-mm-dd
    steps?: number;
    activeCaloriesKcal?: number;
    restingHeartRateBpm?: number;
  }>;
}

function isHealthConnectExportV1(x: unknown): x is HealthConnectExportV1 {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  return (
    obj.version === 1 &&
    obj.source === "health-connect" &&
    typeof obj.exportedAt === "string" &&
    Array.isArray(obj.workouts) &&
    Array.isArray(obj.daily)
  );
}

export async function importHealthConnectExport(payload: unknown): Promise<{
  workoutsUpserted: number;
  dailyUpserted: number;
}> {
  if (!isHealthConnectExportV1(payload)) {
    throw new Error("Not a valid Health Connect export file");
  }

  const db = getDb();
  const nowIso = new Date().toISOString();

  const workouts: HealthWorkout[] = payload.workouts.map((w) => ({
    externalId: w.externalId,
    source: "health-connect",
    startTime: w.startTime,
    endTime: w.endTime,
    activityType: w.activityType,
    title: w.title,
    distanceKm: w.distanceKm,
    activeCaloriesKcal: w.activeCaloriesKcal,
    steps: w.steps,
    avgHeartRateBpm: w.avgHeartRateBpm,
    maxHeartRateBpm: w.maxHeartRateBpm,
    heartRateSeries: w.heartRateSeries,
    createdAt: nowIso,
  }));

  const daily: HealthDailyMetrics[] = payload.daily.map((d) => ({
    source: "health-connect",
    date: d.date,
    steps: d.steps,
    activeCaloriesKcal: d.activeCaloriesKcal,
    restingHeartRateBpm: d.restingHeartRateBpm,
    createdAt: nowIso,
  }));

  // Upsert by externalId/date.
  const workoutsUpserted = await db.transaction(
    "rw",
    [db.healthWorkouts, db.healthDaily],
    async () => {
      let wCount = 0;
      for (const w of workouts) {
        const existing = await db.healthWorkouts
          .where("externalId")
          .equals(w.externalId)
          .first();
        if (existing?.id) {
          await db.healthWorkouts.put({ ...w, id: existing.id });
        } else {
          await db.healthWorkouts.add(w);
        }
        wCount++;
      }

      for (const d of daily) {
        const existing = await db.healthDaily.where("date").equals(d.date).first();
        if (existing?.id) {
          await db.healthDaily.put({ ...d, id: existing.id });
        } else {
          await db.healthDaily.add(d);
        }
      }
      return wCount;
    }
  );

  return { workoutsUpserted, dailyUpserted: daily.length };
}

