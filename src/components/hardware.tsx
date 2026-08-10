import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A 16x2 character LCD, styled like an I2C blue backlight module. */
export function Lcd({ line1, line2 }: { line1: string; line2?: string }) {
  const pad = (s: string) => (s ?? "").slice(0, 16).padEnd(16, " ");
  return (
    <div className="scanlines rounded-md border border-border bg-lcd/90 p-3 shadow-[inset_0_0_30px_rgba(0,0,0,0.45)]">
      <div className="font-mono text-[clamp(0.8rem,2.6vw,1.05rem)] leading-6 tracking-[0.18em] text-lcd-foreground drop-shadow-[0_0_8px_rgba(150,220,255,0.8)]">
        <div className="whitespace-pre">{pad(line1)}</div>
        <div className="whitespace-pre">{pad(line2 ?? "")}</div>
      </div>
    </div>
  );
}

const ledTone: Record<string, string> = {
  red: "oklch(0.63 0.216 22)",
  green: "oklch(0.76 0.19 145)",
  blue: "oklch(0.62 0.19 258)",
  amber: "oklch(0.79 0.156 78)",
  white: "oklch(0.97 0.01 200)",
};

export function Led({
  on,
  color = "red",
  size = 34,
  label,
}: {
  on: boolean;
  color?: keyof typeof ledTone | string;
  size?: number;
  label?: string;
}) {
  const tone = ledTone[color] ?? color;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.span
        animate={{
          scale: on ? 1.06 : 1,
          boxShadow: on
            ? `0 0 ${size * 0.9}px ${size * 0.12}px ${tone}, inset 0 0 10px rgba(255,255,255,0.55)`
            : `0 0 0px 0px transparent, inset 0 -4px 8px rgba(0,0,0,0.6)`,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        style={{
          width: size,
          height: size,
          background: on
            ? `radial-gradient(circle at 32% 28%, white 4%, ${tone} 55%, color-mix(in oklab, ${tone} 55%, black) 100%)`
            : `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${tone} 40%, black) 10%, color-mix(in oklab, ${tone} 18%, black) 100%)`,
        }}
        className="block rounded-full border border-border/70"
      />
      {label ? (
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** RGB common-cathode LED rendered from 0-255 channel values. */
export function RgbLed({ r, g, b }: { r: number; g: number; b: number }) {
  const lit = r + g + b > 20;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  return (
    <motion.span
      animate={{
        boxShadow: lit ? `0 0 44px 8px ${rgb}` : "0 0 0 0 transparent",
      }}
      style={{
        background: lit
          ? `radial-gradient(circle at 32% 28%, white 6%, ${rgb} 62%, rgba(0,0,0,0.7) 100%)`
          : "radial-gradient(circle at 32% 28%, #2a3236 10%, #14181a 100%)",
      }}
      className="block size-11 rounded-full border border-border/70"
    />
  );
}

export function PushButton({
  children,
  onPress,
  tone = "signal",
  disabled,
  className,
}: {
  children: ReactNode;
  onPress: () => void;
  tone?: "signal" | "solder" | "danger" | "neutral";
  disabled?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    signal: "border-signal/60 text-signal shadow-[0_6px_0_-1px_color-mix(in_oklab,var(--signal)_35%,transparent)]",
    solder: "border-solder/60 text-solder shadow-[0_6px_0_-1px_color-mix(in_oklab,var(--solder)_35%,transparent)]",
    danger: "border-danger/60 text-danger shadow-[0_6px_0_-1px_color-mix(in_oklab,var(--danger)_35%,transparent)]",
    neutral: "border-border text-foreground shadow-[0_6px_0_-1px_rgba(0,0,0,0.5)]",
  };
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onPress}
      whileTap={{ y: 5, scale: 0.97 }}
      whileHover={disabled ? { y: 0 } : { y: -2 }}
      className={cn(
        "select-none rounded-md border-2 bg-secondary/70 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] backdrop-blur transition-colors disabled:opacity-40",
        tones[tone],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function Buzzer({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <motion.span
        animate={active ? { scale: [1, 1.14, 1] } : { scale: 1 }}
        transition={{ repeat: active ? Infinity : 0, duration: 0.5 }}
        className={cn(
          "grid size-10 place-items-center rounded-full border-2 border-border bg-secondary",
          active && "border-solder/70 shadow-[0_0_28px_-4px_var(--solder)]",
        )}
      >
        <span className="size-2 rounded-full bg-muted-foreground" />
      </motion.span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {active ? "piezo · on" : "piezo"}
      </span>
    </div>
  );
}

export function PinTag({ pin, label }: { pin: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-secondary/50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      <span className="text-signal">{pin}</span>
      {label}
    </span>
  );
}

export function SerialMonitor({ lines }: { lines: string[] }) {
  return (
    <div className="h-36 overflow-hidden rounded-md border border-border bg-background/80 p-3">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        serial monitor · 9600 baud
      </div>
      <div className="flex flex-col-reverse gap-0.5 overflow-hidden font-mono text-xs text-signal/90">
        {[...lines].reverse().slice(0, 6).map((l, i) => (
          <motion.div
            key={`${l}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1 - i * 0.14, x: 0 }}
          >
            <span className="text-muted-foreground">&gt; </span>
            {l}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
