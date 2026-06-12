"use client";

import React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-[#7F1D1D] text-white hover:bg-[#991B1B]",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline:
    "bg-transparent border border-neutral-700 text-white hover:bg-white/10",
  ghost: "bg-transparent text-white hover:bg-white/10",
  icon: "bg-transparent text-white hover:bg-white/10 p-0",
} as const;

const buttonSizes = {
  default: "min-w-[96px] px-4 py-2 text-sm",
  sm: "min-w-[96px] px-3 py-1.5 text-xs",
  lg: "px-5 py-3 text-base",
  icon: "h-10 w-10",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      type = "button",
      variant = "default",
      size = "default",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-70",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
