import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PushButton, SerialMonitor } from "@/components/hardware";

export function GateSim() {
  const [distance, setDistance] = useState(80);
  const [angle, setAngle] = useState(180);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [ping, setPing] = useState(0);
  const busyRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPing((p) => p + 1);
      setLog((l) => [...l.slice(-8), `Distance: ${Math.round(distance)} cm`]);
    }, 900);
    return () => clearInterval(id);
  }, [distance]);

  useEffect(() => {
    if (distance > 23 || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setLog((l) => [...l, "Object detected! Closing..."]);
    const t1 = setTimeout(() => setAngle(75), 1000);
    const t2 = setTimeout(() => {
      setLog((l) => [...l, "Reopening..."]);
      setAngle(180);
    }, 8000);
    const t3 = setTimeout(() => {
      busyRef.current = false;
      setBusy(false);
    }, 9000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [distance]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel relative overflow-hidden rounded-lg p-6">
        <div className="pcb-grid absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="relative h-64 overflow-hidden rounded-md border border-border bg-background/60">
            {/* sensor */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <div className="flex gap-1">
                <div className="size-7 rounded-full border-2 border-border bg-secondary" />
                <div className="size-7 rounded-full border-2 border-border bg-secondary" />
              </div>
              <span className="mt-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                HC-SR04
              </span>
            </div>
            {/* ping wave */}
            <AnimatePresence>
              <motion.div
                key={ping}
                initial={{ opacity: 0.7, scaleX: 0, scaleY: 0.2 }}
                animate={{ opacity: 0, scaleX: 1, scaleY: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute left-16 top-1/2 h-32 w-[70%] origin-left -translate-y-1/2 rounded-full border-2 border-signal"
              />
            </AnimatePresence>
            {/* object */}
            <motion.div
              animate={{ left: `${16 + (distance / 100) * 62}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="absolute top-1/2 size-10 -translate-y-1/2 rounded-md border-2 border-solder bg-solder/25"
            />
            {/* gate */}
            <div className="absolute bottom-6 right-16 origin-bottom-left">
              <motion.div
                animate={{ rotate: 180 - angle }}
                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                className="h-2 w-40 origin-left rounded-full bg-gradient-to-r from-danger to-solder"
                style={{ transformOrigin: "0% 50%" }}
              />
              <div className="mt-1 size-4 rounded-full border-2 border-border bg-secondary" />
            </div>
            <div className="absolute bottom-2 right-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              servo {angle}°
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>object distance</span>
              <span className={distance <= 23 ? "text-danger" : "text-signal"}>
                {Math.round(distance)} cm
              </span>
            </label>
            <input
              type="range"
              min={5}
              max={100}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--signal)]"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <PushButton onPress={() => setDistance(12)} tone="danger">
                step into range
              </PushButton>
              <PushButton onPress={() => setDistance(80)} tone="neutral">
                back off
              </PushButton>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {busy ? "gate cycle running" : "idle · threshold 23 cm"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel rounded-lg p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
            time of flight
          </div>
          <div className="mt-3 font-mono text-sm text-muted-foreground">
            duration = <span className="text-foreground">{Math.round((distance * 2) / 0.034)}</span>{" "}
            µs
          </div>
          <div className="font-mono text-sm text-muted-foreground">
            distance = duration × 0.034 / 2 ={" "}
            <span className="text-solder">{Math.round(distance)} cm</span>
          </div>
        </div>
        <SerialMonitor lines={log} />
      </div>
    </div>
  );
}
