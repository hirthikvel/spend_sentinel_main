"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { useAuthGuard } from "@/lib/useAuthGuard";
import {
  getCurrentUser,
  getCurrentUserOrganization,
  updateUserProfile,
  updateUserPassword,
  updateOrganizationTypeInSupabase,
  signOutFromSupabase,
  resetAllBillingData,
} from "@/lib/supabase";
import { OrganizationType, ORGANIZATION_TYPES } from "@/lib/types";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { motion } from "motion/react";
import {
  User,
  Building2,
  KeyRound,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthGuard();
  const [currentMenu, setCurrentMenu] = useState("ACCOUNT");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [searchOpen, setSearchOpen] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("Northwind Labs");
  const [orgType, setOrgType] = useState<OrganizationType>("b2b_saas");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Billing Reset State & Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResettingBilling, setIsResettingBilling] = useState(false);
  const [resetNotice, setResetNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Load User & Org Context
  useEffect(() => {
    async function loadData() {
      const activeUser = await getCurrentUser();
      if (activeUser) {
        setUserEmail(activeUser.email || "");
        setFullName(activeUser.user_metadata?.full_name || activeUser.email?.split("@")[0] || "");
      }
      const org = await getCurrentUserOrganization();
      setOrgId(org.orgId);
      setOrgName(org.orgName);
      if (org.orgType) setOrgType(org.orgType);
    }
    loadData();
  }, []);

  // Update Profile & Organization Type
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileNotice(null);

    const [userRes, orgRes] = await Promise.all([
      updateUserProfile(fullName),
      updateOrganizationTypeInSupabase(orgId, orgType),
    ]);
    setIsUpdatingProfile(false);

    if (userRes.success && orgRes.success) {
      setProfileNotice({ type: "success", msg: "Account profile & organization type updated successfully." });
    } else {
      setProfileNotice({
        type: "error",
        msg: userRes.error || orgRes.error || "Failed to update profile.",
      });
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: "error", msg: "Passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordNotice({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updateUserPassword(newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordNotice({ type: "success", msg: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordNotice({ type: "error", msg: res.error || "Failed to update password." });
    }
  };

  // Reset All Billing Datas
  const handleResetBillingData = async () => {
    setIsResettingBilling(true);
    setResetNotice(null);

    const res = await resetAllBillingData();
    setIsResettingBilling(false);
    setShowResetModal(false);

    if (res.success) {
      setResetNotice({
        type: "success",
        msg: "All billing data and parsed CSV records have been completely reset to zero.",
      });
    } else {
      setResetNotice({
        type: "error",
        msg: res.error || "Failed to reset billing records.",
      });
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOutFromSupabase();
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    window.location.href = "/signin?signedOut=true";
  };

  if (authLoading) {
    return (
      <main
        className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex items-center justify-center font-sans"
        style={{ backgroundColor: "#1f5ea5" }}
      >
        <SerratedStripes />
        <div className="relative z-10 panel-card bg-white p-8 flex flex-col items-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 border-4 border-[#1f5ea5] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black uppercase tracking-wider text-black font-sans">
            AUTHENTICATING ACCESS...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex flex-col p-3 2xl:p-4 select-none font-sans"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      <SerratedStripes />

      {/* Main Full-Screen Layout */}
      <div className="relative z-10 w-full h-full flex gap-2.5 2xl:gap-3 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 h-full flex flex-col justify-between gap-2 2xl:gap-2.5 overflow-hidden"
        >
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          {/* Centered Scrollable Account Details Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="max-w-[1240px] w-full mx-auto flex flex-col gap-4 pb-6">
              
              {/* Header Title Bar */}
              <div className="panel-card bg-white p-5 shadow-2xl flex items-center justify-between">
                <div>
                  <h1 className="text-3xl 2xl:text-4xl font-black uppercase text-black leading-none font-sans tracking-tight">
                    Account Details
                  </h1>
                  <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mt-1">
                    Profile, Organization & Security Management
                  </p>
                </div>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans flex items-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Reset Notice Banner */}
              {resetNotice && (
                <div
                  className={`p-4 rounded-lg font-bold text-xs flex items-center space-x-2 shadow-xs ${
                    resetNotice.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {resetNotice.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>{resetNotice.msg}</span>
                </div>
              )}

              {/* Grid with 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* ========================================================== */}
                {/* CARD 1: Profile & Organization Information                */}
                {/* ========================================================== */}
                <div className="panel-card bg-white p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-[#1f5ea5] mb-3">
                      <User className="w-5 h-5" />
                      <h2 className="text-lg font-black uppercase tracking-wide text-black font-sans">
                        Profile & Organization
                      </h2>
                    </div>

                    {profileNotice && (
                      <div
                        className={`mb-4 p-3 rounded text-xs font-bold flex items-center space-x-2 ${
                          profileNotice.type === "success"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                      >
                        {profileNotice.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{profileNotice.msg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Mercer"
                          className="w-full px-3.5 py-2.5 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5]"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Email Address
                        </label>
                        <input
                          type="email"
                          disabled
                          value={userEmail || "user@northwind.io"}
                          className="w-full px-3.5 py-2.5 border-2 border-neutral-200 bg-neutral-100 rounded text-sm font-mono font-bold text-neutral-600 cursor-not-allowed"
                        />
                        <span className="text-[10px] font-mono font-bold text-emerald-600 mt-1 block">
                          ✓ Verified Supabase Account
                        </span>
                      </div>

                      {/* Organization Name */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Organization Name
                        </label>
                        <div className="flex items-center space-x-2 bg-neutral-50 p-3 rounded border-2 border-neutral-200">
                          <Building2 className="w-5 h-5 text-neutral-600" />
                          <div className="flex-1">
                            <p className="text-sm font-black uppercase text-black font-sans leading-none">
                              {orgName}
                            </p>
                            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                              Active Multi-Tenant Scope
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-[#1f5ea5] text-white px-2 py-0.5 rounded">
                            OWNER
                          </span>
                        </div>
                      </div>

                      {/* Organization Type (Editable) */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Organization Type
                        </label>
                        <select
                          value={orgType}
                          onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                          className="w-full px-3.5 py-2.5 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans bg-white focus:outline-none focus:border-[#1f5ea5]"
                        >
                          {ORGANIZATION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label} ({t.description.split("(")[1]?.replace(")", "") || t.value})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] font-mono font-bold text-neutral-500 mt-1 uppercase">
                          Powers calculated unit economics edge function
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="px-5 py-2.5 bg-[#f8b4b4] hover:bg-[#fca5a5] text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs mt-2"
                      >
                        {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* CARD 2: Security & Change Password                         */}
                {/* ========================================================== */}
                <div className="panel-card bg-white p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-[#1f5ea5] mb-3">
                      <KeyRound className="w-5 h-5" />
                      <h2 className="text-lg font-black uppercase tracking-wide text-black font-sans">
                        Change Password
                      </h2>
                    </div>

                    {passwordNotice && (
                      <div
                        className={`mb-4 p-3 rounded text-xs font-bold flex items-center space-x-2 ${
                          passwordNotice.type === "success"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                      >
                        {passwordNotice.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{passwordNotice.msg}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      {/* Set New Password */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-3.5 py-2.5 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5] pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3.5 py-2.5 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5]"
                        />
                      </div>

                      {/* Password strength bar dynamically connected to newPassword */}
                      <PasswordStrengthIndicator password={newPassword} />

                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-5 py-2.5 bg-[#f8b4b4] hover:bg-[#fca5a5] text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs mt-2"
                      >
                        {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* CARD 3: Billing Data Reset (DANGER ZONE)                   */}
              {/* ========================================================== */}
              <div className="panel-card bg-white p-6 shadow-2xl border-2 border-red-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-red-600">
                      <Trash2 className="w-5 h-5" />
                      <h2 className="text-lg font-black uppercase tracking-wide text-black font-sans">
                        Reset All Billing Datas
                      </h2>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed font-sans max-w-2xl">
                      Permanently wipes all scanned CSV line items (`billing_line_items`) and historical upload logs (`billing_uploads`) for <strong className="font-mono">{orgName}</strong>. This allows you to start clean with fresh CSV scans.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs shrink-0 flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset All Billing Datas</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Confirmation Modal for Billing Data Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="panel-card bg-white w-full max-w-md p-6 relative shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-neutral-200 pb-3 mb-4 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black uppercase tracking-tight text-black font-sans leading-none">
                Confirm Billing Data Reset
              </h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-6">
              Are you sure you want to purge all scanned line items and uploads for <strong className="font-mono text-black">{orgName}</strong>?
              This action cannot be undone. The Daily Spend graph will return to a clean zero state until new CSVs are uploaded.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResettingBilling}
                className="px-4 py-2 border-2 border-neutral-300 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetBillingData}
                disabled={isResettingBilling}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider font-sans transition-all shadow-xs"
              >
                {isResettingBilling ? "Resetting..." : "Yes, Reset All Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={() => {}}
      />
    </main>
  );
}
