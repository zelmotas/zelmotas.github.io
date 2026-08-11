import { Suspense, lazy, useEffect, useState } from "react";
import type { RigState } from "./scene";

const Scene = lazy(() => import("./scene"));

export function Bench3D({ state }: { state: RigState }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="panel relative overflow-hidden rounded-lg">
      <div className="pcb-grid absolute inset-0 opacity-30" />
      <div className="relative h-[380px] w-full sm:h-[460px]">
        {mounted ? (
          <Suspense fallback={<Loading />}>
            <Scene state={state} />
          </Suspense>
        ) : (
          <Loading />
        )}
      </div>
      <div className="relative flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span>3d bench · drag to orbit · scroll to zoom</span>
        <span className="text-signal">click the hardware</span>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid h-full place-items-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      booting 3d bench…
    </div>
  );
}
