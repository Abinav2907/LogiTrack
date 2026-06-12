"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: string;
  size?: string;
}

const Button = ({
  children,
  className = "",
  type = "button",
  variant,
  size,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`
        bg-[#7F1D1D]
        hover:bg-[#991B1B]
        active:scale-95
        disabled:cursor-not-allowed
        disabled:bg-[#4C1D1D]
        transition-all
        duration-150
        px-4
        py-2
        rounded-2xl
        text-white
        font-medium
        cursor-pointer
        shadow-lg
        shadow-black/30
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
