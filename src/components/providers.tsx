"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import {
  loadReminders,
  requestNotificationPermission,
  scheduleLocalReminders,
} from "@/lib/notifications";
import { getSettings } from "@/lib/db/database";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getSettings().catch(() => {});
    const init = async () => {
      const settings = await getSettings();
      if (settings.notificationsEnabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
          scheduleLocalReminders(loadReminders());
        }
      }
    };
    init();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
