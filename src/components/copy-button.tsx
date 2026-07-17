"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn-press inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-high px-3 py-1.5 font-mono text-xs font-medium text-muted transition hover:border-[color-mix(in_oklch,var(--accent)_40%,transparent)] hover:text-accent-soft ${className}`}
    >
      {copied ? <Check size={14} weight="bold" className="text-secondary" /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}
