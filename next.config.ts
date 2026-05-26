import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/JahelCuadrado\/ExerciseGymGifsDB/,
        handler: "CacheFirst",
        options: {
          cacheName: "exercise-gifs",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/raw\.githubusercontent\.com\/yuhonas\/free-exercise-db/,
        handler: "CacheFirst",
        options: {
          cacheName: "exercise-photos",
          expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
