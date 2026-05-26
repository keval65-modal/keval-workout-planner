export interface ReminderConfig {
  id: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
  enabled: boolean;
}

export const DEFAULT_REMINDERS: ReminderConfig[] = [
  {
    id: "gym-prep",
    hour: 7,
    minute: 0,
    title: "Prepare for Gym",
    body: "Review today's workout and pack your bag.",
    enabled: true,
  },
  {
    id: "workout-time",
    hour: 8,
    minute: 0,
    title: "Workout Time",
    body: "Start your guided workout with My Fitness Coach.",
    enabled: true,
  },
  {
    id: "posture",
    hour: 21,
    minute: 0,
    title: "Posture Routine",
    body: "Complete your Fix My Hunchback exercises.",
    enabled: true,
  },
  {
    id: "hydration",
    hour: 12,
    minute: 0,
    title: "Stay Hydrated",
    body: "Drink water to support recovery and performance.",
    enabled: false,
  },
];

const STORAGE_KEY = "mfc-reminders";

export function loadReminders(): ReminderConfig[] {
  if (typeof window === "undefined") return DEFAULT_REMINDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDERS;
    return JSON.parse(raw) as ReminderConfig[];
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export function saveReminders(reminders: ReminderConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function msUntilNext(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

const scheduledTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function scheduleLocalReminders(reminders: ReminderConfig[]): void {
  if (typeof window === "undefined") return;

  for (const [, timeout] of scheduledTimeouts) {
    clearTimeout(timeout);
  }
  scheduledTimeouts.clear();

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;

    const schedule = () => {
      new Notification(reminder.title, {
        body: reminder.body,
        icon: "/icons/icon-192.png",
        tag: reminder.id,
      });
      const timeout = setTimeout(schedule, msUntilNext(reminder.hour, reminder.minute));
      scheduledTimeouts.set(reminder.id, timeout);
    };

    const initial = setTimeout(
      schedule,
      msUntilNext(reminder.hour, reminder.minute)
    );
    scheduledTimeouts.set(reminder.id, initial);
  }
}
