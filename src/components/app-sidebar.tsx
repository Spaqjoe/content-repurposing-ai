"use client";

import Link from "next/link";
import {
  Briefcase,
  Camera,
  ClockCounterClockwise,
  FilmStrip,
  MagicWand,
  TextAlignLeft,
} from "@phosphor-icons/react";

export type SidebarMode = "formats" | "filters";

export type PlatformFilter =
  | "all"
  | "instagram"
  | "reels"
  | "linkedin"
  | "tiktok";

interface AppSidebarProps {
  mode?: SidebarMode;
  activeFilter?: PlatformFilter;
  onFilterChange?: (filter: PlatformFilter) => void;
  selectedFormats?: string[];
  onToggleFormat?: (format: string) => void;
}

const FORMAT_ITEMS = [
  { id: "carousel", label: "Instagram", icon: Camera },
  { id: "hooks", label: "Reels", icon: FilmStrip },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
  { id: "thread", label: "TikTok / X", icon: TextAlignLeft },
] as const;

const FILTER_ITEMS: Array<{
  id: PlatformFilter;
  label: string;
  icon: typeof Camera;
}> = [
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "reels", label: "Reels", icon: FilmStrip },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
  { id: "tiktok", label: "TikTok", icon: TextAlignLeft },
];

export function AppSidebar({
  mode = "formats",
  activeFilter = "all",
  onFilterChange,
  selectedFormats = [],
  onToggleFormat,
}: AppSidebarProps) {
  const title = mode === "formats" ? "Output Formats" : "Filters";
  const subtitle = mode === "formats" ? "AI Repurposing" : "Narrow your search";

  return (
    <aside className="fixed top-16 left-0 z-40 hidden h-[calc(100dvh-4rem)] w-64 flex-col gap-2 border-r border-sidebar-border bg-sidebar p-4 md:flex">
      <div className="mb-4 px-3">
        <h2 className="font-display text-xl font-semibold text-sidebar-primary">
          {title}
        </h2>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {mode === "formats"
          ? FORMAT_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = selectedFormats.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleFormat?.(item.id)}
                  className={`btn-press flex items-center gap-3 rounded-none px-3 py-2.5 font-mono text-sm transition-all ${
                    active
                      ? "border-l-4 border-primary bg-accent text-accent-foreground"
                      : "border-l-4 border-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={18} weight={active ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </button>
              );
            })
          : FILTER_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onFilterChange?.(item.id)}
                  className={`btn-press flex items-center gap-3 rounded-none px-3 py-2.5 font-mono text-sm transition-all ${
                    active
                      ? "border-l-4 border-primary bg-accent text-accent-foreground"
                      : "border-l-4 border-transparent text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={18} weight={active ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </button>
              );
            })}

        {mode === "filters" ? (
          <div className="mt-6 space-y-1">
            <p className="px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-outline">
              Time Period
            </p>
            <button
              type="button"
              onClick={() => onFilterChange?.("all")}
              className={`btn-press flex w-full items-center gap-3 rounded-none px-3 py-2.5 font-mono text-sm transition-all ${
                activeFilter === "all"
                  ? "border-l-4 border-primary bg-accent text-accent-foreground"
                  : "border-l-4 border-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              <ClockCounterClockwise size={18} />
              <span>All time</span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-auto p-1">
        <Link
          href="/studio"
          className="btn-press flex w-full items-center justify-center gap-2 rounded-none bg-primary px-3 py-2.5 font-mono text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          <MagicWand size={16} weight="fill" />
          Generate All
        </Link>
      </div>
    </aside>
  );
}
