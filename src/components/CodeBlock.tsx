import { useState } from "react";
import { motion } from "motion/react";

export function CodeBlock({ code, file }: { code: string; file: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\s+$/, "").split("\n");

  const highlight = (line: string) => {
    if (line.trim().startsWith("//")) return "text-muted-foreground/70 italic";
    if (line.trim().startsWith("#")) return "text-solder";
    return "text-foreground/90";
  };

  return (
    <div className="panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground">{file}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal transition-opacity hover:opacity-70"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div className="max-h-[560px] overflow-auto">
        <pre className="min-w-full p-4 font-mono text-[12px] leading-[1.7]">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: Math.min(i, 30) * 0.008 }}
              className="flex gap-4"
            >
              <span className="w-8 shrink-0 select-none text-right text-muted-foreground/40">
                {i + 1}
              </span>
              <code className={`whitespace-pre ${highlight(l)}`}>{l || " "}</code>
            </motion.div>
          ))}
        </pre>
      </div>
    </div>
  );
}
