"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Bot,
  Send,
  Check,
  Loader2,
  ChevronRight,
  FileText,
  Palette,
  Building2,
  Users,
  Film,
  Image,
  Clapperboard,
  Download,
  ArrowLeft,
  FolderOpen,
} from "lucide-react";

// Workflow steps matching the Neuroflix reference
const WORKFLOW_STEPS = [
  { id: "overview", name: "Project Overview", icon: FileText, description: "Upload content and set specifications", step: 1 },
  { id: "style", name: "Art Style & Aesthetic", icon: Palette, description: "Choose visual style", step: 2 },
  { id: "brand", name: "Brand Guidelines", icon: Building2, description: "Logo and brand colors", step: 3 },
  { id: "characters", name: "Characters", icon: Users, description: "Create character references", step: 4 },
  { id: "script", name: "Script & Scenes", icon: FileText, description: "Generate and edit script", step: 5 },
  { id: "preprocessing", name: "Preprocessing Assets", icon: Clapperboard, description: "Locations and outfits", step: 6 },
  { id: "thumbnails", name: "Scene Thumbnails", icon: Image, description: "Preview frames", step: 7 },
  { id: "video", name: "Video Generation", icon: Film, description: "Generate video clips", step: 8 },
  { id: "final", name: "Final Video", icon: Download, description: "Stitch and download", step: 9 },
];

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaign");
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("overview");
  const [expandedStep, setExpandedStep] = useState(null);
  const messagesEndRef = useRef(null);

  // Get campaign data - this IS the project now
  const campaign = useQuery(
    api.campaigns.getCampaignById,
    campaignId ? { id: campaignId } : "skip"
  );

  // Get all campaigns for selector
  const campaigns = useQuery(api.campaigns.getCampaigns, {});
  
  // Mutations
  const updateCampaign = useMutation(api.campaigns.updateCampaign);
  const addStudioMessage = useMutation(api.campaigns.addStudioMessage);

  // Load messages from campaign
  useEffect(() => {
    if (campaign && campaign.studioMessages) {
      setMessages(campaign.studioMessages.map(m => ({
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls || [],
      })));
    }
  }, [campaign]);

  // Update active step from campaign
  useEffect(() => {
    if (campaign && campaign.currentStep) {
      const step = WORKFLOW_STEPS.find(s => s.step === campaign.currentStep);
      if (step) setActiveStep(step.id);
    }
  }, [campaign]);

  // Initialize with welcome message
  useEffect(() => {
    if (campaign && messages.length === 0 && (!campaign.studioMessages || campaign.studioMessages.length === 0)) {
      const welcomeMessage = `Hello! I'm your AI Video Director. I see you're working on **${campaign.brandName}**.\n\nI'll help you create an AI-generated video step by step. To get started, please tell me:\n\n1. What topic or content would you like to create a video about?\n2. How long should the video be? (e.g., 30 seconds, 1 minute)\n3. What format? (16:9 landscape, 9:16 vertical, 1:1 square)\n\nYou can also upload a PDF document and I'll analyze it for you.`;

      setMessages([{ role: "assistant", content: welcomeMessage, toolCalls: [] }]);
    }
  }, [campaign, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !campaignId) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Save to campaign
    await addStudioMessage({
      id: campaignId,
      role: "user",
      content: userMessage,
    });

    try {
      const response = await fetch("/api/studio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          campaignId,
          activeStep,
          campaign: campaign ? {
            brandName: campaign.brandName,
            brandColors: campaign.brandColors,
            visualStyle: campaign.visualStyle,
          } : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update campaign if needed
        if (data.projectData || data.nextStep) {
          const updates = { id: campaignId };
          if (data.nextStep) {
            const stepInfo = WORKFLOW_STEPS.find(s => s.id === data.nextStep);
            if (stepInfo) updates.currentStep = stepInfo.step;
            setActiveStep(data.nextStep);
          }
          if (data.projectData?.style) updates.visualStyle = data.projectData.style;
          await updateCampaign(updates);
        }

        // Save assistant message
        await addStudioMessage({
          id: campaignId,
          role: "assistant",
          content: data.message,
          toolCalls: data.toolCalls || [],
        });

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message, toolCalls: data.toolCalls || [] },
        ]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I encountered an error. Please try again.", toolCalls: [] },
      ]);
    }

    setLoading(false);
  };

  const getStepStatus = (stepId) => {
    const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === stepId);
    const activeIndex = WORKFLOW_STEPS.findIndex((s) => s.id === activeStep);
    if (stepIndex < activeIndex) return "completed";
    if (stepIndex === activeIndex) return "active";
    return "pending";
  };

  // No campaign selected - show campaign picker
  if (!campaignId) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
        <header className="border-b border-gray-800 bg-[#0f0f0f] px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </a>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Bot size={16} className="text-black" />
              </div>
              <h1 className="text-lg font-semibold">AI Video Studio</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="text-center mb-8">
              <FolderOpen size={48} className="mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Select a Campaign</h2>
              <p className="text-gray-400">Choose a campaign to start creating videos</p>
            </div>

            <div className="space-y-3">
              {campaigns?.map((c) => (
                <button
                  key={c._id}
                  onClick={() => router.push(`/dashboard/studio?campaign=${c._id}`)}
                  className="w-full p-4 rounded-xl bg-[#1a1a1a] border border-gray-800 hover:border-orange-500/50 transition-all text-left flex items-center gap-4"
                >
                  {c.logo ? (
                    <img src={c.logo} alt={c.brandName} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Building2 size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{c.brandName}</h3>
                    <p className="text-sm text-gray-500">
                      {c.status === "completed" ? "Completed" : c.status === "in_progress" ? "In Progress" : "Draft"}
                    </p>
                  </div>
                  {c.brandColors && c.brandColors.length > 0 && (
                    <div className="flex gap-1">
                      {c.brandColors.slice(0, 3).map((color, i) => (
                        <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}

              {(!campaigns || campaigns.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No campaigns yet</p>
                  <a
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-black font-medium hover:bg-orange-400 transition-all"
                  >
                    Create Your First Campaign
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f0f0f] sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </a>
            <div className="flex items-center gap-3">
              {campaign.logo ? (
                <img src={campaign.logo} alt={campaign.brandName} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Bot size={16} className="text-black" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold">{campaign.brandName}</h1>
                <p className="text-xs text-gray-500">AI Video Director</p>
              </div>
            </div>
          </div>
          {campaign.brandColors && campaign.brandColors.length > 0 && (
            <div className="flex gap-1">
              {campaign.brandColors.map((color, i) => (
                <div key={i} className="w-5 h-5 rounded-full border border-gray-700" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${msg.role === "user" ? "bg-gradient-to-r from-orange-500 to-orange-600 text-black rounded-2xl rounded-br-md px-4 py-3" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                          <Bot size={14} className="text-orange-400" />
                        </div>
                        <div className="flex-1">
                          {msg.toolCalls && msg.toolCalls.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {msg.toolCalls.map((tool, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                  {tool.status === "completed" ? (
                                    <Check size={14} className="text-green-400" />
                                  ) : (
                                    <Loader2 size={14} className="animate-spin text-orange-400" />
                                  )}
                                  <span>{tool.action}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                      </div>
                    )}
                    {msg.role === "user" && <div className="text-sm font-medium">{msg.content}</div>}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Loader2 size={14} className="animate-spin text-orange-400" />
                    </div>
                    <span className="text-sm text-gray-400 py-2">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-black hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-gray-800 bg-[#0a0a0a] overflow-y-auto">
          <div className="p-4 border-b border-gray-800 sticky top-0 bg-[#0a0a0a] z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Progress</h3>
              <span className="text-xs text-gray-500">{WORKFLOW_STEPS.findIndex((s) => s.id === activeStep) + 1}/9</span>
            </div>
            <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${((WORKFLOW_STEPS.findIndex((s) => s.id === activeStep) + 1) / 9) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-2">
            {WORKFLOW_STEPS.map((step) => {
              const status = getStepStatus(step.id);
              const StepIcon = step.icon;
              const isExpanded = expandedStep === step.id;

              return (
                <div key={step.id} className="mb-1">
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                      status === "active" ? "bg-orange-500/10 text-orange-400" :
                      status === "completed" ? "text-gray-400 hover:bg-gray-800/50" :
                      "text-gray-600 hover:bg-gray-800/30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      status === "completed" ? "bg-green-500/20 text-green-400" :
                      status === "active" ? "bg-orange-500/20 text-orange-400" :
                      "bg-gray-800 text-gray-600"
                    }`}>
                      {status === "completed" ? <Check size={12} /> : <StepIcon size={12} />}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{step.name}</span>
                    <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-3 ml-6 text-xs text-gray-500 border-l border-gray-800">
                          {step.description}
                          {step.id === "brand" && campaign && (
                            <div className="mt-2 p-2 rounded bg-gray-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                {campaign.logo && <img src={campaign.logo} alt={campaign.brandName} className="w-8 h-8 rounded object-cover" />}
                                <span className="text-gray-300 font-medium">{campaign.brandName}</span>
                              </div>
                              {campaign.brandColors && campaign.brandColors.length > 0 && (
                                <div className="flex gap-1">
                                  {campaign.brandColors.map((color, i) => (
                                    <div key={i} className="w-5 h-5 rounded border border-gray-600" style={{ backgroundColor: color }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><Loader2 className="animate-spin text-orange-400" size={32} /></div>}>
      <StudioContent />
    </Suspense>
  );
}
