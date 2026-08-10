import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { getProject, projects, REPO_URL } from "@/data/projects";
import { sketches } from "@/data/sketches";
import { SimulationFor } from "@/components/sim/SimulationFor";
import { CodeBlock } from "@/components/CodeBlock";
import { PinTag } from "@/components/hardware";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Project unavailable — Arduino Lab" }, { name: "robots", content: "noindex" }],
      };
    }
    const { project } = loaderData;
    const title = `${project.title} — Arduino Lab`;
    return {
      meta: [
        { title },
        { name: "description", content: project.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: project.summary.slice(0, 155) },
      ],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length]!;
  const tone =
    project.accent === "danger"
      ? "var(--danger)"
      : project.accent === "solder"
        ? "var(--solder)"
        : "var(--signal)";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pcb-grid absolute inset-0 opacity-50" />
        <motion.div
          className="absolute -left-24 top-0 size-96 rounded-full opacity-20 blur-[120px]"
          style={{ background: tone }}
          animate={{ opacity: [0.12, 0.26, 0.12] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <Link
            to="/"
            hash="projects"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-signal"
          >
            ← Build log
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <span className="font-mono text-sm tracking-[0.3em]" style={{ color: tone }}>
              {project.index}
            </span>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[0.92] tracking-tighter">
              {project.title}
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {project.tagline}
            </p>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {project.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.pins.map((p: { pin: string; label: string }) => (
                <PinTag key={p.pin} pin={p.pin} label={p.label} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-signal">
              live simulation
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Drive the hardware
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            emulated from {project.file}
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SimulationFor slug={project.slug} />
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 md:grid-cols-2">
        {[
          { label: "Hardware", items: project.hardware },
          { label: "Key concepts", items: project.concepts },
        ].map((block) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="panel rounded-lg p-6"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              {block.label}
            </span>
            <ul className="mt-4 space-y-2">
              {block.items.map((h: string) => (
                <li key={h} className="flex items-center gap-3 text-sm">
                  <span className="size-1.5 rounded-full" style={{ background: tone }} />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight">The firmware</h2>
          <a
            href={`${REPO_URL}/blob/main/${project.folder}/${project.file}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal hover:opacity-70"
          >
            View on GitHub →
          </a>
        </div>
        <CodeBlock code={sketches[project.sketchKey] ?? ""} file={project.file} />
      </section>

      <section className="border-t border-border/60">
        <Link
          to="/projects/$slug"
          params={{ slug: next.slug }}
          className="group mx-auto flex max-w-6xl flex-col gap-2 px-5 py-14 transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            next build · {next.index}
          </span>
          <span className="font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-signal sm:text-5xl">
            {next.title}
          </span>
        </Link>
      </section>
    </div>
  );
}
