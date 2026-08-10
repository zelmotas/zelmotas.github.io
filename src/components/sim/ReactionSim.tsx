import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lcd, Led, PushButton, Buzzer, SerialMonitor } from "@/components/hardware";

type Phase = "idle" | "arming" | "hold" | "go" | "result" | "jump";

export function ReactionSim() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const startRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef<number | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  const run = useCallback(() => {
    clearAll();
    setElapsed(0);
    setLit(0);
    setPhase("arming");
    for (let i = 1; i <= 4; i++) {
      timers.current.push(setTimeout(() => setLit(i), i * 700));
    }
    const hold = 2000 + Math.random() * 4000;
    timers.current.push(
      setTimeout(() => setPhase("hold"), 4 * 700),
    );
    timers.current.push(
      setTimeout(() => {
        setLit(0);
        setPhase("go");
        startRef.current = performance.now();
        const tick = () => {
          setElapsed(performance.now() - startRef.current);
          raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
      }, 4 * 700 + hold),
    );
  }, [clearAll]);

  const press = useCallback(() => {
    if (phase === "idle" || phase === "result" || phase === "jump") {
      run();
      return;
    }
    if (phase === "arming" || phase === "hold") {
      clearAll();
      setLit(0);
      setPhase("jump");
      setLog((l) => [...l, "JUMP START — penalty"]);
      return;
    }
    if (phase === "go") {
      clearAll();
      const ms = Math.round(performance.now() - startRef.current);
      setElapsed(ms);
      setPhase("result");
      setBest((b) => (b === null || ms < b ? ms : b));
      setLog((l) => [...l, `Reaction Time: ${ms}`]);
    }
  }, [phase, run, clearAll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        press();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const lines: Record<Phase, [string, string]> = {
    idle: ["F1 Start Lights", "Press to begin"],
    arming: ["Get Ready...", `${lit} of 4 lit`],
    hold: ["Get Ready...", "Wait for it..."],
    go: ["PRESS BUTTON!", `${Math.round(elapsed)} ms`],
    result: ["Reaction Time:", `${Math.round(elapsed)} ms`],
    jump: ["JUMP START!", "Press to retry"],
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel relative overflow-hidden rounded-lg p-6">
        <div className="pcb-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-col items-center gap-8">
          <div className="flex gap-4 sm:gap-6">
            {[0, 1, 2, 3].map((i) => (
              <Led key={i} on={lit > i} color="red" size={54} label={`D${5 - i}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              className="font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl"
            >
              {phase === "go" ? (
                <span className="text-signal">{Math.round(elapsed)} ms</span>
              ) : phase === "result" ? (
                <span className="text-solder">{Math.round(elapsed)} ms</span>
              ) : phase === "jump" ? (
                <span className="text-danger">Jump start</span>
              ) : (
                <span className="text-muted-foreground">
                  {phase === "idle" ? "Ready" : "Hold…"}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
          <PushButton onPress={press} tone={phase === "go" ? "signal" : "neutral"}>
            {phase === "go" ? "Hit it!" : "Push button · D6"}
          </PushButton>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            spacebar works too · best {best === null ? "—" : `${best} ms`}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Lcd line1={lines[phase][0]} line2={lines[phase][1]} />
        <Buzzer active={phase === "go" || phase === "result"} />
        <SerialMonitor lines={log} />
      </div>
    </div>
  );
}
