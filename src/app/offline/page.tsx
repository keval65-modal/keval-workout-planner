export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="text-muted-foreground">
        My Fitness Coach works offline. Reopen the app when you have cached content.
      </p>
    </div>
  );
}
