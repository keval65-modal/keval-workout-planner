"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getTodayPlan } from "@/lib/data/schedule";
import { getExercise } from "@/lib/data/exercises";
import { buildGuidedSession, getPhaseLabel } from "@/lib/workout/session-builder";
import {
  formatLastWorkout,
  getProgressionSuggestion,
} from "@/lib/workout/progression";
import {
  getLastExerciseLog,
  getSettings,
  logExerciseSet,
} from "@/lib/db/database";
import { getDb } from "@/lib/db/database";
import type { ExerciseLog, GuidedExerciseStep } from "@/lib/types";
import { ExerciseAnimation } from "@/components/exercise/exercise-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Check } from "lucide-react";

type Mode = "exercise" | "rest" | "complete";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GuidedWorkout() {
  const router = useRouter();
  const plan = useMemo(() => getTodayPlan(), []);
  const steps = useMemo(() => buildGuidedSession(plan), [plan]);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("exercise");
  const [restSeconds, setRestSeconds] = useState(90);
  const [countdown, setCountdown] = useState(90);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [lastLog, setLastLog] = useState<ExerciseLog | undefined>();
  const [sessionStarted] = useState(() => Date.now());
  const today = format(new Date(), "yyyy-MM-dd");

  const current: GuidedExerciseStep | undefined = steps[stepIndex];
  const exercise = current ? getExercise(current.exerciseId) : null;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? ((stepIndex + (mode === "complete" ? 1 : 0)) / totalSteps) * 100 : 0;

  const loadContext = useCallback(async () => {
    if (!current) return;
    const settings = await getSettings();
    setRestSeconds(settings.restSeconds);
    setCountdown(settings.restSeconds);
    const log = await getLastExerciseLog(current.exerciseId, today);
    setLastLog(log);
    const suggestion = getProgressionSuggestion(log, current.targetReps);
    if (suggestion.suggestedWeight) setWeight(String(suggestion.suggestedWeight));
    else if (suggestion.repeatWeight) setWeight(String(suggestion.repeatWeight));
    else if (log?.sets.length) {
      setWeight(String(log.sets[log.sets.length - 1].weight));
    }
    const targetNum = parseInt(String(current.targetReps), 10);
    setReps(isNaN(targetNum) ? "" : String(targetNum));
  }, [current, today]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const goToNextSet = useCallback(() => {
    setStepIndex((i) => i + 1);
    setMode("exercise");
    setCountdown(restSeconds);
  }, [restSeconds]);

  useEffect(() => {
    if (mode !== "rest") return;
    if (countdown <= 0) {
      goToNextSet();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, countdown, goToNextSet]);

  const finishSession = useCallback(async () => {
    const durationMinutes = Math.round((Date.now() - sessionStarted) / 60000);
    await getDb().workoutSessions.add({
      date: today,
      dayOfWeek: plan.dayOfWeek,
      dayName: plan.name,
      completed: true,
      completedAt: new Date().toISOString(),
      durationMinutes,
      phasesCompleted: ["warmup", "strength", "cardio", "stretch"],
    });
  }, [plan, sessionStarted, today]);

  const advanceStep = useCallback(() => {
    if (stepIndex + 1 >= steps.length) {
      setMode("complete");
      void finishSession();
      return;
    }
    setStepIndex((i) => i + 1);
    setMode("exercise");
  }, [stepIndex, steps.length, finishSession]);

  const handleCompleteSet = async () => {
    if (!current) return;

    if (current.trackWeight) {
      await logExerciseSet(current.exerciseId, today, {
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps, 10) || 0,
      });
    } else if (current.durationSeconds) {
      await logExerciseSet(current.exerciseId, today, {
        weight: 0,
        reps: 1,
      });
    } else {
      await logExerciseSet(current.exerciseId, today, {
        weight: 0,
        reps: parseInt(reps, 10) || 1,
      });
    }

    const isLastSet = current.setNumber >= current.totalSets;
    if (isLastSet) {
      advanceStep();
    } else {
      setCountdown(restSeconds);
      setMode("rest");
    }
  };

  const handleTimedComplete = async () => {
    if (!current) return;
    await logExerciseSet(current.exerciseId, today, { weight: 0, reps: 1 });
    advanceStep();
  };

  if (mode === "complete") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="rounded-full bg-emerald-500/20 p-6">
          <Check className="h-16 w-16 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold">Workout Complete!</h1>
        <p className="text-muted-foreground">
          Great work today. Recovery is part of the program.
        </p>
        <Button size="lg" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!current || !exercise) {
    return (
      <div className="p-6 text-center">
        <p>No exercises scheduled for today.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  const strengthSteps = steps.filter((s) => s.phase === "strength");
  const exerciseIndexInPhase =
    strengthSteps.findIndex((s) => s.id === current.id) + 1 || stepIndex + 1;
  const displayIndex =
    current.phase === "strength"
      ? exerciseIndexInPhase
      : stepIndex + 1;
  const displayTotal =
    current.phase === "strength" ? strengthSteps.length || 1 : totalSteps;

  const suggestion = getProgressionSuggestion(lastLog, current.targetReps);

  if (mode === "rest") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Rest
        </p>
        <p className="text-7xl font-bold tabular-nums text-emerald-500">
          {formatTime(countdown)}
        </p>
        <p className="text-center text-muted-foreground">
          Next: {getExercise(steps[stepIndex + 1]?.exerciseId ?? current.exerciseId).name}
          {steps[stepIndex + 1] && (
            <>
              {" "}
              — Set {steps[stepIndex + 1].setNumber} of{" "}
              {steps[stepIndex + 1].totalSets}
            </>
          )}
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setCountdown((c) => c + 30)}
          >
            +30s
          </Button>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={goToNextSet}
          >
            Start Next Set
          </Button>
          <Button variant="ghost" onClick={goToNextSet}>
            Skip rest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-8">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progressPercent} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{getPhaseLabel(current.phase)}</Badge>
          <span className="text-sm text-muted-foreground">
            Exercise {displayIndex} of {displayTotal}
          </span>
        </div>

        <h1 className="text-2xl font-bold">{exercise.name}</h1>
        <p className="text-lg text-emerald-500">
          Target: {current.totalSets} sets × {current.targetReps}
          {current.setNumber > 0 && (
            <span className="text-foreground">
              {" "}
              — Set {current.setNumber} of {current.totalSets}
            </span>
          )}
        </p>

        <ExerciseAnimation animationKey={exercise.animationKey} />

        {lastLog && current.trackWeight && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Last workout</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
              {formatLastWorkout(lastLog)}
            </CardContent>
          </Card>
        )}

        {current.trackWeight && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            {suggestion.message}
          </p>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Instructions</CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Muscles worked</p>
              <p className="text-muted-foreground">{exercise.muscles.join(", ")}</p>
            </div>
            <div>
              <p className="font-medium">Setup</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {exercise.setup.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Execution</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {exercise.execution.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Breathing</p>
              <p className="text-muted-foreground">{exercise.breathing}</p>
            </div>
            <div>
              <p className="font-medium">Common mistakes</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {exercise.mistakes.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Safety</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {exercise.safety.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {current.durationSeconds ? (
          <Button
            size="lg"
            className="h-14 w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleTimedComplete}
          >
            Complete {current.targetReps}
          </Button>
        ) : (
          <>
            {current.trackWeight && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    inputMode="numeric"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            )}
            {!current.trackWeight && !current.durationSeconds && (
              <div>
                <Label htmlFor="reps-only">Reps / hold</Label>
                <Input
                  id="reps-only"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
            )}
            <Button
              size="lg"
              className="h-14 w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCompleteSet}
            >
              Complete Set
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
