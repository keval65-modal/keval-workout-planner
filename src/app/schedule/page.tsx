import { Clock } from "lucide-react";
import { WEEKLY_SCHEDULE } from "@/lib/data/schedule";
import { getExercise } from "@/lib/data/exercises";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SchedulePage() {
  const ordered = [...WEEKLY_SCHEDULE].sort(
    (a, b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek)
  );

  return (
    <div className="space-y-4 py-4">
      <header>
        <h1 className="text-2xl font-bold">Workout Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Fixed weekly program — tap Start Workout from home each day.
        </p>
      </header>
      {ordered.map((day) => (
        <Card key={day.dayOfWeek}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{day.name}</CardTitle>
                <CardDescription>{day.subtitle}</CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />~{day.estimatedMinutes}m
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {day.strength.length > 0 && (
              <p>
                <span className="font-medium">Strength: </span>
                {day.strength
                  .map((e) => getExercise(e.exerciseId).name)
                  .join(", ")}
              </p>
            )}
            {day.cardio.length > 0 && (
              <p>
                <span className="font-medium">Cardio: </span>
                {day.cardio
                  .map((e) => getExercise(e.exerciseId).name)
                  .join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
