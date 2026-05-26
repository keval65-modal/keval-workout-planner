"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, WifiOff } from "lucide-react";
import { getExercise } from "@/lib/data/exercises";
import { EXERCISE_MEDIA } from "@/lib/data/exercise-media-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  StepIllustration,
  patternFromExerciseId,
} from "@/components/exercise/step-illustration";

interface StepItem {
  kind: "setup" | "movement";
  text: string;
}

export function ExerciseDemonstration({
  exerciseId,
  className,
}: {
  exerciseId: string;
  className?: string;
}) {
  const exercise = getExercise(exerciseId);
  const media = EXERCISE_MEDIA[exerciseId];

  const steps = useMemo<StepItem[]>(() => {
    const items: StepItem[] = exercise.setup.map((text) => ({
      kind: "setup",
      text,
    }));
    exercise.execution.forEach((text) => {
      items.push({ kind: "movement", text });
    });
    if (items.length === 0) {
      items.push({
        kind: "movement",
        text: exercise.description,
      });
    }
    return items;
  }, [exercise]);

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [gifError, setGifError] = useState(false);
  const [imageFrame, setImageFrame] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const gifUrl =
    media?.gifUrl && !gifError ? media.gifUrl : null;
  const imageUrls = useMemo(
    () => (media?.imageUrls ?? []).filter((_, i) => !imageErrors.has(i)),
    [media?.imageUrls, imageErrors]
  );
  const showGif = Boolean(gifUrl);
  const showImages = !showGif && imageUrls.length > 0;
  const pattern = patternFromExerciseId(exerciseId, exercise.category);

  useEffect(() => {
    setStepIndex(0);
    setGifError(false);
    setImageErrors(new Set());
    setImageFrame(0);
    setPlaying(true);
  }, [exerciseId]);

  useEffect(() => {
    if (!playing || steps.length <= 1) return;
    const timer = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [playing, steps.length]);

  useEffect(() => {
    if (showGif || imageUrls.length < 2) return;
    const timer = setInterval(() => {
      setImageFrame((f) => (f + 1) % imageUrls.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [showGif, imageUrls.length]);

  const current = steps[stepIndex];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-black/50">
        <div className="relative aspect-[4/3] w-full">
          {showGif ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifUrl!}
              alt={`How to perform ${exercise.name}`}
              className="h-full w-full object-contain bg-black/30"
              onError={() => setGifError(true)}
            />
          ) : showImages ? (
            <>
              {imageUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt={`${exercise.name} form frame ${i + 1}`}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain bg-black/30 transition-opacity duration-700",
                    i === imageFrame ? "opacity-100" : "opacity-0"
                  )}
                  onError={() =>
                    setImageErrors((prev) => new Set(prev).add(i))
                  }
                />
              ))}
            </>
          ) : (
            <StepIllustration
              pattern={pattern}
              category={exercise.category}
              stepIndex={stepIndex}
              totalSteps={steps.length}
            />
          )}

          <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
            <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {showGif ? "Animated demo" : showImages ? "Step photos" : "Guide"}
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 bg-gradient-to-t from-black/95 via-black/85 to-black/70 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
            Step {stepIndex + 1} of {steps.length}
            {current?.kind === "setup" ? " · Get ready" : " · Do this"}
          </p>
          <p className="mt-1.5 text-base font-medium leading-relaxed text-white">
            {current?.text}
          </p>
        </div>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute right-2 top-2 h-8 w-8 bg-black/50"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause step guide" : "Play step guide"}
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i === stepIndex ? "bg-emerald-500" : "bg-muted"
              )}
              onClick={() => setStepIndex(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() =>
            setStepIndex((i) => Math.min(steps.length - 1, i + 1))
          }
          disabled={stepIndex === steps.length - 1}
          aria-label="Next step"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{exercise.description}</p>
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Demos load once online and are cached for later workouts. Follow the
        steps above if media is unavailable.
      </p>
    </div>
  );
}
