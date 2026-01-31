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
  Share2,
  Plus,
} from "lucide-react";

// Workflow steps
const WORKFLOW_STEPS = [
  { id: "overview", name: "Project Overview", icon: FileText, step: 1 },
  { id: "style", name: "Art Style", icon: Palette, step: 2 },
  { id: "brand", name: "Brand Guidelines", icon: Building2, step: 3 },
  { id: "characters", name: "Characters", icon: Users, step: 4 },
  { id: "script", name: "Script & Scenes", icon: FileText, step: 5 },
  { id: "preprocessing", name: "Assets & Video", icon: Film, step: 6 },
  { id: "posting", name: "Post & Save", icon: Share2, step: 7 },
];


const VISUAL_STYLES = [
  { id: "3d", name: "3D Animation", desc: "Pixar-like CGI", gradient: "from-blue-500 to-purple-600", emoji: "🎬" },
  { id: "2d", name: "2D Vector", desc: "Flat design", gradient: "from-green-400 to-teal-500", emoji: "✏️" },
  { id: "realistic", name: "Realistic", desc: "Photorealistic", gradient: "from-gray-600 to-gray-800", emoji: "📷" },
  { id: "anime", name: "Anime", desc: "Japanese style", gradient: "from-pink-500 to-rose-500", emoji: "🌸" },
  { id: "minimalist", name: "Minimalist", desc: "Clean & simple", gradient: "from-slate-400 to-slate-600", emoji: "◯" },
  { id: "corporate", name: "Corporate", desc: "Professional", gradient: "from-indigo-500 to-blue-600", emoji: "💼" },
];

// Location assets for video generation
const LOCATION_ASSETS = [
  { id: "coffee-shop", name: "Coffee Shop", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop" },
  { id: "city-street", name: "City Street", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop" },
  { id: "modern-office", name: "Modern Office", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop" },
  { id: "beach-sunset", name: "Beach Sunset", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop" },
  { id: "mountain-view", name: "Mountain View", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop" },
  { id: "urban-park", name: "Urban Park", image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=300&fit=crop" },
  { id: "cozy-living-room", name: "Cozy Living Room", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop" },
  { id: "tech-startup", name: "Tech Startup", image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=300&fit=crop" },
  { id: "restaurant", name: "Restaurant", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop" },
  { id: "gym-fitness", name: "Gym & Fitness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop" },
  { id: "rooftop-terrace", name: "Rooftop Terrace", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop" },
  { id: "library", name: "Library", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop" },
  { id: "night-city", name: "Night City", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop" },
  { id: "forest-trail", name: "Forest Trail", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop" },
  { id: "shopping-mall", name: "Shopping Mall", image: "https://images.unsplash.com/photo-1519566335946-e6f65f0f4fdf?w=400&h=300&fit=crop" },
  { id: "art-gallery", name: "Art Gallery", image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400&h=300&fit=crop" },
  { id: "industrial-loft", name: "Industrial Loft", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop" },
  { id: "japanese-garden", name: "Japanese Garden", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop" },
  { id: "airport-terminal", name: "Airport Terminal", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop" },
  { id: "home-kitchen", name: "Home Kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-lg font-bold text-black border border-orange-400 overflow-hidden">
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            character.emoji || character.name?.charAt(0) || "?"
          )}
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
  
  // Character creation state
  const [newCharacter, setNewCharacter] = useState({ name: "", role: "", personality: "", emoji: "😊", avatar: null });
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Helper to format chat messages with headers
  function parseAndStyleMessage(content) {
    if (!content) return null;
    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-orange-400">
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={index} className="flex items-start gap-2 ml-4 mb-1">
            <span className="text-orange-500 mt-1">•</span>
            <span className="flex-1 text-gray-300">{parseBoldText(line.replace(/^[-*] /, ""))}</span>
          </div>
        );
      }
      return (
        <p key={index} className="mb-2 text-gray-300">
          {parseBoldText(line)}
        </p>
      );
    });
  }

  function parseBoldText(text) {
    return text.split(/(\*\*.+?\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <span key={i} className="font-semibold text-orange-200">
          {part.slice(2, -2)}
        </span>
      ) : (
        part
      )
    );
  }


  
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
      if (campaign.script) {
        try {
          const parsed = typeof campaign.script === 'string' ? JSON.parse(campaign.script) : campaign.script;
          setScript(parsed);
        } catch (e) {
          console.error("Failed to parse script:", e);
        }
      }
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
      
      // Initialize with empty or minimal characters if none exist
      // We are NOT setting defaults here anymore, user must create them
      if (characters.length === 0) {
        setCharacters([]);
      }
      
      await updateCampaign({
        id: campaignId,
        currentStep: 4,
      });
      
      setActiveStep("characters");
      
      await addAssistantMessage(
        `✅ Brand confirmed!

**Step 4: Create Characters**

⚠️ **Note:** Image generation credits are currently exhausted.
Please use an **Emoji Avatar** for your characters instead.

Add the key characters for your video below:`,
        [
          { action: "Brand guidelines saved", status: "completed" }
        ]
      );
    } catch (err) {
      setError(err.message || "Failed to confirm brand");
    }
    
    setLoading(false);
  };

  // Handle "Generate from Image" (Mock Failure)
  const handleGenerateFromImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingImage(true);
    
    // Simulate processing delay
    setTimeout(async () => {
        setAnalyzingImage(false);
        setError("Character generation credits exhausted.");
        
        await addAssistantMessage(
            `⚠️ **Credits Exception**
            
I analyzed your image but could not generate the profiles because **your image generation credits are exhausted**.

Please add your characters manually below. You can upload their avatars directly!`
        );
    }, 2000);
  };

  // Handle Avatar Upload for Manual Character
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
      const url = URL.createObjectURL(file);
      setNewCharacter({ ...newCharacter, avatar: url, emoji: null });
  };

  // Add Default Character
  const handleAddDefaultCharacter = () => {
    const defaultChar = {
      name: "Alex",
      role: "Host",
      personality: "Friendly & Professional",
      emoji: "👋",
      avatar: null
    };
    setCharacters([...characters, defaultChar]);
  };

  // Step 4: Handle Character Creation
  const handleAddCharacter = () => {
    if (!newCharacter.name || !newCharacter.role) return;
    setCharacters([...characters, newCharacter]);
    setNewCharacter({ name: "", role: "", personality: "", emoji: "😊", avatar: null });
    setIsAddingCharacter(false);
  };
  
  const handleRemoveCharacter = (index) => {
    const newChars = [...characters];
    newChars.splice(index, 1);
    setCharacters(newChars);
  };

  // Step 4: Continue after creating characters
  const handleConfirmCharacters = async () => {
    if (characters.length === 0) {
       setError("Please add at least one character");
       return;
    }
    
    setLoading(true);
    
    await addUserMessage(`Created ${characters.length} characters`);
    
    await updateCampaign({
      id: campaignId,
      currentStep: 5,
      characters: characters.map(c => ({
        name: c.name,
        description: `${c.role} - ${c.personality}. ${c.emoji || 'Image Avatar'}`,
        referenceImage: c.avatar || c.emoji // Store avatar URL or emoji
      })),
    });
    
    setActiveStep("script");
    
    await addAssistantMessage(
      `✅ Characters locked in!
      
**Step 5: Script Generation**
I'll create a 5-scene script based on your content, style, and these characters.

Click **Generate Script** to begin!`,
      [{ action: "Characters confirmed", status: "completed" }]
    );
    
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
        script: JSON.stringify(data.script),
        scenes: data.script.scenes?.map(s => ({
          id: s.id,
          title: s.title,
          description: s.visual || s.description || "",
          dialogue: s.narration || s.dialogue || "",
          characters: s.characters || [],
          location: "",
        })) || [],
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

**Step 6: Select Location**
Choose a background location for your video from the options below. Once selected, click "Generate Video" to create your content.`,
      [{ action: "Script approved", status: "completed" }]
    );
    
    setLoading(false);
  };

  // Step 6: Select location
  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
    setGeneratedMedia(null); // Reset any previously generated media
  };

  // Build comprehensive prompt with all context
  const buildContextualPrompt = (location) => {
    const style = VISUAL_STYLES.find(s => s.id === selectedStyle);
    const brandName = campaign?.brandName || "";
    const brandColors = campaign?.brandColors?.join(", ") || "";
    
    // Get scene descriptions from script
    const sceneDescriptions = script?.scenes?.map(s => s.visual).join(". ") || "";
    
    // Get character info
    const characterInfo = characters.map(c => 
      `${c.name} (${c.role}): ${c.appearance || c.personality}`
    ).join("; ") || "";
    
    // Build comprehensive prompt
    let prompt = `${location.name} scene for ${brandName} advertisement. `;
    prompt += `${style?.name || 'Cinematic'} style. `;
    
    if (brandColors) {
      prompt += `Brand colors: ${brandColors}. `;
    }
    
    if (characterInfo) {
      prompt += `Characters: ${characterInfo}. `;
    }
    
    if (sceneDescriptions) {
      prompt += `Scene context: ${sceneDescriptions.substring(0, 200)}. `;
    }
    
    prompt += `Professional video advertisement, high quality, ${style?.desc || 'cinematic lighting'}.`;
    
    return prompt;
  };

  // Step 6: Generate video with image fallback
  const handleGenerateMedia = async () => {
    if (!selectedLocation || generatingMedia) return;
    
    setGeneratingMedia(true);
    setGeneratedMedia(null);
    
    const location = LOCATION_ASSETS.find(l => l.id === selectedLocation);
    
    // Build comprehensive prompt with full context
    const prompt = buildContextualPrompt(location);
    
    console.log("Generating media with context:", {
      location: location.name,
      style: selectedStyle,
      brandName: campaign?.brandName,
      charactersCount: characters.length,
      hasScript: !!script,
      prompt: prompt.substring(0, 200) + "..."
    });
    
    try {
      await addUserMessage(`Generate video with ${location.name} location using ${videoGenerationMethod === 'scraper' ? 'Web Scraper' : 'Standard API'}`);
      
      let videoResponse;
      
      if (videoGenerationMethod === 'scraper') {
        // Use Luma Web Scraper
         videoResponse = await fetch("/api/studio/generate-luma-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
          }),
        });
      } else {
        // Use Standard API (Fal/Gemini)
        videoResponse = await fetch("/api/studio/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            imageUrl: location.image,
            duration: 5,
          }),
        });
      }
      
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        if (videoData.success && videoData.videoUrl) {
          setGeneratedMedia({ type: "video", url: videoData.videoUrl });
          await addAssistantMessage(
            `🎬 **Video Generated!**

Your video has been created successfully using the ${location.name} location.

**Context applied:**
- Brand: ${campaign?.brandName || 'N/A'}
- Style: ${VISUAL_STYLES.find(s => s.id === selectedStyle)?.name || 'Cinematic'}
- Characters: ${characters.length > 0 ? characters.map(c => c.name).join(', ') : 'None'}
- Script scenes: ${script?.scenes?.length || 0}`,
            [
              { action: "Video generation", status: "completed" },
            ]
          );
          setGeneratingMedia(false);
          return;
        }
      }
      
      // Fallback to Stability AI image
      await addAssistantMessage(
        `⚠️ Video generation taking longer than expected. Generating image instead...`,
        [{ action: "Video generation", status: "fallback" }]
      );
      
      const imageResponse = await fetch("/api/studio/generate-stability-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
        }),
      });
      
      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || "Both video and image generation failed");
      }
      
      const imageData = await imageResponse.json();
      
      if (imageData.success && imageData.imageUrl) {
        setGeneratedMedia({ type: "image", url: imageData.imageUrl });
        await addAssistantMessage(
          `🖼️ **Image Generated!**

Created a ${location.name} background image using Stability AI.

**Context applied:**
- Brand: ${campaign?.brandName || 'N/A'}
- Style: ${VISUAL_STYLES.find(s => s.id === selectedStyle)?.name || 'Cinematic'}
- Characters: ${characters.length > 0 ? characters.map(c => c.name).join(', ') : 'None'}`,
          [
            { action: "Stability AI image generation", status: "completed" },
          ]
        );
      } else {
        throw new Error("No image generated");
      }

    } catch (err) {
      setError(err.message || "Failed to generate media");
      await addAssistantMessage("❌ Media generation failed. Please try again.");
    }
    
    setGeneratingMedia(false);
  };

  // Step 6: Continue to posting
  const handleContinueToPosting = async () => {
    setLoading(true);
    
    await addUserMessage("Media ready, continue to posting");
    
    await updateCampaign({
      id: campaignId,
      currentStep: 7,
    });
    
    setActiveStep("posting");
    
    await addAssistantMessage(
      `✅ Your ${generatedMedia?.type || 'content'} is ready!

**Step 7: Post & Save**
You can now:
• 🦋 **Share to Bluesky** - Post directly to your Bluesky account
• 💾 **Save as Draft** - Save this project for later
• ⬇️ **Download** - Download your generated media`,
      [{ action: "Media generation completed", status: "completed" }]
    );
    
    setLoading(false);
  };

  // Save project as draft
  const handleSaveAsDraft = async () => {
    setLoading(true);
    
    try {
      // Only pass fields that exist in the schema
      const updateData = {
        id: campaignId,
        status: "draft",
      };
      
      // Store video/image URL in finalVideoUrl if available
      if (generatedMedia?.url) {
        updateData.finalVideoUrl = generatedMedia.url;
      }
      
      await updateCampaign(updateData);

      
      await addAssistantMessage(
        `💾 **Project Saved as Draft!**

Your project has been saved and you can continue working on it anytime from your dashboard.`,
        [{ action: "Saved as draft", status: "completed" }]
      );
    } catch (err) {
      setError(err.message || "Failed to save draft");
    }
    
    setLoading(false);
  };


  // Post generated media to Bluesky
  const handlePostToBluesky = async () => {
    if (!generatedMedia || postingToBluesky) return;
    
    setPostingToBluesky(true);
    
    try {
      const location = LOCATION_ASSETS.find(l => l.id === selectedLocation);
      const style = VISUAL_STYLES.find(s => s.id === selectedStyle);
      
      // Create post content
      const postContent = `✨ New ${style?.name || 'AI'} artwork generated!

📍 Location: ${location?.name || 'Custom'}
🎨 Brand: ${campaign?.brandName || 'My Project'}
🤖 Created with AI Video Studio

#AIArt #GenerativeAI #${campaign?.brandName?.replace(/\s+/g, '') || 'AICreation'}`;

      // Helper function to compress image using canvas
      const compressImage = async (imageUrl, maxSizeBytes = 900000) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');

          
          // Only set crossOrigin for non-data URLs
          if (!imageUrl.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
          }
          
          img.onload = () => {
            let { width, height } = img;
            
            // Start by reducing dimensions if very large
            const maxDimension = 1200;
            if (width > maxDimension || height > maxDimension) {
              const ratio = Math.min(maxDimension / width, maxDimension / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Start with lower quality
            let quality = 0.7;
            
            const tryCompress = () => {
              canvas.toBlob((result) => {
                if (!result) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                
                console.log(`Trying quality ${quality}: ${(result.size / 1024).toFixed(1)}KB`);
                
                if (result.size <= maxSizeBytes || quality <= 0.2) {
                  console.log(`Final compressed: ${(result.size / 1024).toFixed(1)}KB`);
                  resolve(result);
                } else {
                  quality -= 0.1;
                  // Also reduce dimensions more aggressively
                  if (quality <= 0.4 && width > 600) {
                    width = Math.round(width * 0.7);
                    height = Math.round(height * 0.7);
                    canvas.width = width;
                    canvas.height = height;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                  }
                  tryCompress();
                }
              }, 'image/jpeg', quality);
            };
            
            tryCompress();
          };
          
          img.onerror = (e) => {
            console.error('Image load error:', e);
            reject(new Error('Failed to load image for compression'));
          };
          
          img.src = imageUrl;
        });
      };

      // Convert image URL/base64 to blob and compress if needed
      let imageBlob;
      try {
        // Use compression for all images to ensure they're under 1MB
        imageBlob = await compressImage(generatedMedia.url);
        console.log(`Image size after compression: ${(imageBlob.size / 1024).toFixed(1)}KB`);
      } catch (compressErr) {
        // Fallback to original conversion if compression fails
        console.error('Compression failed:', compressErr);
        throw new Error(`Image compression failed: ${compressErr.message}. Please try downloading and uploading manually.`);
      }


      // Create form data
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('media', imageBlob, 'generated-image.jpg');
      formData.append('mediaType', 'image');
      formData.append('altText', `${style?.name || 'AI'} generated ${location?.name || 'scene'} for ${campaign?.brandName || 'project'}`);

      const result = await fetch('/api/bluesky', {
        method: 'POST',
        body: formData,
      });


      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || 'Failed to post to Bluesky');
      }

      await addAssistantMessage(
        `🦋 **Posted to Bluesky!**

Your generated ${generatedMedia.type} has been shared successfully.

[View Post →](https://bsky.app/profile/${process.env.NEXT_PUBLIC_BLUESKY_HANDLE || 'your-handle'})`,
        [{ action: "Shared to Bluesky", status: "completed" }]
      );
    } catch (err) {
      setError(err.message || "Failed to post to Bluesky");
      await addAssistantMessage(`❌ Failed to post to Bluesky: ${err.message}`);
    }
    
    setPostingToBluesky(false);
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

                          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                            {parseAndStyleMessage(msg.content)}
                          </div>
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

              {/* Step 4: Character Actions - Pre-defined profiles */}
              {activeStep === "characters" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Show character cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {characters.map((char, i) => (
                      <div 
                        key={i} 
                        className="relative p-3 rounded-xl border border-gray-700 bg-gray-800/50 group"
                      >
                        <button 
                          onClick={() => handleRemoveCharacter(i)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                        <div className="text-3xl mb-1 text-center flex justify-center">
                            {char.avatar ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-600">
                                    <img src={char.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                char.emoji
                            )}
                        </div>
                        <p className="font-medium text-sm text-white text-center">{char.name}</p>
                        <p className="text-xs text-gray-400 text-center">{char.role}</p>
                      </div>
                    ))}
                    
                    {/* Add Character Button */}
                    {!isAddingCharacter && (
                      <button
                        onClick={() => setIsAddingCharacter(true)}
                        className="p-3 rounded-xl border border-dashed border-gray-700 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all flex flex-col items-center justify-center gap-2 h-full min-h-[120px]"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <Plus size={16} />
                        </div>
                        <span className="text-xs text-gray-400">Add Manual</span>
                      </button>
                    )}

                    {/* Add Default Character Button */}
                    <button
                        onClick={handleAddDefaultCharacter}
                        className="p-3 rounded-xl border border-dashed border-gray-700 hover:border-green-500/50 hover:bg-green-500/10 transition-all flex flex-col items-center justify-center gap-2 h-full min-h-[120px]"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <Plus size={16} className="text-green-500" />
                        </div>
                        <span className="text-xs text-gray-400 text-center">Add Default</span>
                    </button>

                    {/* Generate from Image Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={analyzingImage}
                        className="p-3 rounded-xl border border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-2 h-full min-h-[120px]"
                      >
                         {analyzingImage ? (
                           <Loader2 size={24} className="animate-spin text-purple-500" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                             <Sparkles size={16} className="text-purple-500" />
                           </div>
                         )}
                        <span className="text-xs text-gray-400 text-center">
                          {analyzingImage ? "Analyzing..." : "Generate from Image"}
                        </span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleGenerateFromImage}
                    />
                  </div>

                  {/* Add Character Form */}
                  {isAddingCharacter && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 space-y-3"
                    >
                      <h4 className="text-sm font-medium text-white mb-2">New Character</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Name (e.g. Alex)"
                          value={newCharacter.name}
                          onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                          className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                        />
                         <input
                          type="text"
                          placeholder="Role (e.g. Narrator)"
                          value={newCharacter.role}
                          onChange={(e) => setNewCharacter({...newCharacter, role: e.target.value})}
                          className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <input
                          type="text"
                          placeholder="Personality (e.g. Friendly, Professional)"
                          value={newCharacter.personality}
                          onChange={(e) => setNewCharacter({...newCharacter, personality: e.target.value})}
                          className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                        />
                         <div className="flex flex-col gap-1 items-center">
                            <label className="text-[10px] text-gray-500 uppercase">Avatar</label>
                             <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newCharacter.emoji || ''}
                                  placeholder="Emoji"
                                  onChange={(e) => setNewCharacter({...newCharacter, emoji: e.target.value, avatar: null})}
                                  className="w-12 h-9 bg-black/50 border border-gray-700 rounded-lg text-center text-lg focus:border-orange-500 outline-none"
                                />
                                <button 
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="w-9 h-9 border border-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-800"
                                >
                                    {newCharacter.avatar ? (
                                        <img src={newCharacter.avatar} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Image size={14} className="text-gray-400" />
                                    )}
                                </button>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={avatarInputRef} 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload} 
                                />
                             </div>
                         </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsAddingCharacter(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddCharacter}
                          disabled={!newCharacter.name || !newCharacter.role}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50"
                        >
                          Add Character
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Continue button */}
                  <div className="flex justify-center pt-2">
                    <ActionButton 
                      onClick={handleConfirmCharacters} 
                      icon={Check}
                      disabled={characters.length === 0}
                    >
                      Confirm {characters.length} Characters
                    </ActionButton>
                  </div>
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

              {/* Step 6: Location Selection & Media Generation */}
              {activeStep === "preprocessing" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Location Grid */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">1. Select a Location</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {LOCATION_ASSETS.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location.id)}
                          className={`relative rounded-xl overflow-hidden transition-all group ${
                            selectedLocation === location.id
                              ? "ring-2 ring-orange-500 scale-[1.02]"
                              : "hover:scale-[1.02] hover:ring-1 hover:ring-gray-600"
                          }`}
                        >
                          <img
                            src={location.image}
                            alt={location.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-xs font-medium text-white truncate">{location.name}</p>
                          </div>
                          {selectedLocation === location.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Check size={12} className="text-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generation Method Toggle */}
                  <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">2. Generation Method</h3>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${videoGenerationMethod === 'api' ? 'border-orange-500' : 'border-gray-600'}`}>
                          {videoGenerationMethod === 'api' && <div className="w-3 h-3 rounded-full bg-orange-500" />}
                        </div>
                        <input 
                          type="radio" 
                          name="genMethod" 
                          className="hidden" 
                          checked={videoGenerationMethod === 'api'}
                          onChange={() => setVideoGenerationMethod('api')} 
                        />
                        <div className="text-sm">
                          <div className="text-white font-medium">Standard API</div>
                          <div className="text-xs text-gray-500">Fal AI / Gemini</div>
                        </div>
                      </label>
                      
                       <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${videoGenerationMethod === 'scraper' ? 'border-orange-500' : 'border-gray-600'}`}>
                          {videoGenerationMethod === 'scraper' && <div className="w-3 h-3 rounded-full bg-orange-500" />}
                        </div>
                        <input 
                          type="radio" 
                          name="genMethod" 
                          className="hidden" 
                          checked={videoGenerationMethod === 'scraper'}
                          onChange={() => setVideoGenerationMethod('scraper')} 
                        />
                         <div className="text-sm">
                          <div className="text-white font-medium">Web Scraper</div>
                          <div className="text-xs text-gray-500">Grok / Luma (Experimental)</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Generate Media Button */}
                  {selectedLocation && !generatedMedia && (
                    <div className="flex justify-center">
                      <ActionButton
                        onClick={handleGenerateMedia}
                        icon={Film}
                        loading={generatingMedia}
                        disabled={generatingMedia}
                      >
                        {generatingMedia ? "Generating..." : "Generate Video"}
                      </ActionButton>
                    </div>
                  )}

                  {/* Media Generation Loading */}
                  {generatingMedia && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 text-center"
                    >
                      <Loader2 className="animate-spin text-orange-400 mx-auto mb-3" size={32} />
                      <p className="text-gray-300">Generating your media...</p>
                      <p className="text-xs text-gray-500 mt-1">This may take a minute</p>
                    </motion.div>
                  )}

                  {/* Generated Media Display */}
                  {generatedMedia && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden"
                    >
                      {generatedMedia.type === "video" ? (
                        <video
                          src={generatedMedia.url}
                          controls
                          autoPlay
                          loop
                          className="w-full rounded-t-xl"
                        />
                      ) : (
                        <img
                          src={generatedMedia.url}
                          alt="Generated"
                          className="w-full rounded-t-xl"
                        />
                      )}
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                            {parseAndStyleMessage(msg.content)}
                          </div>
                          <p className="text-sm font-medium text-white">
                            {generatedMedia.type === "video" ? "🎬 Video Generated" : "🖼️ Image Generated"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {LOCATION_ASSETS.find(l => l.id === selectedLocation)?.name} location
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handlePostToBluesky}
                            disabled={postingToBluesky || generatedMedia.type === "video"}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title={generatedMedia.type === "video" ? "Video posting not supported yet" : "Share to Bluesky"}
                          >
                            {postingToBluesky ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Share2 size={16} />
                            )}
                          </button>
                          <a
                            href={generatedMedia.url}
                            download={`generated-${generatedMedia.type}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* Continue Button */}
                  {generatedMedia && !loading && (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <ActionButton onClick={handleContinueToPosting} icon={ArrowRight}>
                        Continue to Post & Save
                      </ActionButton>
                      <ActionButton
                        onClick={() => {
                          setGeneratedMedia(null);
                          setSelectedLocation(null);
                        }}
                        variant="secondary"
                        icon={RefreshCw}
                      >
                        Try Different Location
                      </ActionButton>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 7: Posting Step */}
              {activeStep === "posting" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Media Preview */}
                  {generatedMedia && (
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                      {generatedMedia.type === "video" ? (
                        <video
                          src={generatedMedia.url}
                          controls
                          className="w-full max-h-64 object-contain"
                        />
                      ) : (
                        <img
                          src={generatedMedia.url}
                          alt="Generated"
                          className="w-full max-h-64 object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Share to Bluesky */}
                    <button
                      onClick={handlePostToBluesky}
                      disabled={postingToBluesky || generatedMedia?.type === "video"}
                      className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {postingToBluesky ? (
                          <Loader2 className="animate-spin text-blue-400" size={24} />
                        ) : (
                          <Share2 className="text-blue-400" size={24} />
                        )}
                        <span className="font-semibold text-white">
                          {postingToBluesky ? "Posting..." : "Share to Bluesky"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Post to your Bluesky account</p>
                    </button>

                    {/* Save as Draft */}
                    <button
                      onClick={handleSaveAsDraft}
                      disabled={loading}
                      className="p-4 rounded-xl bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Check className="text-green-400" size={24} />
                        <span className="font-semibold text-white">Save as Draft</span>
                      </div>
                      <p className="text-xs text-gray-400">Save project for later</p>
                    </button>

                    {/* Download */}
                    <a
                      href={generatedMedia?.url}
                      download={`${campaign?.brandName || 'generated'}-${generatedMedia?.type || 'media'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-gray-700/20 border border-gray-600/30 hover:bg-gray-700/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Download className="text-gray-400" size={24} />
                        <span className="font-semibold text-white">Download</span>
                      </div>
                      <p className="text-xs text-gray-400">Download your {generatedMedia?.type || 'media'}</p>
                    </a>
                  </div>

                  {/* Back to Dashboard */}
                  <div className="flex justify-center pt-4">
                    <ActionButton
                      onClick={() => router.push('/dashboard')}
                      variant="ghost"
                      icon={ArrowLeft}
                    >
                      Back to Dashboard
                    </ActionButton>
                  </div>
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

        {/* Sidebar - Sticky */}
        <aside className="w-72 border-l border-gray-800 bg-[#0a0a0a] overflow-y-auto sticky top-0 h-screen">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Progress</h3>
              <span className="text-xs text-gray-500">{WORKFLOW_STEPS.findIndex(s => s.id === activeStep) + 1}/{WORKFLOW_STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${((WORKFLOW_STEPS.findIndex(s => s.id === activeStep) + 1) / WORKFLOW_STEPS.length) * 100}%` }}
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
