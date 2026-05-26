import {
  TimerTool,
  IntervalTimer,
  WorkoutStopwatch,
} from "@/components/timers/timer-tool";

export default function TimersPage() {
  return (
    <div className="space-y-4 py-4">
      <header>
        <h1 className="text-2xl font-bold">Timers</h1>
        <p className="text-sm text-muted-foreground">
          Rest, stretch, cardio, intervals, and full workout timing.
        </p>
      </header>
      <WorkoutStopwatch />
      <TimerTool title="Rest timer" defaultSeconds={90} presets={[60, 90, 120, 180]} />
      <TimerTool title="Stretch timer" defaultSeconds={45} presets={[30, 45, 60]} />
      <TimerTool
        title="Cardio timer"
        defaultSeconds={900}
        presets={[600, 900, 1200, 1800, 2700, 3600]}
      />
      <IntervalTimer />
    </div>
  );
}
