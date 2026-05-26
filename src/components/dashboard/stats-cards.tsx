"use client";

import { Flame, Percent, Scale, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-app-data";
import { getExercise } from "@/lib/data/exercises";

export function StatsCards() {
  const { streak, weeklyPercent, latestWeight, prs } = useDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{streak} days</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">This week</CardTitle>
          <Percent className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{weeklyPercent}%</p>
          <p className="text-xs text-muted-foreground">Workouts done</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Weight</CardTitle>
          <Scale className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {latestWeight != null ? `${latestWeight} kg` : "—"}
          </p>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recent PRs</CardTitle>
          <Trophy className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          {prs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete workouts to track personal records.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {prs.map((pr) => (
                <li key={pr.exerciseId} className="flex justify-between">
                  <span>{getExercise(pr.exerciseId).name}</span>
                  <span className="font-medium text-emerald-500">
                    {pr.weight} kg × {pr.reps}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
