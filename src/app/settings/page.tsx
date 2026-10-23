"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { useAuthGuard } from "@/lib/useAuthGuard";
import {
  fetchOrgMembers,
  addOrgMember,
  removeOrgMember,
  ingestBillingCsv,
} from "@/lib/supabase";
import { OrgMember } from "@/lib/types";
import { Users, Upload, Trash2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard();
  const [currentMenu, setCurrentMenu] = useState("SETTINGS");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [searchOpen, setSearchOpen] = useState(false);

  // Active Settings Tab: "members" or "csv"
  const [activeTab, setActiveTab] = useState<"members" | "csv">("members");

  // Members Management State
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("Welcome123!");
  const [memberRole, setMemberRole] = useState("Analyst");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberNotice, setMemberNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // CSV Ingestion State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [csvNotice, setCsvNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Load members on mount
  useEffect(() => {
    fetchOrgMembers().then((res) => {
      setMembers(res);
    });
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail) return;

    setIsAddingMember(true);
    setMemberNotice(null);

    const res = await addOrgMember(memberEmail, memberRole, memberPassword);
    setIsAddingMember(false);

    if (res.success) {
      setMembers((prev) => [
        {
          id: `mem-${Date.now()}`,
          email: memberEmail,
          role: memberRole.toUpperCase(),
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      setMemberNotice({
        type: "success",
        msg: `Added ${memberEmail} as ${memberRole}. They can now log in using the assigned password.`,
      });
      setMemberEmail("");
      setMemberPassword("Welcome123!");
    } else {
      setMemberNotice({
        type: "error",
        msg: res.error || "Failed to add member.",
      });
    }
  };

  const handleRemoveMember = async (id: string, email: string) => {
    await removeOrgMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMemberNotice({
      type: "success",
      msg: `Removed ${email} from organization.`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleIngestCsv = async () => {
    if (!csvFile) return;

    setIsIngesting(true);
    setCsvNotice(null);

    try {
      const text = await csvFile.text();
      const res = await ingestBillingCsv(text, csvFile.name);

      setIsIngesting(false);
      if (res.success) {
        const efText = res.edgeFunction?.data
          ? ` • Supabase Edge Function executed: ${res.edgeFunction.data.unit_metric} = ₹${res.edgeFunction.data.calculated_unit_cost_inr} (${res.edgeFunction.data.status})`
          : "";
        setCsvNotice({
          type: "success",
          msg: `Successfully scanned and ingested ${res.rowCount} line items from ${csvFile.name}.${efText} The Dashboard Daily Spend graph is now updated!`,
        });
        setCsvFile(null);
      } else {
        setCsvNotice({
          type: "error",
          msg: res.error || "Failed to ingest CSV data.",
        });
      }
    } catch (err: any) {
      setIsIngesting(false);
      setCsvNotice({
        type: "error",
        msg: err.message || "Failed to read CSV file.",
      });
    }
  };

  const handleLoadSampleCsv = async () => {
    setIsIngesting(true);
    setCsvNotice(null);

    const sampleCsv = `usage_date,service,region,cost,resource_id,usage_type,usage_quantity,account_id,tag_env,tag_team
2026-10-01,Amazon EC2,us-east-1,38.12,i-web-01,BoxUsage:m5.xlarge,24,123456789012,prod,platform
2026-10-01,Amazon RDS,us-east-1,120.00,rds-main,InstanceUsage:db.r5.2xlarge,24,123456789012,prod,data
2026-10-02,Amazon EC2,us-west-2,14.50,i-dev-build-01,BoxUsage:c5.xlarge,24,123456789012,dev,platform
2026-10-03,Amazon EC2,us-east-1,42.80,i-web-02,BoxUsage:m5.xlarge,24,123456789012,prod,platform
2026-10-04,Amazon S3,us-east-1,18.40,s3-datalake-analytics,Storage,500,123456789012,prod,analytics
2026-10-05,Amazon EC2,us-west-2,285.00,i-stg-gpu-01,BoxUsage:p3.2xlarge,24,123456789012,staging,ml-team
2026-10-06,Amazon VPC,us-east-1,198.00,nat-gw-01,NatGateway-Bytes,1200,123456789012,prod,networking
2026-10-07,Amazon EC2,us-east-1,62.00,i-api-01,BoxUsage:c5.2xlarge,24,123456789012,prod,platform
2026-10-08,Amazon RDS,us-east-1,125.00,rds-main,InstanceUsage:db.r5.2xlarge,24,123456789012,prod,data
2026-10-09,Amazon EC2,us-west-2,290.00,i-stg-gpu-01,BoxUsage:p3.2xlarge,24,123456789012,staging,ml-team
2026-10-10,Amazon EC2,us-east-1,74.50,i-api-02,BoxUsage:c5.2xlarge,24,123456789012,prod,platform
2026-10-11,Amazon EC2,us-west-2,288.00,i-stg-gpu-01,BoxUsage:p3.2xlarge,24,123456789012,staging,ml-team
2026-10-12,Amazon VPC,us-east-1,221.00,nat-gw-01,NatGateway-Bytes,1400,123456789012,prod,networking
2026-10-13,Amazon EC2,us-east-1,692.00,asg-prod-fleet,BoxUsage:c5.xlarge,96,123456789012,prod,traffic
2026-10-14,Amazon RDS,us-east-1,122.00,rds-analytics,InstanceUsage:db.m5.2xlarge,24,123456789012,prod,analytics
2026-10-15,Amazon EC2,us-west-2,314.00,i-stg-gpu-01,BoxUsage:p3.2xlarge,24,123456789012,staging,ml-team`;

    const res = await ingestBillingCsv(sampleCsv, "sample-cur-bill.csv");
    setIsIngesting(false);

    if (res.success) {
      const efText = res.edgeFunction?.data
        ? ` • Supabase Edge Function triggered: ${res.edgeFunction.data.unit_metric} = ₹${res.edgeFunction.data.calculated_unit_cost_inr} (${res.edgeFunction.data.status})`
        : "";
      setCsvNotice({
        type: "success",
        msg: `Ingested ${res.rowCount} historical records from sample-cur-bill.csv.${efText} The Daily Spend timeline is now active on your Dashboard!`,
      });
    } else {
      setCsvNotice({
        type: "error",
        msg: res.error || "Failed to load sample CSV.",
      });
    }
  };

  if (authLoading) {
    return (
      <main className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] flex items-center justify-center font-mono font-bold text-white text-sm">
        VERIFYING AUTHENTICATION...
      </main>
    );
  }

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex flex-col p-3 2xl:p-4 select-none font-sans"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      <SerratedStripes />

      <div className="relative z-10 w-full h-full flex gap-2.5 2xl:gap-3 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentMenu={currentMenu}
          onSelectMenu={(menu) => setCurrentMenu(menu)}
        />

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col justify-between gap-2 2xl:gap-2.5 overflow-hidden">
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          {/* Centered Panel */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-3">
              {/* Header Card with Two Symmetrical Tabs */}
              <div className="panel-card bg-white p-5 2xl:p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div>
                    <h1 className="text-3xl 2xl:text-4xl font-black uppercase text-black leading-none font-sans tracking-tight">
                      Settings
                    </h1>
                    <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mt-1">
                      Organization Management & Data Sources
                    </p>
                  </div>

                  {/* Two Main Option Buttons */}
                  <div className="inline-flex items-center border-2 border-neutral-200 rounded p-0.5 bg-neutral-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab("members")}
                      className={`px-4 py-2 text-xs 2xl:text-sm font-black uppercase tracking-wider font-sans rounded-xs transition-all cursor-pointer flex items-center space-x-2 ${
                        activeTab === "members"
                          ? "bg-[#1f5ea5] text-white shadow-xs"
                          : "text-neutral-600 hover:text-black bg-transparent"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Organization Members</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("csv")}
                      className={`px-4 py-2 text-xs 2xl:text-sm font-black uppercase tracking-wider font-sans rounded-xs transition-all cursor-pointer flex items-center space-x-2 ${
                        activeTab === "csv"
                          ? "bg-[#1f5ea5] text-white shadow-xs"
                          : "text-neutral-600 hover:text-black bg-transparent"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Mock / Old CSV</span>
                    </button>
                  </div>
                </div>

                {/* ================= OPTION 1: ORG MEMBERS ================= */}
                {activeTab === "members" && (
                  <div className="space-y-5">
                    {memberNotice && (
                      <div
                        className={`p-3 rounded text-xs font-bold flex items-center space-x-2 ${
                          memberNotice.type === "success"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                      >
                        {memberNotice.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{memberNotice.msg}</span>
                      </div>
                    )}

                    {/* Add Member Form */}
                    <form
                      onSubmit={handleAddMember}
                      className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col md:flex-row items-end gap-3"
                    >
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Member Email
                        </label>
                        <input
                          type="email"
                          required
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          placeholder="teammate@company.com"
                          className="w-full px-3.5 py-2 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5] bg-white"
                        />
                      </div>

                      <div className="w-full md:w-56">
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Initial Password
                        </label>
                        <input
                          type="text"
                          required
                          value={memberPassword}
                          onChange={(e) => setMemberPassword(e.target.value)}
                          placeholder="Set Password"
                          className="w-full px-3.5 py-2 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5] bg-white font-mono"
                        />
                      </div>

                      <div className="w-full md:w-44">
                        <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                          Role Basis
                        </label>
                        <select
                          value={memberRole}
                          onChange={(e) => setMemberRole(e.target.value)}
                          className="w-full px-3.5 py-2 border-2 border-neutral-300 rounded text-sm font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5] bg-white cursor-pointer"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Viewer">Viewer</option>
                          <option value="Owner">Owner</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingMember}
                        className="w-full md:w-auto px-6 py-2.5 bg-[#f8b4b4] hover:bg-[#fca5a5] text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shrink-0 shadow-xs"
                      >
                        {isAddingMember ? "Adding..." : "Add Member"}
                      </button>
                    </form>

                    {/* Members List Table */}
                    <div>
                      <h3 className="text-sm font-black uppercase text-black font-sans tracking-wide mb-2.5">
                        Current Organization Members ({members.length})
                      </h3>

                      <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse select-none">
                          <thead>
                            <tr className="bg-neutral-100 border-b border-neutral-200 text-xs font-black uppercase text-neutral-500 font-sans">
                              <th className="py-2.5 px-4">Member Email</th>
                              <th className="py-2.5 px-4">Role</th>
                              <th className="py-2.5 px-4">Date Added</th>
                              <th className="py-2.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {members.map((m) => (
                              <tr key={m.id} className="hover:bg-neutral-50 font-mono text-xs font-bold text-black">
                                <td className="py-3 px-4">{m.email}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                      m.role === "OWNER"
                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                                        : m.role === "ADMIN"
                                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                                        : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                                    }`}
                                  >
                                    {m.role}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-neutral-500">{m.createdAt}</td>
                                <td className="py-3 px-4 text-right">
                                  {m.role !== "OWNER" && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMember(m.id, m.email)}
                                      className="p-1 hover:text-red-600 transition-colors text-neutral-400 cursor-pointer"
                                      title="Remove Member"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= OPTION 2: CSV DETAILS ================= */}
                {activeTab === "csv" && (
                  <div className="space-y-5">
                    {csvNotice && (
                      <div
                        className={`p-3.5 rounded text-xs font-bold flex items-center space-x-2 ${
                          csvNotice.type === "success"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                      >
                        {csvNotice.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{csvNotice.msg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                      {/* Upload Mock / Old CSV Dropzone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-6 rounded-lg border-2 border-dashed border-neutral-300 hover:border-black bg-neutral-50/60 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3 text-neutral-700">
                          <Upload className="w-6 h-6 stroke-[1.5]" />
                        </div>

                        <h3 className="text-base font-black uppercase text-black font-sans mb-1">
                          {csvFile ? csvFile.name : "Select or Drop Billing CSV"}
                        </h3>
                        <p className="text-xs font-mono font-bold text-neutral-500 uppercase mb-4">
                          {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : "AWS CUR, FOCUS, or Canonical format"}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (csvFile) {
                              handleIngestCsv();
                            } else {
                              fileInputRef.current?.click();
                            }
                          }}
                          disabled={isIngesting}
                          className="px-6 py-2 bg-[#f8b4b4] hover:bg-[#fca5a5] text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs"
                        >
                          {isIngesting ? "Scanning & Ingesting..." : csvFile ? "Ingest & Scan Dates" : "Choose File"}
                        </button>
                      </div>

                      {/* Quick Load Sample CSV Card */}
                      <div className="p-6 rounded-lg border-2 border-neutral-200 bg-white flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-2 text-[#1f5ea5] mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="text-xs font-mono font-black uppercase">
                              Historical Telemetry
                            </span>
                          </div>
                          <h3 className="text-base font-black uppercase text-black font-sans leading-snug">
                            Load Benchmark Sample Bill
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1 leading-relaxed font-sans">
                            Scans 16 continuous usage dates across Amazon EC2, VPC, and RDS. Populates the Daily Spend graph and delta calculations in your Supabase database immediately.
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-neutral-100">
                          <button
                            type="button"
                            disabled={isIngesting}
                            onClick={handleLoadSampleCsv}
                            className="w-full py-2.5 border-2 border-neutral-300 hover:border-black bg-white text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs"
                          >
                            {isIngesting ? "Scanning..." : "Scan & Load Benchmark CSV"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={() => router.push("/dashboard")}
      />
    </main>
  );
}
