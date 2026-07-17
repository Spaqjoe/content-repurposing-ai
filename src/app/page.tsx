import Link from "next/link";
import {
  Lightning,
  MagicWand,
  Export,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

const PLATFORMS = ["TikTok Scripts", "LinkedIn Carousels", "Newsletter Summaries"];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col justify-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <Reveal className="max-w-xl flex-1">
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.02em] text-balance text-foreground md:text-5xl lg:text-6xl">
            Repurpose with Purpose.
          </h1>
          <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-muted-foreground text-pretty">
            AI outlines, hooks, and captions for Instagram, LinkedIn, and X.
            Built for creators who ship.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="btn-press inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-3.5 font-display text-base font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Start Generating
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              href="/history"
              className="btn-press glass-panel inline-flex items-center justify-center rounded-none px-7 py-3.5 font-display text-base font-semibold text-foreground transition hover:bg-accent"
            >
              View History
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="flex-1">
          <div className="glass-panel relative overflow-hidden rounded-none p-1">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-ring to-primary" />
            <div className="rounded-none border border-border bg-background p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-mono text-xs text-muted-foreground">Studio Output</p>
                <span className="rounded-none border border-[color-mix(in_oklch,var(--primary)_30%,transparent)] bg-[color-mix(in_oklch,var(--primary)_12%,transparent)] px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
                  Ready
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-none border-l-4 border-primary bg-card px-4 py-3">
                  <p className="font-mono text-[11px] text-primary">01 Hook</p>
                  <p className="mt-1 text-sm text-foreground">
                    Stop spending Sundays on repurposing. One source, five formats.
                  </p>
                </div>
                <div className="rounded-none border-l-4 border-primary/50 bg-card px-4 py-3">
                  <p className="font-mono text-[11px] text-primary">02 Caption</p>
                  <p className="mt-1 text-sm text-foreground">
                    Content creation is evolving. AI-empowered humans win.
                  </p>
                </div>
                <div className="rounded-none border-l-4 border-border bg-card px-4 py-3">
                  <p className="font-mono text-[11px] text-muted-foreground">03 Thread</p>
                  <p className="mt-1 text-sm text-foreground">
                    Efficiency is the new scale. Treat every platform as a new lens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Features bento */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built for high-velocity output
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Turn one piece of content into a platform-ready ecosystem.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <Reveal className="md:col-span-8" delay={0.04}>
            <div className="glass-panel group flex h-full flex-col justify-between rounded-none p-6 transition hover:border-[color-mix(in_oklch,var(--primary)_30%,transparent)] sm:p-8">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-[color-mix(in_oklch,var(--primary)_12%,transparent)] text-primary transition group-hover:bg-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                  <MagicWand size={22} weight="fill" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Multi-format magic
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  Adapt long-form video or text into platform-specific hooks,
                  LinkedIn posts, and high-engagement X threads in seconds.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {PLATFORMS.map((label) => (
                  <span
                    key={label}
                    className="rounded-none border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-primary"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-4" delay={0.08}>
            <div className="glass-panel group h-full rounded-none p-6 transition hover:border-[color-mix(in_oklch,var(--accent)_30%,transparent)] sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-primary/15 text-accent-soft transition group-hover:bg-primary/25">
                <Lightning size={22} weight="fill" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Creator-first workflows
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Save presets for your brand voice. Built for people who actually
                make stuff.
              </p>
              <ul className="mt-6 space-y-2 border-t border-border pt-6">
                <li className="flex items-center gap-2 font-mono text-xs text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
                  Custom tone profiling
                </li>
                <li className="flex items-center gap-2 font-mono text-xs text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
                  One-click export
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal className="md:col-span-12" delay={0.1}>
            <div className="glass-panel group flex flex-col items-start gap-8 overflow-hidden rounded-none p-6 transition hover:border-border sm:flex-row sm:items-center sm:p-8">
              <div className="flex-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-primary/15 text-accent-soft">
                  <Export size={22} weight="fill" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Production-ready output
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                  Export formatted copy ready for your scheduler or editor.
                  Works with the tools you already use.
                </p>
              </div>
              <div className="flex w-full shrink-0 gap-3 sm:w-auto sm:flex-col">
                {["Instagram", "LinkedIn", "X"].map((name) => (
                  <span
                    key={name}
                    className="rounded-none border border-border bg-surface px-4 py-3 font-mono text-xs text-muted-foreground transition group-hover:text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-y border-border bg-surface py-20 lg:py-28">
        <Reveal className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Ready to scale your reach?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Open the studio and turn your next idea into platform-ready content.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="btn-press inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 font-display text-base font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              href="/history"
              className="btn-press glass-panel inline-flex items-center justify-center rounded-none px-7 py-3.5 font-display text-base font-semibold text-foreground transition hover:bg-accent"
            >
              Browse History
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <p className="font-mono text-sm font-semibold text-foreground">
            Content AI
          </p>
          <p className="font-mono text-xs text-outline">Built for Creators</p>
        </div>
        <div className="flex gap-6">
          <Link
            href="/studio"
            className="font-mono text-xs text-outline transition hover:text-accent-soft"
          >
            Studio
          </Link>
          <Link
            href="/history"
            className="font-mono text-xs text-outline transition hover:text-accent-soft"
          >
            History
          </Link>
        </div>
      </footer>
    </div>
  );
}
