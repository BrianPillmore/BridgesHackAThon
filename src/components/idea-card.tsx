import { ArrowUpRight } from "lucide-react";

import type { ShortlistedIdea } from "@/content/idea-shortlist";
import { formatScore } from "@/lib/utils";

export function IdeaCard({ idea }: { idea: ShortlistedIdea }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.065]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {idea.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{idea.name}</h3>
        </div>
        <span
          className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200"
          aria-label={`Hackathon fit score ${formatScore(idea.score)}`}
        >
          {idea.score}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{idea.promise}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        <span className="font-semibold text-slate-200">One-hour slice:</span> {idea.mvp}
      </p>
      <a
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-cyan-200 outline-none transition hover:text-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-300"
        href={`/brainstorm/${idea.slug}/README.md`}
      >
        Read the idea brief <ArrowUpRight aria-hidden="true" size={16} />
      </a>
    </article>
  );
}
