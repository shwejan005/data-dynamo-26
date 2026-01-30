"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Statistics Page with Real-time Data
 */

const ORANGE = "#f97316";

export default function StatsPage() {
  const stats = useQuery(api.statistics.getDashboardStats);
  const recentOnboardings = useQuery(api.statistics.getRecentOnboardings);
  const platformDistribution = useQuery(api.statistics.getPlatformDistribution);
  const last7Days = useQuery(api.statistics.getCampaignsLast7Days);
  const recentActivity = useQuery(api.statistics.getRecentActivity);

  // Default values while loading
  const totals = stats || {
    totalOnboarded: 0,
    totalSessions: 0,
    totalMessages: 0,
    totalCampaigns: 0,
  };

  // --- small UI components ---
  const KPI = ({ label, value }) => (
    <div className="p-4 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-2xl font-semibold text-white mt-1">{value}</div>
    </div>
  );

  const ChartLine = ({ data }) => {
    // simple svg line chart
    const width = 560;
    const height = 140;
    const padding = 24;
    // Handle empty or loading data
    if (!data || data.length === 0) return <div className="h-[140px] flex items-center justify-center text-gray-500">No data</div>;

    const max = Math.max(...data.map((d) => d.count), 1); // Avoid div by zero
    const points = data
      .map((d, i) => {
        const x = padding + (i * (width - padding * 2)) / (data.length - 1);
        const y = padding + (1 - d.count / max) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="rounded">
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding + t * (height - padding * 2);
          return <line key={i} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" />;
        })}
        {/* area */}
        <polyline fill="none" stroke={ORANGE} strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {data.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / (data.length - 1);
          const y = padding + (1 - d.count / max) * (height - padding * 2);
          return <circle key={i} cx={x} cy={y} r="3.5" fill={ORANGE} />;
        })}
      </svg>
    );
  };

  const BarChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No platform data yet</div>;
    const max = Math.max(...data.map((d) => d.count), 1);
    return (
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.platform} className="flex items-center gap-4">
            <div className="w-28 text-sm text-gray-300">{d.platform}</div>
            <div className="flex-1 bg-gray-900 rounded h-4 overflow-hidden">
              <div style={{ width: `${(d.count / max) * 100}%`, background: ORANGE }} className="h-full" />
            </div>
            <div className="w-12 text-right text-sm text-gray-300">{d.count}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "#000000", color: "#ffffff" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Statistics</h1>
            <p className="text-sm text-gray-400 mt-1">Overview of onboarding, chat sessions and campaign activity</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Active Campaigns</div>
              <div className="text-lg font-semibold">{totals.totalCampaigns}</div>
            </div>
            <div className="px-4 py-2 rounded border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
              <button className="flex items-center gap-2 text-sm font-medium hover:cursor-pointer" style={{ color: ORANGE }}>
                {/* "New Campaign" - purely visual for mock */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                New Campaign
              </button>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPI label="Total Onboarded" value={totals.totalOnboarded} />
          <KPI label="Chat Sessions" value={totals.totalSessions} />
          <KPI label="Messages" value={totals.totalMessages} />
          <KPI label="Active Campaigns" value={totals.totalCampaigns} />
        </div>

        {/* Charts + Right column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Campaigns — Last 7 days</h3>
              <div className="text-sm text-gray-400">Daily new campaigns</div>
            </div>

            <div className="mb-4">
              <ChartLine data={last7Days} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-300 mt-4">
              {last7Days?.map((d) => (
                <div key={d.date} className="text-center">
                  <div className="font-semibold text-white">{d.count}</div>
                  <div className="text-xs text-gray-400">{d.date}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="p-6 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h4 className="text-lg font-semibold mb-3">Platform distribution</h4>
            <BarChart data={platformDistribution} />

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Recent Onboardings</h4>
              <div className="space-y-3">
                {recentOnboardings?.map((o) => (
                  <div key={o._id} className="p-3 rounded border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{o.brandName}</div>
                      <div className="text-xs text-gray-400">Tone: {o.tone}</div>
                    </div>
                    <div className="text-xs text-gray-400">{o.createdAt}</div>
                  </div>
                ))}
                 {(!recentOnboardings || recentOnboardings.length === 0) && (
                    <div className="text-sm text-gray-500">No onboarding data</div>
                 )}
              </div>
            </div>
          </aside>
        </div>

        {/* Recent Sessions & Messages */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h3 className="text-lg font-semibold mb-3">Recent Chat Sessions</h3>
            <div className="space-y-3">
              {recentActivity?.sessions.map((s) => (
                <div key={s._id} className="p-3 rounded border border-gray-900 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: ORANGE, color: "#000" }}>
                    {s.title ? s.title.split(" ").map((w) => w[0] || "").slice(0, 2).join("") : "S"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{s.title || "Untitled Session"}</div>
                    <div className="text-xs text-gray-400">Created: {s.createdAt} • messages: {s.messageCount}</div>
                  </div>
                </div>
              ))}
               {(!recentActivity?.sessions || recentActivity.sessions.length === 0) && (
                    <div className="text-sm text-gray-500">No recent sessions</div>
                 )}
            </div>
          </div>

          <div className="p-6 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h3 className="text-lg font-semibold mb-3">Recent Messages</h3>
            <div className="space-y-2">
              {recentActivity?.messages.map((m, i) => (
                <div key={m._id} className="p-3 rounded border border-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">{m.role}</div>
                    <div className="text-xs text-gray-400">{m.createdAt}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-200 truncate">{m.content}</div>
                </div>
              ))}
              {(!recentActivity?.messages || recentActivity.messages.length === 0) && (
                    <div className="text-sm text-gray-500">No recent messages</div>
                 )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <span style={{ color: ORANGE }} className="font-medium">Live Data:</span> This page now displays real-time data from your Convex backend.
        </div>
      </div>
    </div>
  );
}

