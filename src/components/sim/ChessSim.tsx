import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Lcd, PushButton, RgbLed, Buzzer } from "@/components/hardware";

type State = "SETUP" | "READY" | "P1" | "P2" | "OVER";
const modes = [60, 180, 300, 600];

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.max(0, t % 60)).padStart(2, "0")}`;

export function ChessSim() {
  const [state, setState] = useState<State>("SETUP");
  const [modeIdx, setModeIdx] = useState(0);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [winner, setWinner] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state !== "P1" && state !== "P2") return;
    const id = setInterval(() => {
      if (stateRef.current === "P1") {
        setP1((t) => {
          if (t <= 1) {
            setState("OVER");
            setWinner(2);
            return 0;
          }
          return t - 1;
        });
      } else {
        setP2((t) => {
          if (t <= 1) {
            setState("OVER");
            setWinner(1);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  const btn1 = () => {
    if (state === "SETUP") setModeIdx((i) => (i + 1) % 4);
    else if (state === "READY") setState("P2");
    else if (state === "P1") setState("P2");
    else if (state === "OVER") setState("SETUP");
  };
  const btn2 = () => {
    if (state === "SETUP") {
      setP1(modes[modeIdx]!);
      setP2(modes[modeIdx]!);
      setState("READY");
    } else if (state === "READY") setState("P1");
    else if (state === "P2") setState("P1");
    else if (state === "OVER") setState("SETUP");
  };

  const rgb =
    state === "SETUP" || state === "OVER"
      ? { r: 255, g: 255, b: 255 }
      : state === "READY"
        ? { r: 0, g: 255, b: 0 }
        : state === "P1"
          ? { r: 255, g: 0, b: 0 }
          : { r: 0, g: 0, b: 255 };

  const lcd: [string, string] =
    state === "SETUP"
      ? ["P1:Cycle P2:Pick", `Time: ${modes[modeIdx]! / 60} min`]
      : state === "OVER"
        ? ["   GAME OVER", `  Player ${winner} wins`]
        : [`Player 1: ${fmt(p1)}`, `Player 2: ${fmt(p2)}`];

  const Clock = ({
    label,
    time,
    active,
    tone,
  }: {
    label: string;
    time: number;
    active: boolean;
    tone: string;
  }) => (
    <motion.div
      animate={{
        scale: active ? 1.03 : 1,
        borderColor: active ? tone : "var(--border)",
      }}
      className="relative overflow-hidden rounded-lg border-2 bg-secondary/40 p-6 text-center"
    >
      <motion.div
        animate={{ opacity: active ? [0.15, 0.35, 0.15] : 0 }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0"
        style={{ background: tone }}
      />
      <div className="relative font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
      <div
        className="relative font-display text-5xl font-bold tabular-nums sm:text-6xl"
        style={{ color: active ? tone : undefined }}
      >
        {fmt(time)}
      </div>
    </motion.div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel relative overflow-hidden rounded-lg p-6">
        <div className="pcb-grid absolute inset-0 opacity-40" />
        <div className="relative grid gap-4">
          <Clock label="Player 1 · red" time={p1} active={state === "P1"} tone="oklch(0.63 0.216 22)" />
          <Clock label="Player 2 · blue" time={p2} active={state === "P2"} tone="oklch(0.62 0.19 258)" />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <PushButton onPress={btn1} tone="danger">
              btn1 · D5
            </PushButton>
            <RgbLed {...rgb} />
            <PushButton onPress={btn2} tone="signal">
              btn2 · D4
            </PushButton>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Lcd line1={lcd[0]} line2={lcd[1]} />
        <div className="panel rounded-lg p-4 font-mono text-xs text-muted-foreground">
          <div className="mb-2 uppercase tracking-[0.3em] text-signal">state</div>
          <div className="text-2xl text-foreground">{state}</div>
          <p className="mt-3 leading-relaxed">
            SETUP: btn1 cycles 1/3/5/10 min, btn2 confirms. READY: either button starts the
            opponent&apos;s clock. Pressing your own button hands the move over.
          </p>
        </div>
        <Buzzer active={state === "OVER"} />
      </div>
    </div>
  );
}
