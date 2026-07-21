import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "primary" | "secondary" | "quiet";
};

const intentClasses = {
  primary: "bg-cyan-300 text-slate-950 shadow-[0_12px_32px_rgba(34,211,238,0.2)] hover:bg-cyan-200",
  secondary: "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10",
  quiet: "text-slate-300 hover:bg-white/5 hover:text-white",
};

export function Button({ className, intent = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50",
        intentClasses[intent],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
