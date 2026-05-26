"use client";

import Link from "next/link";
import { Clock, Dumbbell, Heart, Sparkles, StretchHorizontal } from "lucide-react";
import { getTodayPlan } from "@/lib/data/schedule";
import { getExercise } from "@/lib/data/exercises";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ExerciseList({
  title,
  icon: Icon,
  ids,
}: {
  title: string;
  icon: React.ElementType;
  ids: string[];
}) {
  if (ids.length === 0) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <ul className="space-y-0.5 text-sm">
        {ids.map((id) => (
          <li key={id}>{getExercise(id).name}</li>
        ))}
      </ul>
    </div>
  );
}

export function TodayWorkout() {
  const plan = getTodayPlan();

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">Today&apos;s Workout</CardTitle>
            <CardDescription className="text-base">
              {plan.name} — {plan.subtitle}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Clock className="h-3 w-3" />
            ~{plan.estimatedMinutes} min
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExerciseList
          title="Warm-up"
          icon={Sparkles}
          ids={plan.warmup.map((e) => e.exerciseId)}
        />
        <ExerciseList
          title="Strength"
          icon={Dumbbell}
          ids={plan.strength.map((e) => e.exerciseId)}
        />
        <ExerciseList
          title="Cardio"
          icon={Heart}
          ids={plan.cardio.map((e) => e.exerciseId)}
        />
        {(plan.core?.length ?? 0) > 0 && (
          <ExerciseList
            title="Core"
            icon={Dumbbell}
            ids={plan.core!.map((e) => e.exerciseId)}
          />
        )}
        <ExerciseList
          title="Stretching"
          icon={StretchHorizontal}
          ids={plan.stretching.map((e) => e.exerciseId)}
        />
        {(plan.mobility?.length ?? 0) > 0 && (
          <ExerciseList
            title="Mobility"
            icon={Sparkles}
            ids={plan.mobility!.map((e) => e.exerciseId)}
          />
        )}

        <Link
          href="/workout/guided"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-14 w-full text-lg bg-emerald-600 hover:bg-emerald-700 text-white"
          )}
        >
          Start Workout
        </Link>
      </CardContent>
    </Card>
  );
}
