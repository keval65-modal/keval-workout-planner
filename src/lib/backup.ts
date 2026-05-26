import type { BackupPayload } from "@/lib/types";
import { DEFAULT_SETTINGS, getDb, getSettings } from "@/lib/db/database";

const BACKUP_VERSION = 1;

export async function exportBackup(): Promise<BackupPayload> {
  const db = getDb();
  const settings = await getSettings();

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    exerciseLogs: await db.exerciseLogs.toArray(),
    workoutSessions: await db.workoutSessions.toArray(),
    measurements: await db.measurements.toArray(),
    progressPhotos: await db.progressPhotos.toArray(),
    postureLogs: await db.postureLogs.toArray(),
    settings,
  };
}

export async function downloadBackupJson(): Promise<void> {
  const payload = await exportBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `my-fitness-coach-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  if (!payload.version || !payload.exportedAt) {
    throw new Error("Invalid backup file");
  }

  const db = getDb();
  await db.transaction(
    "rw",
    [
      db.exerciseLogs,
      db.workoutSessions,
      db.measurements,
      db.progressPhotos,
      db.postureLogs,
      db.settings,
    ],
    async () => {
      await db.exerciseLogs.clear();
      await db.workoutSessions.clear();
      await db.measurements.clear();
      await db.progressPhotos.clear();
      await db.postureLogs.clear();

      await db.exerciseLogs.bulkAdd(payload.exerciseLogs);
      await db.workoutSessions.bulkAdd(payload.workoutSessions);
      await db.measurements.bulkAdd(payload.measurements);
      await db.progressPhotos.bulkAdd(payload.progressPhotos);
      await db.postureLogs.bulkAdd(payload.postureLogs);
      await db.settings.put({
        key: "app",
        value: payload.settings ?? DEFAULT_SETTINGS,
      });
    }
  );
}

export function parseBackupFile(file: File): Promise<BackupPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as BackupPayload;
        resolve(data);
      } catch {
        reject(new Error("Could not parse JSON backup"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
