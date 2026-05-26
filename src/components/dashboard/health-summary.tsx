"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealthSummary } from "@/hooks/use-app-data";
import { Footprints, Flame, HeartPulse } from "lucide-react";

export function HealthSummary() {
  const { latestDaily } = useHealthSummary();

  if (!latestDaily) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health Connect</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Import from Health Connect in Settings to see steps, calories, and heart rate.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today (Health Connect)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Footprints className="h-4 w-4" /> Steps
          </div>
          <p className="mt-1 text-xl font-bold">{latestDaily.steps ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="h-4 w-4" /> kcal
          </div>
          <p className="mt-1 text-xl font-bold">
            {latestDaily.activeCaloriesKcal ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HeartPulse className="h-4 w-4" /> RHR
          </div>
          <p className="mt-1 text-xl font-bold">
            {latestDaily.restingHeartRateBpm ?? "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

