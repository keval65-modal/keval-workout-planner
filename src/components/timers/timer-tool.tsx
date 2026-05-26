"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TimerTool({
  title,
  defaultSeconds,
  presets,
}: {
  title: string;
  defaultSeconds: number;
  presets?: number[];
}) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-5xl font-bold tabular-nums text-emerald-500">
          {formatTime(remaining)}
        </p>
        <div>
          <Label>Duration (seconds)</Label>
          <Input
            type="number"
            value={seconds}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) || 0;
              setSeconds(v);
              if (!running) setRemaining(v);
            }}
          />
        </div>
        {presets && (
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSeconds(p);
                  setRemaining(p);
                }}
              >
                {formatTime(p)}
              </Button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setRunning(true)}
            disabled={running}
          >
            Start
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setRunning(false);
              setRemaining(seconds);
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntervalTimer() {
  const [work, setWork] = useState(40);
  const [rest, setRest] = useState(20);
  const [rounds, setRounds] = useState(8);
  const [phase, setPhase] = useState<"work" | "rest">("work");
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(40);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (remaining > 0) {
      const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "work") {
      setPhase("rest");
      setRemaining(rest);
    } else if (round >= rounds) {
      setRunning(false);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([300, 100, 300]);
      }
    } else {
      setRound((r) => r + 1);
      setPhase("work");
      setRemaining(work);
    }
  }, [running, remaining, phase, round, rounds, work, rest]);

  const start = () => {
    setRound(1);
    setPhase("work");
    setRemaining(work);
    setRunning(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Interval timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Round {round}/{rounds} — {phase === "work" ? "Work" : "Rest"}
        </p>
        <p className="text-center text-5xl font-bold tabular-nums text-emerald-500">
          {formatTime(remaining)}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Work (s)</Label>
            <Input type="number" value={work} onChange={(e) => setWork(+e.target.value)} />
          </div>
          <div>
            <Label>Rest (s)</Label>
            <Input type="number" value={rest} onChange={(e) => setRest(+e.target.value)} />
          </div>
          <div>
            <Label>Rounds</Label>
            <Input type="number" value={rounds} onChange={(e) => setRounds(+e.target.value)} />
          </div>
        </div>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={start}>
          {running ? "Running…" : "Start intervals"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function WorkoutStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workout timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-5xl font-bold tabular-nums">
          {formatTime(elapsed)}
        </p>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setRunning(true)}
          >
            Start
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setRunning(false);
              setElapsed(0);
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
