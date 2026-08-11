import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lcd, PushButton, RgbLed, Buzzer } from "@/components/hardware";
import { Bench3D } from "@/components/three/Bench3D";

export function BirthdaySim() {
  const [timer, setTimer] = useState(0);
  const [initial, setInitial] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const lastClick = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setRunning(false);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const click = () => {
    const now = Date.now();
    if (done) {
      setDone(false);
      setTimer(0);
      setInitial(0);
      lastClick.current = now;
      return;
    }
    if (running) return;
    if (now - lastClick.current < 400 && timer > 0) {
      setInitial(timer);
      setRunning(true);
    } else {
      setTimer((t) => t + 5);
    }
    lastClick.current = now;
  };

  const progress = initial > 0 ? timer / initial : 1;
  const r = Math.round(255 * (1 - progress));
  const g = Math.round(255 * progress);
  const b = done ? 200 : 0;

  const lcd: [string, string] = done
    ? ["HAPPY BIRTHDAY!", "  Click = reset"]
    : running
      ? ["Counting down...", `${timer} Secs   `]
      : ["Set Time:", `${timer} Secs  `];

  return (
    <div className="grid gap-6">
      <Bench3D
        state={{ kind: "birthday", lcd, rgb: { r, g, b }, buzzer: done, onButton: click }}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel relative overflow-hidden rounded-lg p-6">
          <div className="pcb-grid absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center gap-6">
          <div className="relative grid size-56 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute size-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="3" />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={done ? "var(--solder)" : "var(--signal)"}
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={1}
                animate={{ pathLength: progress }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
              />
            </svg>
            <AnimatePresence mode="wait">
              <motion.div
                key={done ? "done" : timer}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.15 }}
                className="font-display text-6xl font-bold tabular-nums"
              >
                {done ? "🎂" : timer}
              </motion.div>
            </AnimatePresence>
          </div>
          <PushButton onPress={click} tone="solder">
            button · D2
          </PushButton>
          <p className="max-w-xs text-center font-mono text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">
            single click adds 5s · double click within 400ms arms the countdown
          </p>
          <RgbLed r={r} g={g} b={b} />
        </div>
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              {Array.from({ length: 26 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 420, opacity: [0, 1, 1, 0], rotate: 360 * (i % 3) }}
                  transition={{ duration: 2.6 + (i % 5) * 0.4, repeat: Infinity, delay: i * 0.09 }}
                  className="absolute top-0 block size-2 rounded-[1px]"
                  style={{
                    left: `${(i * 3.8) % 100}%`,
                    background: ["var(--signal)", "var(--solder)", "var(--danger)"][i % 3],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        <div className="flex flex-col gap-4">
          <Lcd line1={lcd[0]} line2={lcd[1]} />
          <Buzzer active={done} />
          <div className="panel rounded-lg p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            <span className="text-signal">setColor()</span> interpolates the RGB LED from green to
            red across the countdown, and <span className="text-signal">playHappyBirthday()</span>{" "}
            drives the piezo once the timer hits zero.
          </div>
        </div>
      </div>
    </div>
  );
}
