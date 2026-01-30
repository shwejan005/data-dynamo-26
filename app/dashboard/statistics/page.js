"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Statistics Page - Real-time Campaign Data
 */

const ORANGE = "#f97316";

export default function StatsPage() {
  const stats = useQuery(api.statistics.getDashboardStats);
  const recentCampaigns = useQuery(api.statistics.getRecentOnboardings);
  const styleDistribution = useQuery(api.statistics.getPlatformDistribution);
  const last7Days = useQuery(api.statistics.getCampaignsLast7Days);
  const recentActivity = useQuery(api.statistics.getRecentActivity);
  const campaignsWithMedia = useQuery(api.statistics.getCampaignsWithMedia);

  // Default values while loading
  const totals = stats || {
    totalCampaigns: 0,
    completedCampaigns: 0,
    draftCampaigns: 0,
    inProgressCampaigns: 0,
    totalGenerations: 0,
  };

  // --- small UI components ---
  const KPI = ({ label, value, color = "text-white" }) => (
    <div className="p-4 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );

  const ChartLine = ({ data }) => {
    const width = 560;
    const height = 140;
    const padding = 24;
    if (!data || data.length === 0) return <div className="h-[140px] flex items-center justify-center text-gray-500">No data</div>;

    const max = Math.max(...data.map((d) => d.count), 1);
    const points = data
      .map((d, i) => {
        const x = padding + (i * (width - padding * 2)) / (data.length - 1);
        const y = padding + (1 - d.count / max) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="rounded">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding + t * (height - padding * 2);
          return <line key={i} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" />;
        })}
        <polyline fill="none" stroke={ORANGE} strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / (data.length - 1);
          const y = padding + (1 - d.count / max) * (height - padding * 2);
          return <circle key={i} cx={x} cy={y} r="3.5" fill={ORANGE} />;
        })}
      </svg>
    );
  };

  const BarChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No style data yet</div>;
    const max = Math.max(...data.map((d) => d.count), 1);
    const styleEmojis = {
      "3d": "🎬",
      "2d": "✏️",
      "realistic": "📷",
      "anime": "🎨",
      "minimalist": "⬜",
      "corporate": "💼",
    };
    return (
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.platform} className="flex items-center gap-4">
            <div className="w-28 text-sm text-gray-300 flex items-center gap-2">
              <span>{styleEmojis[d.platform] || "🎨"}</span>
              <span className="capitalize">{d.platform}</span>
            </div>
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
            <p className="text-sm text-gray-400 mt-1">Campaign & generation activity from AI Video Studio</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Total Generations</div>
              <div className="text-lg font-semibold text-[#f97316]">{totals.totalGenerations}</div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <KPI label="Total Campaigns" value={totals.totalCampaigns} />
          <KPI label="Completed" value={totals.completedCampaigns} color="text-green-400" />
          <KPI label="Drafts" value={totals.draftCampaigns} color="text-yellow-400" />
          <KPI label="In Progress" value={totals.inProgressCampaigns} color="text-blue-400" />
          <KPI label="With Media" value={totals.totalGenerations} color="text-[#f97316]" />
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

            <div className="grid grid-cols-7 gap-2 text-sm text-gray-300 mt-4">
              {last7Days?.map((d) => (
                <div key={d.date} className="text-center">
                  <div className="font-semibold text-white">{d.count}</div>
                  <div className="text-xs text-gray-400">{d.date}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="p-6 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h4 className="text-lg font-semibold mb-3">Style Distribution</h4>
            <BarChart data={styleDistribution} />

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Recent Campaigns</h4>
              <div className="space-y-3">
                {recentCampaigns?.map((c) => (
                  <div key={c._id} className="p-3 rounded border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{c.brandName}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="capitalize">{c.visualStyle || "N/A"}</span>
                        {c.hasMedia && <span className="text-green-400">• Has Media</span>}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      c.status === "completed" ? "bg-green-900/50 text-green-400" :
                      c.status === "draft" ? "bg-yellow-900/50 text-yellow-400" :
                      "bg-gray-800 text-gray-400"
                    }`}>
                      {c.status || "draft"}
                    </div>
                  </div>
                ))}
                {(!recentCampaigns || recentCampaigns.length === 0) && (
                  <div className="text-sm text-gray-500">No campaigns yet</div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Generated Media */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🎬</span>
            Generated Media
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {campaignsWithMedia?.slice(0, 4).map((item) => (
              <div key={item._id} className="bg-zinc-900 rounded-xl overflow-hidden border border-gray-800">
                <div className="aspect-video relative bg-gray-800">
                  {item.mediaUrl && (
                    <img 
                      src={item.mediaUrl} 
                      alt={item.brandName}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium">{item.brandName}</div>
                  <div className="text-xs text-gray-400">{item.visualStyle}</div>
                </div>
              </div>
            ))}
            {(!campaignsWithMedia || campaignsWithMedia.length === 0) && (
              <div className="col-span-4 text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🖼️</div>
                <p className="text-sm">No media generated yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-gray-800" style={{ background: "rgba(255,255,255,0.02)" }}>
            <h3 className="text-lg font-semibold mb-3">Recent Sessions</h3>
            <div className="space-y-3">
              {recentActivity?.sessions.map((s) => (
                <div key={s._id} className="p-3 rounded border border-gray-900 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: ORANGE, color: "#000" }}>
                    {s.title ? s.title.split(" ").map((w) => w[0] || "").slice(0, 2).join("") : "S"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{s.title || "Untitled"}</div>
                    <div className="text-xs text-gray-400">Step {s.currentStep || 1}/7 • {s.messageCount} messages</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    s.status === "completed" ? "bg-green-900/50 text-green-400" :
                    s.status === "draft" ? "bg-yellow-900/50 text-yellow-400" :
                    "bg-gray-800 text-gray-400"
                  }`}>
                    {s.status || "draft"}
                  </span>
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
              {recentActivity?.messages.map((m) => (
                <div key={m._id} className="p-3 rounded border border-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span className={m.role === "user" ? "text-blue-400" : "text-[#f97316]"}>{m.role}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{m.campaignName}</span>
                    </div>
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
          <span style={{ color: ORANGE }} className="font-medium">Live Data:</span> Displaying real-time data from your AI Video Studio campaigns.
        </div>
      </div>
    </div>
  );
}
