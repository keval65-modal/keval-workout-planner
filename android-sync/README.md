# My Fitness Coach Sync (Android)

This is a tiny **Android companion app** that reads **Health Connect** data locally and exports a JSON file that the My Fitness Coach PWA can import.

## What it exports

- **Workouts** (Exercise sessions)
- **Heart rate samples** during workouts (avg/max + optional series)
- **Active calories**
- **Steps** (per-workout + daily totals)

## Requirements

- Android Studio (recommended)
- Health Connect installed on the phone
- Health Connect permissions granted to this app

## Run

1. Open `android-sync/` in Android Studio.
2. Sync Gradle, then Run.
3. Tap **Grant Health Connect access**.
4. Tap **Export JSON**.
5. In the PWA: **Settings → Health Connect sync → Import**.

## Notes

- This keeps My Fitness Coach **offline + single user**. No cloud accounts are added to our app.
- If you use Strava → Google Fit → Health Connect, your workouts should appear in Health Connect and will export.

