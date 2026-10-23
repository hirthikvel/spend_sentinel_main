"use client";

import React, { useMemo } from "react";

interface StripeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  toothPitch?: number;
  toothDepth?: number;
}

function generateSerratedStripePath({
  x1,
  y1,
  x2,
  y2,
  width,
  toothPitch = 6,
  toothDepth = 3.5,
}: StripeProps): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) return "";

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;

  const halfW = width / 2;
  const steps = Math.floor(length / toothPitch);

  const points: [number, number][] = [];

  // Side 1: from t = 0 to length
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * length;
    const isOut = i % 2 === 1;
    const offset = halfW + (isOut ? toothDepth : 0);
    const px = x1 + ux * t + nx * offset;
    const py = y1 + uy * t + ny * offset;
    points.push([px, py]);
  }

  // End cap 1 (torn serration)
  for (let j = 0; j <= 4; j++) {
    const frac = j / 4;
    const w = halfW - frac * width;
    const tearOffset = (j % 2 === 1 ? toothDepth : 0);
    const px = x2 + nx * w + ux * tearOffset;
    const py = y2 + ny * w + uy * tearOffset;
    points.push([px, py]);
  }

  // Side 2: from t = length back to 0
  for (let i = steps; i >= 0; i--) {
    const t = (i / steps) * length;
    const isOut = i % 2 === 1;
    const offset = -halfW - (isOut ? toothDepth : 0);
    const px = x1 + ux * t + nx * offset;
    const py = y1 + uy * t + ny * offset;
    points.push([px, py]);
  }

  // End cap 2 (torn serration back to start)
  for (let j = 0; j <= 4; j++) {
    const frac = j / 4;
    const w = -halfW + frac * width;
    const tearOffset = (j % 2 === 1 ? -toothDepth : 0);
    const px = x1 + nx * w + ux * tearOffset;
    const py = y1 + ny * w + uy * tearOffset;
    points.push([px, py]);
  }

  return points.map(([x, y], idx) => `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
}

export function SerratedStripes() {
  const topStripe1 = useMemo(
    () =>
      generateSerratedStripePath({
        x1: 1540,
        y1: -40,
        x2: 1980,
        y2: 400,
        width: 38,
        toothPitch: 7,
        toothDepth: 3.5,
      }),
    []
  );

  const topStripe2 = useMemo(
    () =>
      generateSerratedStripePath({
        x1: 1680,
        y1: -40,
        x2: 1980,
        y2: 260,
        width: 24,
        toothPitch: 6,
        toothDepth: 3,
      }),
    []
  );

  const bottomStripe1 = useMemo(
    () =>
      generateSerratedStripePath({
        x1: -40,
        y1: 860,
        x2: 180,
        y2: 1080,
        width: 28,
        toothPitch: 6,
        toothDepth: 3,
      }),
    []
  );

  const bottomStripe2 = useMemo(
    () =>
      generateSerratedStripePath({
        x1: -40,
        y1: 720,
        x2: 320,
        y2: 1080,
        width: 36,
        toothPitch: 7,
        toothDepth: 3.5,
      }),
    []
  );

  const bottomStripe3 = useMemo(
    () =>
      generateSerratedStripePath({
        x1: -40,
        y1: 960,
        x2: 100,
        y2: 1100,
        width: 18,
        toothPitch: 5,
        toothDepth: 2.5,
      }),
    []
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1920 1080"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="tape-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0d3460" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Top-Right Serrated Masking Tape Stripes */}
        <g filter="url(#tape-shadow)">
          <path d={topStripe1} fill="#ffffff" />
          <path d={topStripe2} fill="#ffffff" />
        </g>

        {/* Serrated edge element protruding near top bar on right edge */}
        <g filter="url(#tape-shadow)">
          <path
            d="M 1730 162 L 1795 162 L 1795 174 L 1791 169 L 1787 174 L 1783 169 L 1779 174 L 1775 169 L 1771 174 L 1767 169 L 1763 174 L 1759 169 L 1755 174 L 1751 169 L 1747 174 L 1743 169 L 1739 174 L 1735 169 L 1730 174 Z"
            fill="#ffffff"
          />
        </g>

        {/* Bottom-Left Serrated Masking Tape Stripes */}
        <g filter="url(#tape-shadow)">
          <path d={bottomStripe1} fill="#ffffff" />
          <path d={bottomStripe2} fill="#ffffff" />
          <path d={bottomStripe3} fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
