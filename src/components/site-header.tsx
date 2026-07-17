"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/history", label: "History" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-surface/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 btn-press">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-container text-sm font-bold text-white">
              C
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-accent-soft">
              Content AI
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-mono text-sm transition-colors duration-150 ${
                    active
                      ? "border-b-2 border-accent-soft pb-0.5 font-semibold text-accent-soft"
                      : "text-muted hover:text-accent-soft"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="btn-press hidden rounded-full bg-accent-container px-4 py-2 font-mono text-sm font-semibold text-white transition hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] sm:inline-flex"
          >
            New Project
          </Link>
          <div
            aria-hidden
            className="hidden h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-surface-high sm:block"
          >
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted">
              You
            </div>
          </div>
          <button
            type="button"
            className="btn-press inline-flex items-center justify-center rounded-xl border border-white/10 p-2 text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-surface/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2.5 font-mono text-sm transition-colors ${
                    active
                      ? "bg-accent-container/20 text-accent-soft"
                      : "text-muted hover:bg-surface-high hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/studio"
              onClick={() => setMobileOpen(false)}
              className="btn-press mt-1 rounded-full bg-accent-container px-4 py-2.5 text-center font-mono text-sm font-semibold text-white"
            >
              New Project
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
