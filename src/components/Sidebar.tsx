"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  currentMenu?: string;
  onSelectMenu?: (menu: string) => void;
}

const MENU_ITEMS = [
  "DASHBOARD",
  "ANOMALIES",
  "SAVINGS",
  "ASK",
  "UPLOAD",
  "SETTINGS",
];

export function Sidebar({
  currentMenu = "DASHBOARD",
  onSelectMenu,
}: SidebarProps) {
  const router = useRouter();

  const handleMenuClick = (item: string) => {
    if (onSelectMenu) {
      onSelectMenu(item);
    }
    if (item === "DASHBOARD") {
      router.push("/dashboard");
    } else if (item === "ANOMALIES") {
      router.push("/anomalies/oct-15");
    } else if (item === "UPLOAD") {
      router.push("/upload");
    } else if (item === "SAVINGS") {
      router.push("/dashboard");
    } else if (item === "ASK") {
      // Dispatches open search event for Ctrl+K
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
      );
    } else if (item === "SETTINGS") {
      router.push("/create-organization");
    }
  };

  return (
    <aside className="w-[232px] 2xl:w-[260px] shrink-0 panel-card bg-white flex flex-col justify-between py-5 px-4 2xl:px-5 z-20 select-none relative h-full">
      {/* Top Header & Brand */}
      <div>
        <div className="mb-6 2xl:mb-8 pt-0.5">
          <h1 className="text-2xl 2xl:text-[28px] font-black tracking-tight text-black uppercase leading-none font-sans">
            SPENDSENTINEL
          </h1>
          <p className="text-xs 2xl:text-sm font-black tracking-wider text-black uppercase mt-1 font-sans">
            NORTHWIND LABS
          </p>
        </div>

        {/* Six Menu Items - Large Burbank Condensed Font filling container, 100% full-width hit targets */}
        <nav className="flex flex-col space-y-1.5 2xl:space-y-2 -mx-4 2xl:-mx-5">
          {MENU_ITEMS.map((item) => {
            const isSelected = item === currentMenu;
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleMenuClick(item)}
                className={`w-full text-left py-2.5 2xl:py-3.5 px-5 flex items-center justify-between relative cursor-pointer select-none transition-all duration-100 font-sans group ${
                  isSelected
                    ? "bg-[#f0f4f9] text-[#1f5ea5]"
                    : "text-black hover:bg-neutral-100/80 hover:text-[#1f5ea5]"
                }`}
              >
                {/* Left blue active marker */}
                {isSelected && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1f5ea5]" />
                )}

                {/* Bold, Utilitarian Burbank Text - Filling the menu row */}
                <span className="font-black text-xl 2xl:text-[24px] uppercase tracking-wide leading-none">
                  {item}
                </span>

                {/* Right tab notch for active state */}
                {isSelected && (
                  <span
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[8px] border-l-[#cbd5e1]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Avatar Box */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => {
            router.push("/signin");
          }}
          className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-sm border-2 border-neutral-300 bg-neutral-100 flex items-center justify-center font-black text-sm 2xl:text-base text-neutral-800 shadow-xs cursor-pointer hover:border-black hover:bg-neutral-200 transition-colors font-sans"
          title="Sign Out (M)"
        >
          M
        </button>
      </div>
    </aside>
  );
}
