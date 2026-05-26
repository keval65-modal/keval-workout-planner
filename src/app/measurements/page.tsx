"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDb } from "@/lib/db/database";
import type { MeasurementType } from "@/lib/types";
import { useMeasurements } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MEASUREMENT_TYPES: { value: MeasurementType; label: string; unit: string }[] = [
  { value: "weight", label: "Body Weight", unit: "kg" },
  { value: "waist", label: "Waist", unit: "cm" },
  { value: "chest", label: "Chest", unit: "cm" },
  { value: "arms", label: "Arms", unit: "cm" },
  { value: "thighs", label: "Thighs", unit: "cm" },
  { value: "neck", label: "Neck", unit: "cm" },
];

function MeasurementChart({ type }: { type: MeasurementType }) {
  const { data } = useMeasurements(type);
  const meta = MEASUREMENT_TYPES.find((m) => m.value === type)!;
  const chartData = data.map((m) => ({
    date: m.date.slice(5),
    value: m.value,
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No data yet for {meta.label}.</p>
    );
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="hsl(142 76% 45%)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MeasurementsPage() {
  const [type, setType] = useState<MeasurementType>("weight");
  const [value, setValue] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { refresh } = useMeasurements();

  const saveMeasurement = async () => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const meta = MEASUREMENT_TYPES.find((m) => m.value === type)!;
    await getDb().measurements.add({
      type,
      value: num,
      unit: meta.unit,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setValue("");
    refresh();
  };

  const savePhoto = async () => {
    if (!photoPreview) return;
    await getDb().progressPhotos.add({
      date: format(new Date(), "yyyy-MM-dd"),
      dataUrl: photoPreview,
      label: "Progress",
    });
    setPhotoPreview(null);
    alert("Progress photo saved locally.");
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-2xl font-bold">Measurements</h1>
        <p className="text-sm text-muted-foreground">
          Track body metrics and progress photos — stored only on this device.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log measurement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as MeasurementType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEASUREMENT_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label} ({m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Value</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
            />
          </div>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={saveMeasurement}
          >
            Save
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="weight">
        <TabsList className="flex h-auto flex-wrap">
          {MEASUREMENT_TYPES.map((m) => (
            <TabsTrigger key={m.value} value={m.value} className="text-xs">
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {MEASUREMENT_TYPES.map((m) => (
          <TabsContent key={m.value} value={m.value}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{m.label} trend</CardTitle>
              </CardHeader>
              <CardContent>
                <MeasurementChart type={m.value} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept="image/*" capture="environment" onChange={onPhoto} />
          {photoPreview && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={savePhoto}
              >
                Save photo
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
