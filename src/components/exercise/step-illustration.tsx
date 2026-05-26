"use client";

import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/types";

type Pattern =
  | "squat"
  | "hinge"
  | "push"
  | "pull"
  | "stretch"
  | "cardio"
  | "posture"
  | "core"
  | "generic";

export type { Pattern };

function patternFor(category: ExerciseCategory): Pattern {
  switch (category) {
    case "warmup":
      return "posture";
    case "stretch":
    case "mobility":
      return "stretch";
    case "cardio":
      return "cardio";
    case "core":
      return "core";
    case "posture":
      return "posture";
    case "strength":
      return "generic";
    default:
      return "generic";
  }
}

function squatPose(phase: number) {
  const kneeY = phase === 0 ? 95 : phase === 1 ? 108 : 100;
  const hipY = phase === 0 ? 72 : phase === 1 ? 88 : 76;
  return { kneeY, hipY, armY: phase === 1 ? 68 : 58 };
}

export function StepIllustration({
  pattern: patternProp,
  category,
  stepIndex,
  totalSteps,
  className,
}: {
  pattern?: Pattern;
  category: ExerciseCategory;
  stepIndex: number;
  totalSteps: number;
  className?: string;
}) {
  const pattern = patternProp ?? patternFor(category);
  const phase =
    totalSteps <= 1 ? 1 : Math.min(2, Math.floor((stepIndex / totalSteps) * 3));
  const squat = squatPose(phase);

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-b from-muted to-muted/50 p-6",
        className
      )}
    >
      <svg viewBox="0 0 200 140" className="h-full max-h-56 w-full text-emerald-500">
        <line x1="20" y1="120" x2="180" y2="120" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        {pattern === "squat" || pattern === "generic" || pattern === "hinge" ? (
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <circle cx="100" cy="40" r="12" fill="currentColor" stroke="none" opacity="0.9" />
            <line x1="100" y1="52" x2="100" y2={squat.hipY} strokeWidth="7" />
            <line x1="100" y1="60" x2="72" y2={squat.armY} strokeWidth="6" />
            <line x1="100" y1="60" x2="128" y2={squat.armY} strokeWidth="6" />
            <line x1="100" y1={squat.hipY} x2="82" y2={squat.kneeY} strokeWidth="7" />
            <line x1="100" y1={squat.hipY} x2="118" y2={squat.kneeY} strokeWidth="7" />
            <line x1="82" y1={squat.kneeY} x2="82" y2="120" strokeWidth="6" />
            <line x1="118" y1={squat.kneeY} x2="118" y2="120" strokeWidth="6" />
            {phase === 1 && (
              <text x="100" y="24" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
                DOWN
              </text>
            )}
          </g>
        ) : null}
        {pattern === "push" && (
          <g stroke="currentColor" strokeLinecap="round" fill="none">
            <circle cx="70" cy="70" r="12" fill="currentColor" stroke="none" />
            <line x1="82" y1="70" x2="130" y2="70" strokeWidth="7" />
            <line x1="130" y1="70" x2={phase === 1 ? "155" : "145"} y2="70" strokeWidth="6" />
            <line x1="70" y1="82" x2="70" y2="110" strokeWidth="6" />
            <line x1="55" y1="110" x2="85" y2="110" strokeWidth="6" />
          </g>
        )}
        {pattern === "pull" && (
          <g stroke="currentColor" strokeLinecap="round" fill="none">
            <line x1="140" y1="30" x2="140" y2="50" strokeWidth="4" />
            <circle cx="90" cy="75" r="12" fill="currentColor" stroke="none" />
            <line x1="102" y1="75" x2="130" y2={phase === 1 ? "55" : "65"} strokeWidth="7" />
            <line x1="90" y1="87" x2="90" y2="115" strokeWidth="6" />
          </g>
        )}
        {pattern === "stretch" && (
          <g stroke="currentColor" strokeLinecap="round" fill="none">
            <circle cx="100" cy="45" r="11" fill="currentColor" stroke="none" />
            <line x1="100" y1="56" x2="100" y2="95" strokeWidth="7" />
            <path
              d={phase === 1 ? "M100 60 Q130 80 100 100" : "M100 60 Q70 80 100 95"}
              strokeWidth="5"
              fill="none"
            />
            <text x="100" y="130" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">
              HOLD & BREATHE
            </text>
          </g>
        )}
        {pattern === "cardio" && (
          <g stroke="currentColor" strokeLinecap="round" fill="none">
            <circle cx={phase === 0 ? 70 : phase === 1 ? 100 : 130} cy="80" r="12" fill="currentColor" stroke="none" />
            <line x1="40" y1="120" x2="160" y2="120" strokeWidth="3" strokeDasharray="6 4" opacity="0.4" />
          </g>
        )}
        {pattern === "posture" && (
          <g stroke="currentColor" strokeLinecap="round" fill="none">
            <rect x="40" y="20" width="120" height="90" rx="4" strokeWidth="2" opacity="0.25" />
            <circle cx={phase === 1 ? "105" : "100"} cy="55" r="11" fill="currentColor" stroke="none" />
            <line x1="100" y1="66" x2="100" y2="95" strokeWidth="7" />
            <line x1="100" y1="72" x2="75" y2="85" strokeWidth="5" />
            <line x1="100" y1="72" x2="125" y2="85" strokeWidth="5" />
          </g>
        )}
        {pattern === "core" && (
          <g stroke="currentColor" strokeLinecap="round" fill="none">
            <line x1="50" y1="100" x2="150" y2="100" strokeWidth="3" opacity="0.3" />
            <circle cx="100" cy="85" r="10" fill="currentColor" stroke="none" />
            <line x1="88" y1="92" x2="70" y2="100" strokeWidth="5" />
            <line x1="112" y1="92" x2="130" y2="100" strokeWidth="5" />
            <line x1="100" y1="95" x2="100" y2="100" strokeWidth="6" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function patternFromExerciseId(
  exerciseId: string,
  category: ExerciseCategory
): Pattern {
  const id = exerciseId.toLowerCase();
  if (id.includes("squat") || id.includes("lunge") || id.includes("leg-press"))
    return "squat";
  if (id.includes("deadlift") || id.includes("hinge") || id.includes("bridge"))
    return "hinge";
  if (
    id.includes("press") ||
    id.includes("pushdown") ||
    id.includes("extension")
  )
    return "push";
  if (id.includes("row") || id.includes("pulldown") || id.includes("curl") || id.includes("pull"))
    return "pull";
  return patternFor(category);
}
