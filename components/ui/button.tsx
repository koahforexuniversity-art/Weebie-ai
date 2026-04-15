"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[transform,box-shadow,background,color] duration-200 ease-[var(--ease-forge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-slate-950 shadow-[0_8px_30px_-8px_rgba(168,85,247,0.7)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-10px_rgba(168,85,247,0.9)]",
        secondary:
          "glass text-slate-100 hover:-translate-y-0.5 hover:neon-ring",
        ghost: "text-slate-200 hover:bg-white/5",
        outline:
          "border border-white/15 bg-white/[0.03] text-slate-100 hover:border-fuchsia-400/50",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
