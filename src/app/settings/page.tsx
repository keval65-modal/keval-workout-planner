"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
} from "@/lib/db/database";
import type { AppSettings } from "@/lib/types";
import { downloadBackupJson, importBackup, parseBackupFile } from "@/lib/backup";
import { importHealthConnectExport } from "@/lib/health-connect-import";
import {
  DEFAULT_REMINDERS,
  loadReminders,
  requestNotificationPermission,
  saveReminders,
  scheduleLocalReminders,
  type ReminderConfig,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [reminders, setReminders] = useState<ReminderConfig[]>(DEFAULT_REMINDERS);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [hcStatus, setHcStatus] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
    setReminders(loadReminders());
  }, []);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
  };

  const updateReminder = (id: string, enabled: boolean) => {
    const next = reminders.map((r) =>
      r.id === id ? { ...r, enabled } : r
    );
    setReminders(next);
    saveReminders(next);
    scheduleLocalReminders(next);
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await updateSettings({ notificationsEnabled: true });
      scheduleLocalReminders(reminders);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Offline app — no accounts. Export backups anytime.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default rest (seconds)</Label>
            <Input
              type="number"
              value={settings.restSeconds}
              onChange={(e) =>
                updateSettings({ restSeconds: parseInt(e.target.value, 10) || 90 })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Dark mode optimized for gym use</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTheme(t);
                updateSettings({ theme: t });
              }}
            >
              {t}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reminders</CardTitle>
          <CardDescription>
            Local notifications (requires permission). Works offline after scheduled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={enableNotifications}>
            Enable notifications
          </Button>
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">
                  {String(r.hour).padStart(2, "0")}:{String(r.minute).padStart(2, "0")} — {r.title}
                </p>
                <p className="text-xs text-muted-foreground">{r.body}</p>
              </div>
              <Switch
                checked={r.enabled}
                onCheckedChange={(v) => updateReminder(r.id, v)}
              />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Label>Hydration reminders</Label>
            <Switch
              checked={settings.hydrationReminders}
              onCheckedChange={(v) => {
                updateSettings({ hydrationReminders: v });
                updateReminder("hydration", v);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup</CardTitle>
          <CardDescription>Export or import all local data as JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => downloadBackupJson()}
          >
            Export backup
          </Button>
          <div>
            <Label htmlFor="import">Import backup</Label>
            <Input
              id="import"
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const payload = await parseBackupFile(file);
                  await importBackup(payload);
                  setImportStatus("Backup restored successfully.");
                } catch (err) {
                  setImportStatus(
                    err instanceof Error ? err.message : "Import failed"
                  );
                }
              }}
            />
          </div>
          {importStatus && (
            <p className="text-sm text-muted-foreground">{importStatus}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health Connect sync</CardTitle>
          <CardDescription>
            Import workouts, heart rate, calories, and steps from the Android companion export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="hc-import">Import Health Connect export</Label>
            <Input
              id="hc-import"
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const payload = await parseBackupFile(file);
                  const res = await importHealthConnectExport(payload);
                  setHcStatus(
                    `Imported ${res.workoutsUpserted} workouts and ${res.dailyUpserted} daily summaries.`
                  );
                } catch (err) {
                  setHcStatus(
                    err instanceof Error ? err.message : "Import failed"
                  );
                }
              }}
            />
          </div>
          {hcStatus && <p className="text-sm text-muted-foreground">{hcStatus}</p>}
          <p className="text-xs text-muted-foreground">
            Tip: export from the Android Health Connect companion after a workout. Media stays local in this app.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground pb-4">
        My Fitness Coach v1.0 — 100% offline, single user, no cloud.
      </p>
    </div>
  );
}
