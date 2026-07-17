import Link from "next/link";

const highlights = [
  "Turn one source into carousel outlines, hooks, and captions",
  "Choose tone and CTA style for each generation",
  "Copy every output block in one click",
  "Built on Next.js and Cloudflare Workers AI",
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_60%)]" />

      <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:py-28">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-violet-700">
            Creator-focused AI repurposing studio
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            One source. Multiple platform-ready outputs.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
            Content AI helps creators repurpose a single idea into carousel
            outlines, Reel hooks, captions, and more — fast, structured, and
            ready to publish.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              Open Studio
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300"
            >
              View History
            </Link>
          </div>
        </div>

        <div className="grid flex-1 gap-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Core workflow
            </p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
              <li>1. Paste your source content</li>
              <li>2. Select output formats and tone</li>
              <li>3. Generate structured results</li>
              <li>4. Copy and publish anywhere</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
              Built for MLH Fellowship
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              A focused MVP that demonstrates real product thinking, clean
              engineering, and a foundation for a larger content repurposing
              platform.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
