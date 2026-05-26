"use client";

import { useCallback, useEffect, useState } from "react";
import { format, startOfWeek, parseISO, isWithinInterval, endOfWeek } from "date-fns";
import { getExercise, POSTURE_EXERCISE_IDS } from "@/lib/data/exercises";
import { getDb } from "@/lib/db/database";
import { ExerciseAnimation } from "@/components/exercise/exercise-animation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

const EDUCATION = [
  {
    title: "Forward head posture",
    body: "Hours at a screen pull the head forward, stressing the neck. Chin tucks retrain deep neck flexors to hold your head over your shoulders.",
  },
  {
    title: "Rounded shoulders",
    body: "Tight chest and weak upper back rotate the shoulder inward. Stretch the chest and strengthen rear delts and mid traps.",
  },
  {
    title: "Upper back weakness",
    body: "The thoracic spine stiffens when underused. Extensions and rows restore extension and scapular control.",
  },
  {
    title: "Proper sitting posture",
    body: "Feet flat, hips at knee height, screen at eye level, elbows near 90°, and micro-breaks every 30–45 minutes.",
  },
];

export default function PosturePage() {
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [weeklyCount, setWeeklyCount] = useState(0);
  const today = format(new Date(), "yyyy-MM-dd");

  const refresh = useCallback(async () => {
    const db = getDb();
    const logs = await db.postureLogs.where("date").equals(today).toArray();
    setCompletedToday(new Set(logs.map((l) => l.exerciseId)));

    const all = await db.postureLogs.toArray();
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const inWeek = all.filter((l) =>
      isWithinInterval(parseISO(l.date), { start: weekStart, end: weekEnd })
    );
    const uniqueDays = new Set(inWeek.map((l) => l.date));
    setWeeklyCount(uniqueDays.size);
  }, [today]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (exerciseId: string) => {
    const db = getDb();
    if (completedToday.has(exerciseId)) {
      const toDelete = await db.postureLogs
        .filter((l) => l.exerciseId === exerciseId && l.date === today)
        .first();
      if (toDelete?.id) await db.postureLogs.delete(toDelete.id);
    } else {
      await db.postureLogs.add({ exerciseId, date: today });
    }
    await refresh();
  };

  const weekGoal = 5;
  const weekPercent = Math.min(100, (weeklyCount / weekGoal) * 100);

  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-2xl font-bold">Fix My Hunchback</h1>
        <p className="text-sm text-muted-foreground">
          Posture correction module — track daily completion and weekly consistency.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly consistency</CardTitle>
          <CardDescription>
            {weeklyCount} of {weekGoal} days this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={weekPercent} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {POSTURE_EXERCISE_IDS.map((id) => {
          const ex = getExercise(id);
          const done = completedToday.has(id);
          return (
            <Card key={id} className={done ? "border-emerald-500/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ex.name}</CardTitle>
                  {done && <Check className="h-5 w-5 text-emerald-500" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ExerciseAnimation animationKey={ex.animationKey} />
                <p className="text-sm text-muted-foreground">{ex.description}</p>
                <Button
                  variant={done ? "outline" : "default"}
                  className={!done ? "w-full bg-emerald-600 hover:bg-emerald-700" : "w-full"}
                  onClick={() => toggle(id)}
                >
                  {done ? "Mark incomplete" : "Mark complete"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Learn</h2>
        {EDUCATION.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.body}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
