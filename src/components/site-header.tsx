"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/history", label: "History" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-border bg-background/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="btn-press flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-none bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-accent-foreground">
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
                      ? "border-b-2 border-primary pb-0.5 font-semibold text-primary"
                      : "text-muted-foreground hover:text-primary"
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
            className="btn-press hidden rounded-none bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:inline-flex"
          >
            New Project
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="btn-press inline-flex items-center justify-center rounded-none border border-border p-2 text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-none px-3 py-2.5 font-mono text-sm transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/studio"
              onClick={() => setMobileOpen(false)}
              className="btn-press mt-1 rounded-none bg-primary px-4 py-2.5 text-center font-mono text-sm font-semibold text-primary-foreground"
            >
              New Project
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
