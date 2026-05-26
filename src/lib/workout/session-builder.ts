import type { DayPlan, GuidedExerciseStep, ScheduledExercise, WorkoutPhase } from "@/lib/types";
import { getExercise } from "@/lib/data/exercises";

function isTimedReps(reps?: number | string): boolean {
  if (reps === undefined) return false;
  const s = String(reps);
  return s.includes("s") || s.includes("min");
}

function parseDurationSeconds(reps?: number | string): number | undefined {
  if (reps === undefined) return undefined;
  const s = String(reps).toLowerCase();
  if (s.includes("min")) {
    const n = parseInt(s, 10);
    return (isNaN(n) ? 10 : n) * 60;
  }
  if (s.includes("s")) {
    const n = parseInt(s, 10);
    return isNaN(n) ? 45 : n;
  }
  return undefined;
}

function trackWeightFor(exerciseId: string): boolean {
  const cat = getExercise(exerciseId).category;
  return cat === "strength";
}

function expandScheduled(
  items: ScheduledExercise[],
  phase: WorkoutPhase
): GuidedExerciseStep[] {
  const steps: GuidedExerciseStep[] = [];

  for (const item of items) {
    if (item.durationMinutes) {
      steps.push({
        id: `${phase}-${item.exerciseId}-timed`,
        phase,
        exerciseId: item.exerciseId,
        setNumber: 1,
        totalSets: 1,
        targetReps: `${item.durationMinutes} min`,
        trackWeight: false,
        durationSeconds: item.durationMinutes * 60,
      });
      continue;
    }

    const sets = item.sets ?? 1;
    const reps = item.reps ?? 10;
    const timed = isTimedReps(reps);
    const durationSeconds = timed ? parseDurationSeconds(reps) : undefined;

    for (let set = 1; set <= sets; set++) {
      steps.push({
        id: `${phase}-${item.exerciseId}-set-${set}`,
        phase,
        exerciseId: item.exerciseId,
        setNumber: set,
        totalSets: sets,
        targetReps: String(reps),
        trackWeight: trackWeightFor(item.exerciseId) && !timed,
        durationSeconds,
      });
    }
  }

  return steps;
}

export function buildGuidedSession(plan: DayPlan): GuidedExerciseStep[] {
  const phases: { phase: WorkoutPhase; items: ScheduledExercise[] }[] = [
    { phase: "warmup", items: plan.warmup },
    { phase: "strength", items: plan.strength },
    { phase: "cardio", items: plan.cardio },
    { phase: "core", items: plan.core ?? [] },
    { phase: "stretch", items: plan.stretching },
    { phase: "mobility", items: plan.mobility ?? [] },
    { phase: "recovery", items: [] },
  ];

  if (plan.dayOfWeek === 0) {
    phases.push({
      phase: "recovery",
      items: [],
    });
  }

  return phases.flatMap(({ phase, items }) => expandScheduled(items, phase));
}

export function getPhaseLabel(phase: WorkoutPhase): string {
  const labels: Record<WorkoutPhase, string> = {
    warmup: "Warm-up",
    strength: "Strength",
    cardio: "Cardio",
    core: "Core",
    stretch: "Stretching",
    mobility: "Mobility",
    recovery: "Recovery",
  };
  return labels[phase];
}
