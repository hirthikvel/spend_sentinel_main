"use client";

import React from "react";

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  colorClass: string;
  barColor: string;
} {
  if (!password) {
    return {
      score: 0,
      label: "12 CHARACTERS OR MORE RECOMMENDED",
      colorClass: "text-neutral-400",
      barColor: "bg-neutral-200",
    };
  }

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) points += 1;
  if (password.length >= 12 && points < 4) points += 1;

  const score = Math.min(4, Math.max(1, points));

  switch (score) {
    case 1:
      return {
        score: 1,
        label: "WEAK • TOO SHORT OR SIMPLE",
        colorClass: "text-rose-500",
        barColor: "bg-rose-500",
      };
    case 2:
      return {
        score: 2,
        label: "FAIR • ADD UPPERCASE & NUMBERS",
        colorClass: "text-amber-500",
        barColor: "bg-amber-400",
      };
    case 3:
      return {
        score: 3,
        label: "GOOD • 12+ CHARS RECOMMENDED",
        colorClass: "text-blue-500",
        barColor: "bg-blue-500",
      };
    case 4:
      return {
        score: 4,
        label: "STRONG • EXCELLENT PASSWORD",
        colorClass: "text-emerald-500",
        barColor: "bg-emerald-500",
      };
    default:
      return {
        score: 0,
        label: "12 CHARACTERS OR MORE RECOMMENDED",
        colorClass: "text-neutral-400",
        barColor: "bg-neutral-200",
      };
  }
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { score, label, colorClass, barColor } = getPasswordStrength(password);

  return (
    <div className="space-y-1.5 pt-1 select-none">
      <div className="flex space-x-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => {
          const isActive = index < score;
          return (
            <div
              key={index}
              className={`w-1/4 h-full rounded-full transition-all duration-200 ${
                isActive ? barColor : "bg-neutral-200"
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
        <span className={`transition-colors duration-200 ${colorClass}`}>
          {label}
        </span>
        {password.length > 0 && (
          <span className="text-neutral-400 font-mono">
            {password.length} char{password.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}
