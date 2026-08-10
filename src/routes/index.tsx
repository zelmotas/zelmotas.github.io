import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { projects, REPO_URL } from "@/data/projects";
import { ReactionSim } from "@/components/sim/ReactionSim";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arduino Lab — Zayd El Motassadeq" },
      {
        name: "description",
        content:
          "Five Arduino builds you can actually play with in the browser: F1 reaction game, blitz chess timer, birthday countdown, PIR desk alarm and an ultrasonic servo gate.",
      },
      { property: "og:title", content: "Arduino Lab — Zayd El Motassadeq" },
      {
        property: "og:description",
        content:
          "Interactive simulations of five C/C++ Arduino projects, wired straight from the source sketches.",
      },
    ],
  }),
  component: Index,
});

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, 180]), {
    stiffness: 80,
    damping: 20,
  });
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const title = "ARDUINO";

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="pcb-grid absolute inset-0 opacity-60" />
      <motion.svg
        className="absolute inset-0 size-full opacity-50"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        {[120, 260, 420, 560, 700].map((yy, i) => (
          <path
            key={yy}
            d={`M -40 ${yy} H ${300 + i * 90} L ${380 + i * 90} ${yy + (i % 2 ? 90 : -90)} H 1240`}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="1.2"
            className="animate-trace"
            style={{ animationDelay: `${i * 1.3}s` }}
          />
        ))}
      </motion.svg>
      <motion.div
        style={{ y, opacity: fade }}
        className="relative mx-auto max-w-6xl px-5 pb-24 pt-24 sm:pt-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 inline-flex items-center gap-3 rounded-full border border-signal/40 bg-signal/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-signal"
        >
          <span className="size-1.5 animate-pulse-glow rounded-full bg-signal" />
          5 builds · C / C++ · live in-browser
        </motion.div>

        <h1 className="font-display text-[clamp(3rem,13vw,10rem)] font-bold leading-[0.85] tracking-tighter">
          <span className="flex flex-wrap">
            {title.split("").map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 90, rotateX: -70 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 140, damping: 16 }}
                className="inline-block"
              >
                {c}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="block text-signal-gradient"
          >
            LABORATORY
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Hardware-driven mini-projects by{" "}
          <span className="text-foreground">Zayd El Motassadeq</span> — timing, sensors and
          microcontroller-to-software bridges. Every sketch below is re-implemented as a live
          simulation you can drive with your own hands.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <a
            href="#projects"
            className="group relative overflow-hidden rounded-md border border-signal/60 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-signal"
          >
            <span className="relative z-10 transition-colors group-hover:text-primary-foreground">
              Open the bench
            </span>
            <span className="absolute inset-0 -translate-x-full bg-signal transition-transform duration-400 group-hover:translate-x-0" />
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-solder/60 hover:text-solder"
          >
            Source on GitHub
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProjectCard({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const tone =
    p.accent === "danger" ? "var(--danger)" : p.accent === "solder" ? "var(--solder)" : "var(--signal)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay: (i % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/projects/$slug"
        params={{ slug: p.slug }}
        className="hover-lift panel group relative block overflow-hidden rounded-lg p-7"
      >
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }}
        />
        <motion.div
          className="absolute -right-10 -top-10 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
          style={{ background: tone }}
        />
        <div className="relative">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] tracking-[0.3em]" style={{ color: tone }}>
              {p.index}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {p.file}
            </span>
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl">
            {p.title}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {p.tagline}
          </p>
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {p.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {p.hardware.slice(0, 3).map((h) => (
              <span
                key={h}
                className="rounded-sm border border-border bg-secondary/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {h}
              </span>
            ))}
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-signal">
            Run simulation
            <motion.span
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              →
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function Index() {
  return (
    <>
      <Hero />

      <section className="relative border-y border-border/60 bg-card/30 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Arduino Uno / Nano</span>
          <span>PIR · HC-SR04 · Servo</span>
          <span>I2C LCD · Piezo</span>
          <span>Python serial bridge</span>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-2xl"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-signal">
            index
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-6xl">
            The build log
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each entry links to the original sketch, the pinout, and a browser simulation that
            mirrors the firmware&apos;s real state machine.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/20 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-solder">
                try it right here
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Lights out. React.
              </h2>
            </div>
            <Link
              to="/projects/$slug"
              params={{ slug: "f1-reaction-time" }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal hover:opacity-70"
            >
              Full project →
            </Link>
          </motion.div>
          <ReactionSim />
        </div>
      </section>
    </>
  );
}
