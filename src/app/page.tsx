import { TodayWorkout } from "@/components/workout/today-workout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeightChart } from "@/components/dashboard/weight-chart";

export default function HomePage() {
  return (
    <div className="space-y-6 py-4">
      <header>
        <p className="text-sm text-emerald-500 font-medium">My Fitness Coach</p>
        <h1 className="text-2xl font-bold tracking-tight">Good morning</h1>
        <p className="text-muted-foreground text-sm">
          Your personal trainer is ready. No login — all data stays on this device.
        </p>
      </header>
      <TodayWorkout />
      <StatsCards />
      <WeightChart />
    </div>
  );
}
