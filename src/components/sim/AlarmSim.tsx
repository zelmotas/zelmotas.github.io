import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lcd, PushButton, RgbLed, Buzzer, SerialMonitor } from "@/components/hardware";

type State = "DISARMED" | "ARMING" | "ARMED" | "ALARM";
const CODE = [4, 2, 7];

export function AlarmSim() {
  const [state, setState] = useState<State>("DISARMED");
  const [countdown, setCountdown] = useState(10);
  const [pot, setPot] = useState(0);
  const [entered, setEntered] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [motionPing, setMotionPing] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state !== "ARMING") return;
    setCountdown(10);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setState("ARMED");
          setLog((l) => [...l, "SYSTEM ARMED"]);
          return 0;
        }
        return c - 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [state]);

  const trip = () => {
    setMotionPing(true);
    setTimeout(() => setMotionPing(false), 900);
    if (stateRef.current === "ARMED") {
      setState("ALARM");
      setLog((l) => [...l, "MOTION! -> python push alert"]);
    } else {
      setLog((l) => [...l, "motion (system idle)"]);
    }
  };

  const arm = () => {
    if (state === "DISARMED") {
      setState("ARMING");
      setEntered([]);
      setLog((l) => [...l, "Arming, exit now..."]);
    }
  };

  const select = () => {
    if (state === "DISARMED") return;
    const next = [...entered, pot];
    if (next.length === 3) {
      if (next.every((d, i) => d === CODE[i])) {
        setState("DISARMED");
        setLog((l) => [...l, "CODE ACCEPTED · disarmed"]);
      } else {
        setLog((l) => [...l, "WRONG CODE"]);
      }
      setEntered([]);
    } else {
      setEntered(next);
    }
  };

  const rgb =
    state === "DISARMED"
      ? { r: 0, g: 255, b: 0 }
      : state === "ARMING"
        ? { r: 255, g: 160, b: 0 }
        : state === "ARMED"
          ? { r: 0, g: 0, b: 255 }
          : { r: 255, g: 0, b: 0 };

  const lcd: [string, string] =
    state === "DISARMED"
      ? ["System Disarmed", "D4 to arm"]
      : state === "ARMING"
        ? ["Arming in...", `${countdown} sec`]
        : state === "ARMED"
          ? ["ARMED - watching", `Code: ${entered.join("")}${"_".repeat(3 - entered.length)}`]
          : ["!! INTRUDER !!", `Code: ${entered.join("")}${"_".repeat(3 - entered.length)}`];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.div
        animate={
          state === "ALARM"
            ? { boxShadow: ["0 0 0 0 transparent", "0 0 60px -10px var(--danger)", "0 0 0 0 transparent"] }
            : { boxShadow: "0 0 0 0 transparent" }
        }
        transition={{ repeat: state === "ALARM" ? Infinity : 0, duration: 1 }}
        className="panel relative overflow-hidden rounded-lg p-6"
      >
        <div className="pcb-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-col items-center gap-6">
          {/* PIR detection cone */}
          <div className="relative grid h-52 w-full place-items-end overflow-hidden rounded-md border border-border bg-background/60">
            <motion.div
              animate={{ opacity: state === "ARMED" || state === "ALARM" ? [0.18, 0.4, 0.18] : 0.08 }}
              transition={{ repeat: Infinity, duration: 2.4 }}
              className="absolute bottom-0 left-1/2 h-48 w-64 -translate-x-1/2"
              style={{
                background:
                  "conic-gradient(from 200deg at 50% 100%, transparent 0deg, var(--signal) 20deg, transparent 40deg)",
                clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
              }}
            />
            <AnimatePresence>
              {motionPing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.6 }}
                  className="absolute left-1/2 top-8 size-16 -translate-x-1/2 rounded-full border-2 border-danger"
                />
              )}
            </AnimatePresence>
            <div className="relative mb-3 grid w-full place-items-center">
              <div className="mb-2 size-8 rounded-full border-2 border-border bg-secondary" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                PIR · D2
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <PushButton onPress={arm} tone="solder">
              arm · D4
            </PushButton>
            <PushButton onPress={select} tone="signal">
              select · D5
            </PushButton>
            <PushButton onPress={trip} tone="danger">
              walk past sensor
            </PushButton>
            <RgbLed {...rgb} />
          </div>

          <div className="w-full">
            <label className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>potentiometer · A0</span>
              <span className="text-signal">digit {pot}</span>
            </label>
            <input
              type="range"
              min={0}
              max={9}
              value={pot}
              onChange={(e) => setPot(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--signal)]"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              dial each digit, press select · secret code 4-2-7
            </p>
          </div>
        </div>
      </motion.div>
      <div className="flex flex-col gap-4">
        <Lcd line1={lcd[0]} line2={lcd[1]} />
        <Buzzer active={state === "ALARM" || state === "ARMING"} />
        <SerialMonitor lines={log} />
      </div>
    </div>
  );
}
