import type { ExerciseLog } from "@/lib/types";

export interface ProgressionSuggestion {
  message: string;
  suggestedWeight?: number;
  repeatWeight?: number;
}

function parseTargetReps(target: string): number {
  const match = target.match(/(\d+)\s*-\s*(\d+)/);
  if (match) return parseInt(match[2], 10);
  const single = parseInt(target, 10);
  return isNaN(single) ? 10 : single;
}

export function getProgressionSuggestion(
  lastLog: ExerciseLog | undefined,
  targetReps: string
): ProgressionSuggestion {
  if (!lastLog || lastLog.sets.length === 0) {
    return {
      message: "First time logging this exercise. Start light and focus on form.",
    };
  }

  const target = parseTargetReps(targetReps);
  const allHitTarget = lastLog.sets.every((s) => s.reps >= target);
  const maxWeight = Math.max(...lastLog.sets.map((s) => s.weight));
  const minWeight = Math.min(...lastLog.sets.map((s) => s.weight));

  if (maxWeight === 0) {
    return {
      message: "Log your working weight today to track progression next time.",
    };
  }

  if (allHitTarget) {
    const increment = maxWeight >= 100 ? 5 : 2.5;
    const suggested = maxWeight + increment;
    return {
      message: `Last session you hit all target reps. Try ${suggested} kg today.`,
      suggestedWeight: suggested,
    };
  }

  return {
    message: `Repeat ${maxWeight} kg until all sets reach ${target} reps.`,
    repeatWeight: maxWeight === minWeight ? maxWeight : maxWeight,
  };
}

export function formatLastWorkout(log: ExerciseLog | undefined): string {
  if (!log || log.sets.length === 0) return "No previous data";
  return log.sets
    .map((s) => (s.weight > 0 ? `${s.weight} kg × ${s.reps}` : `${s.reps} reps`))
    .join("\n");
}
