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
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  Clock,
  Edit3,
  Play,
} from "lucide-react";

// Workflow steps
const WORKFLOW_STEPS = [
  { id: "overview", name: "Project Overview", icon: FileText, step: 1 },
  { id: "style", name: "Art Style", icon: Palette, step: 2 },
  { id: "brand", name: "Brand Guidelines", icon: Building2, step: 3 },
  { id: "characters", name: "Characters", icon: Users, step: 4 },
  { id: "script", name: "Script & Scenes", icon: FileText, step: 5 },
  { id: "preprocessing", name: "Assets", icon: Clapperboard, step: 6 },
  { id: "thumbnails", name: "Thumbnails", icon: Image, step: 7 },
  { id: "video", name: "Video", icon: Film, step: 8 },
  { id: "final", name: "Final", icon: Download, step: 9 },
];

// Visual styles
const VISUAL_STYLES = [
  { id: "3d", name: "3D Animation", desc: "Pixar-like CGI", gradient: "from-blue-500 to-purple-600", emoji: "🎬" },
  { id: "2d", name: "2D Vector", desc: "Flat design", gradient: "from-green-400 to-teal-500", emoji: "✏️" },
  { id: "realistic", name: "Realistic", desc: "Photorealistic", gradient: "from-gray-600 to-gray-800", emoji: "📷" },
  { id: "anime", name: "Anime", desc: "Japanese style", gradient: "from-pink-500 to-rose-500", emoji: "🌸" },
  { id: "minimalist", name: "Minimalist", desc: "Clean & simple", gradient: "from-slate-400 to-slate-600", emoji: "◯" },
  { id: "corporate", name: "Corporate", desc: "Professional", gradient: "from-indigo-500 to-blue-600", emoji: "💼" },
];

// Error Alert
function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3"
    >
      <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
      <p className="text-red-300 text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-300">
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}

// Character Card
function CharacterCard({ character, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold text-black">
          {character.name?.charAt(0) || "?"}
        </div>
        <div>
          <h4 className="font-medium text-white text-sm">{character.name}</h4>
          <p className="text-xs text-orange-400">{character.role}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">{character.personality}</p>
    </motion.div>
  );
}

// Action Button Component
function ActionButton({ children, onClick, variant = "primary", icon: Icon, disabled, loading }) {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50";
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-orange-600 text-black hover:opacity-90",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
    ghost: "text-gray-400 hover:text-white hover:bg-gray-800/50",
  };
  
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${baseStyles} ${variants[variant]}`}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaign");
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("overview");
  const [expandedStep, setExpandedStep] = useState(null);
  const [error, setError] = useState(null);
  
  const [textContent, setTextContent] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [generatingCharacters, setGeneratingCharacters] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [script, setScript] = useState(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [editingScene, setEditingScene] = useState(null);
  
  const messagesEndRef = useRef(null);

  const campaign = useQuery(
    api.campaigns.getCampaignById,
    campaignId ? { id: campaignId } : "skip"
  );

  const campaigns = useQuery(api.campaigns.getCampaigns, {});
  const updateCampaign = useMutation(api.campaigns.updateCampaign);
  const addStudioMessage = useMutation(api.campaigns.addStudioMessage);

  // Load data from campaign
  useEffect(() => {
    if (campaign) {
      if (campaign.studioMessages) {
        setMessages(campaign.studioMessages.map(m => ({
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls || [],
        })));
      }
      if (campaign.pdfContent) setTextContent(campaign.pdfContent);
      if (campaign.visualStyle) setSelectedStyle(campaign.visualStyle);
      if (campaign.characters) setCharacters(campaign.characters);
      if (campaign.script) setScript(campaign.script);
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
      const welcomeMessage = `👋 Welcome to **${campaign.brandName}** Video Studio!

I'll guide you through creating an AI-generated video step by step.

**Step 1: Project Overview**
Paste or type your content below - this can be an article, blog post, script outline, or description of what you want to create.`;

      setMessages([{ role: "assistant", content: welcomeMessage, toolCalls: [] }]);
    }
  }, [campaign, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Add assistant message helper
  const addAssistantMessage = async (content, toolCalls = []) => {
    const msg = { role: "assistant", content, toolCalls };
    setMessages(prev => [...prev, msg]);
    if (campaignId) {
      await addStudioMessage({ id: campaignId, role: "assistant", content, toolCalls });
    }
  };

  // Add user message helper
  const addUserMessage = async (content) => {
    const msg = { role: "user", content };
    setMessages(prev => [...prev, msg]);
    if (campaignId) {
      await addStudioMessage({ id: campaignId, role: "user", content });
    }
  };

  // Step 1: Submit content
  const handleContentSubmit = async () => {
    if (!input.trim() || loading) return;
    
    const content = input.trim();
    setInput("");
    setLoading(true);
    setShowActions(true);
    
    try {
      setTextContent(content);
      await addUserMessage(content.length > 200 ? content.substring(0, 200) + "..." : content);
      
      await updateCampaign({
        id: campaignId,
        pdfContent: content,
        currentStep: 2,
      });
      
      setActiveStep("style");
      
      await addAssistantMessage(
        `✅ Content received and analyzed!

**Step 2: Choose Your Visual Style**
Select the style that best matches your vision. Don't worry - you can change this later.`,
        [{ action: "Analyzed content", status: "completed" }]
      );
    } catch (err) {
      setError(err.message || "Failed to submit content");
    }
    
    setLoading(false);
  };

  // Step 2: Select style
  const handleStyleSelect = async (styleId) => {
    if (loading) return;
    
    setLoading(true);
    setSelectedStyle(styleId);
    const style = VISUAL_STYLES.find(s => s.id === styleId);
    
    try {
      await addUserMessage(`Selected: ${style.emoji} ${style.name}`);
      
      await updateCampaign({
        id: campaignId,
        visualStyle: styleId,
        currentStep: 3,
      });
      
      setActiveStep("brand");
      
      const brandInfo = campaign?.brandColors?.length > 0 
        ? `🎨 **Colors:** ${campaign.brandColors.join(", ")}` 
        : "🎨 **Colors:** Not set";
      
      await addAssistantMessage(
        `${style.emoji} **${style.name}** selected!

**Step 3: Confirm Brand Guidelines**
Review your brand details below:

🏢 **Name:** ${campaign?.brandName || "Not set"}
${campaign?.logo ? "✅ **Logo:** Uploaded" : "⚪ **Logo:** Not set"}
${brandInfo}

Does this look correct?`,
        [{ action: `Selected ${style.name} style`, status: "completed" }]
      );
    } catch (err) {
      setError(err.message || "Failed to select style");
    }
    
    setLoading(false);
  };

  // Step 2: Suggest style
  const handleStyleSuggestion = async () => {
    setLoading(true);
    
    await addUserMessage("I'm not sure which style to pick");
    
    const suggestions = `Here are my recommendations based on your content:

💡 **For explainer/educational content:** 2D Vector or Minimalist
💡 **For product demos:** 3D Animation or Realistic  
💡 **For social media:** Anime or 2D Vector
💡 **For business presentations:** Corporate or Minimalist

Pick the one that resonates with your target audience!`;
    
    await addAssistantMessage(suggestions);
    setLoading(false);
  };

  // Step 3: Confirm brand
  const handleBrandConfirm = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      await addUserMessage("Brand guidelines confirmed ✓");
      
      await updateCampaign({
        id: campaignId,
        currentStep: 4,
      });
      
      setActiveStep("characters");
      
      await addAssistantMessage(
        `✅ Brand confirmed!

**Step 4: Character Generation**
I'll create 3 unique characters based on your content and style preferences.

Click **Generate Characters** when ready, or describe specific characters you'd like.`,
        [{ action: "Brand guidelines saved", status: "completed" }]
      );
    } catch (err) {
      setError(err.message || "Failed to confirm brand");
    }
    
    setLoading(false);
  };

  // Step 3: Go back to change style
  const handleChangeStyle = async () => {
    setLoading(true);
    
    await addUserMessage("I want to change the style");
    
    await updateCampaign({
      id: campaignId,
      currentStep: 2,
    });
    
    setActiveStep("style");
    setSelectedStyle(null);
    
    await addAssistantMessage("No problem! Select a different style below.");
    setLoading(false);
  };

  // Step 4: Generate characters
  const handleGenerateCharacters = async () => {
    if (generatingCharacters) return;
    
    setGeneratingCharacters(true);
    
    try {
      await addUserMessage("Generate characters");
      
      const response = await fetch("/api/studio/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textContent,
          style: selectedStyle,
          brandName: campaign?.brandName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to generate characters");
      }
      
      setCharacters(data.characters);
      
      await updateCampaign({
        id: campaignId,
        characters: data.characters.map(c => ({
          name: c.name,
          description: `${c.role} - ${c.personality}. ${c.appearance}`,
        })),
      });
      
      const charNames = data.characters.map(c => `• **${c.name}** - ${c.role}`).join("\n");
      
      await addAssistantMessage(
        `🎭 **3 Characters Created!**

${charNames}

Check them in the sidebar. Happy with these characters?`,
        [
          { action: "Analyzing content", status: "completed" },
          { action: "Generated 3 characters", status: "completed" },
        ]
      );
    } catch (err) {
      setError(err.message || "Failed to generate characters");
      await addAssistantMessage("❌ Character generation failed. Please try again.");
    }
    
    setGeneratingCharacters(false);
  };

  // Step 4: Regenerate characters
  const handleRegenerateCharacters = async () => {
    await addUserMessage("Regenerate with different characters");
    setCharacters([]);
    await handleGenerateCharacters();
  };

  // Step 4: Continue to next step
  const handleContinueToScript = async () => {
    setLoading(true);
    
    await addUserMessage("Characters approved, continue");
    
    await updateCampaign({
      id: campaignId,
      currentStep: 5,
    });
    
    setActiveStep("script");
    
    await addAssistantMessage(
      `✅ Characters locked in!

**Step 5: Script Generation**
I'll create a 5-scene script based on your content, style, and characters.

Click **Generate Script** to begin!`,
      [{ action: "Characters approved", status: "completed" }]
    );
    
    setLoading(false);
  };

  // Step 5: Generate script
  const handleGenerateScript = async () => {
    if (generatingScript) return;
    
    setGeneratingScript(true);
    
    try {
      await addUserMessage("Generate script");
      
      const response = await fetch("/api/studio/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textContent,
          style: selectedStyle,
          brandName: campaign?.brandName,
          characters: characters,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate script");
      }
      
      setScript(data.script);
      
      await updateCampaign({
        id: campaignId,
        script: data.script,
      });
      
      await addAssistantMessage(
        `📝 **Script Created: "${data.script.title}"**

Total duration: ${data.script.totalDuration} seconds
Scenes: ${data.script.scenes?.length || 5}

Review the scenes below. You can edit any scene or regenerate the entire script.`,
        [
          { action: "Analyzed content & characters", status: "completed" },
          { action: "Generated 5 scenes", status: "completed" },
        ]
      );
    } catch (err) {
      setError(err.message || "Failed to generate script");
      await addAssistantMessage("❌ Script generation failed. Please try again.");
    }
    
    setGeneratingScript(false);
  };

  // Step 5: Regenerate script
  const handleRegenerateScript = async () => {
    await addUserMessage("Regenerate with different script");
    setScript(null);
    await handleGenerateScript();
  };

  // Step 5: Continue to assets
  const handleContinueToAssets = async () => {
    setLoading(true);
    
    await addUserMessage("Script approved, continue");
    
    await updateCampaign({
      id: campaignId,
      currentStep: 6,
    });
    
    setActiveStep("preprocessing");
    
    await addAssistantMessage(
      `✅ Script finalized!

**Step 6: Asset Generation** (Coming Soon)
Location backgrounds and outfit references will be generated here.`,
      [{ action: "Script approved", status: "completed" }]
    );
    
    setLoading(false);
  };

  // Send free-form message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    
    // Check if this is content for step 1
    if (activeStep === "overview" && userMessage.length > 30) {
      await handleContentSubmit();
      return;
    }
    
    await addUserMessage(userMessage);
    
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      await addAssistantMessage(data.message, data.toolCalls || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    
    setLoading(false);
  };

  const getStepStatus = (stepId) => {
    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === stepId);
    const activeIndex = WORKFLOW_STEPS.findIndex(s => s.id === activeStep);
    if (stepIndex < activeIndex) return "completed";
    if (stepIndex === activeIndex) return "active";
    return "pending";
  };

  // No campaign selected
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
                    <p className="text-sm text-gray-500">{c.status || "Draft"}</p>
                  </div>
                  {c.brandColors?.length > 0 && (
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
                  <a href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-black font-medium hover:bg-orange-400 transition-all">
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

  // Loading
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
      <header className="border-b border-gray-800 bg-[#0f0f0f]">
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
          {campaign.brandColors?.length > 0 && (
            <div className="flex gap-1">
              {campaign.brandColors.map((color, i) => (
                <div key={i} className="w-5 h-5 rounded-full border border-gray-700" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence>
                {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
              </AnimatePresence>

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
                          {msg.toolCalls?.length > 0 && (
                            <div className="space-y-1 mb-3">
                              {msg.toolCalls.map((tool, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                  <Check size={14} className="text-green-400" />
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

              {/* Loading indicator */}
              {(loading || generatingCharacters) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Loader2 size={14} className="animate-spin text-orange-400" />
                    </div>
                    <span className="text-sm text-gray-400 py-2">
                      {generatingCharacters ? "Creating characters..." : "Processing..."}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Style Selection Buttons */}
              {activeStep === "style" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {VISUAL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => handleStyleSelect(style.id)}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          selectedStyle === style.id
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-gray-800 bg-[#1a1a1a] hover:border-gray-600"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center text-xl mb-2`}>
                          {style.emoji}
                        </div>
                        <h4 className="font-medium text-sm">{style.name}</h4>
                        <p className="text-xs text-gray-500">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <ActionButton onClick={handleStyleSuggestion} variant="ghost" icon={Lightbulb}>
                      Help me choose
                    </ActionButton>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Brand Confirmation Buttons */}
              {activeStep === "brand" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3 justify-center"
                >
                  <ActionButton onClick={handleBrandConfirm} icon={Check}>
                    Looks Good, Continue
                  </ActionButton>
                  <ActionButton onClick={handleChangeStyle} variant="secondary" icon={ArrowLeft}>
                    Change Style
                  </ActionButton>
                </motion.div>
              )}

              {/* Step 4: Character Actions */}
              {activeStep === "characters" && !loading && !generatingCharacters && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {characters.length === 0 ? (
                    <div className="flex justify-center">
                      <ActionButton onClick={handleGenerateCharacters} icon={Sparkles}>
                        Generate Characters
                      </ActionButton>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {characters.map((char, i) => (
                          <CharacterCard key={i} character={char} index={i} />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <ActionButton onClick={handleContinueToScript} icon={ArrowRight}>
                          Continue to Script
                        </ActionButton>
                        <ActionButton onClick={handleRegenerateCharacters} variant="secondary" icon={RefreshCw}>
                          Regenerate
                        </ActionButton>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 5: Script Actions */}
              {activeStep === "script" && !loading && !generatingScript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {!script ? (
                    <div className="flex justify-center">
                      <ActionButton onClick={handleGenerateScript} icon={FileText}>
                        Generate Script
                      </ActionButton>
                    </div>
                  ) : (
                    <>
                      {/* Script Header */}
                      <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-xl p-4 border border-gray-800">
                        <h3 className="font-bold text-lg text-white mb-2">{script.title || "Your Video Script"}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={14} /> {script.totalDuration}s</span>
                          <span className="flex items-center gap-1"><Play size={14} /> {script.scenes?.length || 0} scenes</span>
                        </div>
                      </div>

                      {/* Scene Cards */}
                      <div className="space-y-3">
                        {script.scenes?.map((scene, i) => (
                          <motion.div
                            key={scene.id || i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                                  {scene.number || i + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{scene.title}</h4>
                                  <p className="text-xs text-gray-500">{scene.duration}s</p>
                                </div>
                              </div>
                              <button className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-all">
                                <Edit3 size={14} />
                              </button>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500 text-xs">Visual:</span>
                                <p className="text-gray-300">{scene.visual}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs">Narration:</span>
                                <p className="text-gray-300 italic">"{scene.narration}"</p>
                              </div>
                              {scene.characters?.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs">Characters:</span>
                                  <div className="flex gap-1">
                                    {scene.characters.map((char, ci) => (
                                      <span key={ci} className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-300">{char}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 justify-center">
                        <ActionButton onClick={handleContinueToAssets} icon={ArrowRight}>
                          Continue to Assets
                        </ActionButton>
                        <ActionButton onClick={handleRegenerateScript} variant="secondary" icon={RefreshCw}>
                          Regenerate Script
                        </ActionButton>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Script Loading */}
              {generatingScript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3 py-8"
                >
                  <Loader2 className="animate-spin text-orange-400" size={24} />
                  <span className="text-gray-400">Generating script...</span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); activeStep === "overview" ? handleContentSubmit() : handleSend(); }} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeStep === "overview" ? "Paste your content here and press Enter..." :
                    "Type a message or use the buttons above..."
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  disabled={loading || generatingCharacters}
                />
                <button
                  type="submit"
                  disabled={loading || generatingCharacters || !input.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-black hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-72 border-l border-gray-800 bg-[#0a0a0a] overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Progress</h3>
              <span className="text-xs text-gray-500">{WORKFLOW_STEPS.findIndex(s => s.id === activeStep) + 1}/9</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${((WORKFLOW_STEPS.findIndex(s => s.id === activeStep) + 1) / 9) * 100}%` }}
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
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                      status === "active" ? "bg-orange-500/10 text-orange-400" :
                      status === "completed" ? "text-gray-400 hover:bg-gray-800/50" :
                      "text-gray-600"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      status === "completed" ? "bg-green-500/20 text-green-400" :
                      status === "active" ? "bg-orange-500/20 text-orange-400" :
                      "bg-gray-800 text-gray-600"
                    }`}>
                      {status === "completed" ? <Check size={10} /> : <StepIcon size={10} />}
                    </div>
                    <span className="flex-1 text-xs font-medium truncate">{step.name}</span>
                    <ChevronRight size={12} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-2 ml-5 border-l border-gray-800">
                          {step.id === "style" && selectedStyle && (
                            <div className="flex items-center gap-2 text-xs">
                              <span>{VISUAL_STYLES.find(s => s.id === selectedStyle)?.emoji}</span>
                              <span className="text-gray-300">{VISUAL_STYLES.find(s => s.id === selectedStyle)?.name}</span>
                            </div>
                          )}
                          
                          {step.id === "brand" && (
                            <div className="text-xs text-gray-400">
                              <p>{campaign.brandName}</p>
                              {campaign.brandColors?.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {campaign.brandColors.map((c, i) => (
                                    <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: c }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {step.id === "characters" && characters.length > 0 && (
                            <div className="space-y-1">
                              {characters.map((c, i) => (
                                <p key={i} className="text-xs text-gray-400">• {c.name}</p>
                              ))}
                            </div>
                          )}
                          
                          {!["style", "brand", "characters"].includes(step.id) && (
                            <p className="text-xs text-gray-500">
                              {status === "pending" ? "Coming soon" : "Completed"}
                            </p>
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
