"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserOrganization, supabase } from "@/lib/supabase";

interface SidebarProps {
  currentMenu?: string;
  onSelectMenu?: (menu: string) => void;
  organizationName?: string;
}

const MENU_ITEMS = [
  "DASHBOARD",
  "ANOMALIES",
  "ASK",
  "UPLOAD",
  "SETTINGS",
];

export function Sidebar({
  currentMenu = "DASHBOARD",
  onSelectMenu,
  organizationName,
}: SidebarProps) {
  const router = useRouter();
  const [activeOrgName, setActiveOrgName] = useState<string>("ORGANIZATION");

  useEffect(() => {
    async function updateOrg() {
      const res = await getCurrentUserOrganization();
      if (res?.orgName) {
        setActiveOrgName(res.orgName);
      }
    }
    updateOrg();

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(() => {
        updateOrg();
      });
      return () => {
        data.subscription.unsubscribe();
      };
    }
  }, []);

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
    } else if (item === "ASK") {
      // Dispatches open search event for Ctrl+K
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
      );
    } else if (item === "SETTINGS") {
      router.push("/settings");
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
          <p className="text-xs 2xl:text-sm font-black tracking-wider text-black uppercase mt-1 font-sans truncate">
            {organizationName || activeOrgName}
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

      {/* Bottom Account Details Button */}
      <div className="pt-3 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => {
            onSelectMenu?.("ACCOUNT");
            router.push("/account");
          }}
          className={`w-full py-2 px-2.5 rounded-sm border-2 transition-all cursor-pointer font-sans shadow-xs flex items-center space-x-2 ${
            currentMenu === "ACCOUNT"
              ? "border-[#1f5ea5] bg-blue-50/70"
              : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-black"
          }`}
          title="Account Details"
        >
          <div className="w-7 h-7 rounded-full bg-[#1f5ea5] text-white flex items-center justify-center font-black text-xs shrink-0">
            A
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-black uppercase tracking-wider text-black leading-tight truncate">
              Account Details
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-400 leading-tight truncate">
              Profile & Access
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
