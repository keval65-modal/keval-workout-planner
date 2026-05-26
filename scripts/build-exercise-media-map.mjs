import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YUHONAS_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const GIF_BASE =
  "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/";

/** Manual overrides for best visual match (our id -> external name or gif path suffix) */
const GIF_OVERRIDES = {
  "bodyweight-squats": "abs/potty-squat.gif",
  "glute-bridges": "glutes/barbell-glute-bridge.gif",
  "leg-press": "glutes/sled-45-leg-press.gif",
  "plank": "abs/weighted-front-plank.gif",
  "tricep-pushdown": "triceps/cable-pushdown.gif",
  "cable-tricep-pushdown": "triceps/cable-pushdown.gif",
  "dumbbell-row": "upper-back/dumbbell-bent-over-row.gif",
  "face-pull": "delts/band-reverse-fly.gif",
  "light-face-pulls": "delts/band-reverse-fly.gif",
  "incline-dumbbell-press": "pectorals/dumbbell-incline-bench-press.gif",
  "dumbbell-shoulder-press": "delts/dumbbell-shoulder-press.gif",
  "ez-curl": "biceps/ez-barbell-close-grip-curl.gif",
  "chest-press-machine": "pectorals/lever-chest-press.gif",
  "seated-cable-row": "upper-back/cable-seated-row.gif",
  "dumbbell-curl": "biceps/dumbbell-biceps-curl.gif",
  "stationary-bike": "cardio/stationary-bike-run-v-3.gif",
  "rear-delt-fly": "delts/dumbbell-rear-delt-raise.gif",
};

const YUHONAS_OVERRIDES = {
  "bodyweight-squats": "Bodyweight_Squat",
  "walking-lunges": "Bodyweight_Walking_Lunge",
  "glute-bridges": "Barbell_Glute_Bridge",
  "band-pull-aparts": "Band_Pull_Apart",
  "face-pull": "Face_Pull",
  "bird-dog": "Bird_Dog",
  "dead-bug": "Dead_Bug",
  plank: "Plank",
  "wall-slides": "Scapular_Wall_Slide",
  "chin-tucks": "Chin_To_Chest_Stretch",
  "childs-pose": "Childs_Pose",
};

const OUR_NAMES = {
  "thoracic-extensions": "Back Extension",
  "doorway-chest-stretch": "Chest Stretch",
  "wall-slides": "Scapular Wall Slide",
  "band-pull-aparts": "Band Pull Apart",
  "chin-tucks": "Chin Tuck",
  "light-face-pulls": "Face Pull",
  "chest-press-machine": "Machine Chest Press",
  "lat-pulldown": "Lat Pulldown",
  "incline-dumbbell-press": "Incline Dumbbell Press",
  "seated-cable-row": "Seated Cable Row",
  "dumbbell-shoulder-press": "Dumbbell Shoulder Press",
  "lateral-raises": "Lateral Raise",
  "cable-tricep-pushdown": "Triceps Pushdown",
  "dumbbell-curl": "Dumbbell Curl",
  "incline-treadmill-walk": "Walking",
  "chest-stretch": "Chest Stretch",
  "lat-stretch": "Lat Stretch",
  "neck-stretch": "Neck Stretch",
  "childs-pose": "Child Pose",
  "leg-swings": "Leg Swing",
  "hip-circles": "Hip Circle",
  "bodyweight-squats": "Bodyweight Squat",
  "glute-bridges": "Glute Bridge",
  "leg-press": "Leg Press",
  "romanian-deadlift": "Romanian Deadlift",
  "walking-lunges": "Walking Lunge",
  "leg-curl": "Leg Curl",
  "leg-extension": "Leg Extension",
  "standing-calf-raises": "Standing Calf Raise",
  "stationary-bike": "Stationary Bike",
  "hamstring-stretch": "Hamstring Stretch",
  "quad-stretch": "Quad Stretch",
  "hip-flexor-stretch": "Hip Flexor Stretch",
  "calf-stretch": "Calf Stretch",
  "steady-cardio": "Walking",
  plank: "Plank",
  "dead-bug": "Dead Bug",
  "bird-dog": "Bird Dog",
  "mobility-flow": "World Greatest Stretch",
  "bench-press": "Barbell Bench Press",
  "incline-press": "Incline Bench Press",
  "shoulder-press": "Shoulder Press",
  "rear-delt-fly": "Rear Delt Fly",
  "tricep-pushdown": "Triceps Pushdown",
  "overhead-rope-extension": "Overhead Triceps Extension",
  "dumbbell-row": "Dumbbell Row",
  "face-pull": "Face Pull",
  "hammer-curl": "Hammer Curl",
  "ez-curl": "EZ Bar Curl",
  "recovery-walk": "Walking",
  "recovery-stretching": "Stretching",
  "recovery-mobility": "Mobility",
};

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function findYuhonas(exercises, id, name) {
  if (YUHONAS_OVERRIDES[id]) {
    return exercises.find((e) => e.id === YUHONAS_OVERRIDES[id]);
  }
  const n = norm(name);
  return (
    exercises.find((e) => norm(e.name) === n) ||
    exercises.find((e) => norm(e.name).includes(n)) ||
    exercises.find((e) => n.split(" ").every((w) => norm(e.name).includes(w)))
  );
}

async function main() {
  const [yuhonas, gifs] = await Promise.all([
    fetch(
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
    ).then((r) => r.json()),
    fetch(
      "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/en/exercises.json"
    ).then((r) => r.json()),
  ]);

  const map = {};

  for (const [id, name] of Object.entries(OUR_NAMES)) {
    let gifUrl = null;
    if (GIF_OVERRIDES[id]) {
      gifUrl = GIF_BASE + GIF_OVERRIDES[id];
    } else {
      const n = norm(name);
      const g =
        gifs.exercises.find((e) => norm(e.name) === n) ||
        gifs.exercises.find((e) => norm(e.name).includes(n));
      gifUrl = g?.gifUrl ?? null;
    }

    const y = findYuhonas(yuhonas, id, name);
    const imageUrls = y?.images?.map((img) => YUHONAS_BASE + img) ?? [];

    map[id] = { gifUrl, imageUrls };
    console.log(
      id,
      gifUrl ? "gif" : "no-gif",
      imageUrls.length ? `${imageUrls.length} imgs` : "no-img"
    );
  }

  const out = `/** Auto-generated + manual overrides — run scripts/build-exercise-media-map.mjs to refresh */\nexport const EXERCISE_MEDIA: Record<string, { gifUrl: string | null; imageUrls: string[] }> = ${JSON.stringify(map, null, 2)};\n`;
  fs.writeFileSync(
    path.join(__dirname, "../src/lib/data/exercise-media-map.ts"),
    out
  );
  console.log("Wrote exercise-media-map.ts");
}

main();
