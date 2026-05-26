"use client";

import { cn } from "@/lib/utils";

const ANIMATION_STYLES: Record<string, string> = {
  push: "animate-pulse",
  pull: "animate-bounce",
  legs: "animate-ping",
  core: "animate-spin",
  stretch: "animate-pulse",
  cardio: "animate-bounce",
  posture: "animate-pulse",
  default: "animate-pulse",
};

function categoryFromKey(key: string): string {
  const pushIds = [
    "chest",
    "bench",
    "press",
    "tricep",
    "pushdown",
    "incline",
  ];
  const pullIds = ["lat", "row", "curl", "face-pull", "pull"];
  const legIds = ["leg", "lunge", "calf", "squat", "deadlift", "glute"];
  const coreIds = ["plank", "dead-bug", "bird"];
  const stretchIds = ["stretch", "pose", "child"];
  const cardioIds = ["cardio", "bike", "treadmill", "walk"];
  const postureIds = [
    "chin-tuck",
    "wall-slide",
    "thoracic",
    "band-pull",
    "face-pull",
    "rear-delt",
  ];

  const k = key.toLowerCase();
  if (postureIds.some((p) => k.includes(p))) return "posture";
  if (pushIds.some((p) => k.includes(p))) return "push";
  if (pullIds.some((p) => k.includes(p))) return "pull";
  if (legIds.some((p) => k.includes(p))) return "legs";
  if (coreIds.some((p) => k.includes(p))) return "core";
  if (stretchIds.some((p) => k.includes(p))) return "stretch";
  if (cardioIds.some((p) => k.includes(p))) return "cardio";
  return "default";
}

export function ExerciseAnimation({
  animationKey,
  className,
}: {
  animationKey: string;
  className?: string;
}) {
  const cat = categoryFromKey(animationKey);
  const animClass = ANIMATION_STYLES[cat] ?? ANIMATION_STYLES.default;

  return (
    <div
      className={cn(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-muted",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 120"
        className="h-full w-full max-h-48 text-emerald-500/80"
        role="img"
        aria-label="Exercise demonstration animation"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="28" rx="14" ry="14" fill="url(#bodyGrad)" />
        <rect
          x="88"
          y="42"
          width="24"
          height="40"
          rx="6"
          fill="url(#bodyGrad)"
          className={cn(animClass, "origin-center")}
          style={{ transformOrigin: "100px 62px" }}
        />
        <g className={animClass} style={{ transformOrigin: "100px 50px" }}>
          <line
            x1="100"
            y1="48"
            x2="60"
            y2="70"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="100"
            y1="48"
            x2="140"
            y2="70"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <line
          x1="94"
          y1="82"
          x2="78"
          y2="110"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="106"
          y1="82"
          x2="122"
          y2="110"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {cat === "push" && (
          <circle cx="140" cy="55" r="8" fill="currentColor" opacity="0.6">
            <animate
              attributeName="cx"
              values="140;155;140"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        {cat === "pull" && (
          <circle cx="60" cy="55" r="8" fill="currentColor" opacity="0.6">
            <animate
              attributeName="cx"
              values="60;45;60"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        {cat === "cardio" && (
          <path
            d="M30 95 Q50 75 70 95 T110 95 T150 95"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values="M30 95 Q50 85 70 95 T110 95 T150 95;M30 95 Q50 75 70 95 T110 95 T150 95;M30 95 Q50 85 70 95 T110 95 T150 95"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        )}
      </svg>
      <span className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        Form demo
      </span>
    </div>
  );
}
