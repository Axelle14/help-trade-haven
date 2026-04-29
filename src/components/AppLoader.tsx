/**
 * Branded loader shown while lazy routes load and during auth bootstrap.
 * Matches the Capacitor splash background (#f6e8e1) so the visual handoff
 * from native splash → web app has zero flash.
 */
const AppLoader = ({ label }: { label?: string }) => (
  <div className="min-h-safe-screen flex flex-col items-center justify-center bg-background gap-4 px-6">
    <div className="w-14 h-14 rounded-3xl gradient-primary shadow-glow flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-[3px] border-primary-foreground/40 border-t-primary-foreground animate-spin" />
    </div>
    <p className="text-sm font-medium text-muted-foreground">
      {label ?? "Loading…"}
    </p>
  </div>
);

export default AppLoader;
