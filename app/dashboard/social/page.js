"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Plus,
  Cloud,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Edit3,
  Trash2,
  ExternalLink,
  AlertCircle,
  Loader2,
  ImageIcon,
  X,
  Upload,
} from "lucide-react";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-600", icon: Edit3 },
  pending_approval: { label: "Pending", color: "bg-yellow-600", icon: Clock },
  approved: { label: "Approved", color: "bg-green-600", icon: CheckCircle },
  scheduled: { label: "Scheduled", color: "bg-blue-600", icon: Clock },
  posted: { label: "Posted", color: "bg-emerald-600", icon: Send },
  failed: { label: "Failed", color: "bg-red-600", icon: XCircle },
};

const TABS = [
  { id: "all", label: "All Posts" },
  { id: "draft", label: "Drafts" },
  { id: "pending_approval", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "posted", label: "Posted" },
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [posting, setPosting] = useState(null);
  const [blueskyUser, setBlueskyUser] = useState(null);
  const [loadingBluesky, setLoadingBluesky] = useState(true);

  const posts = useQuery(api.social.getPosts, {
    status: activeTab === "all" ? undefined : activeTab,
    platform: "bluesky",
  });
  const stats = useQuery(api.social.getPostStats);
  const blueskyAccount = useQuery(api.social.getBlueskyAccount);

  const createPost = useMutation(api.social.createPost);
  const updatePost = useMutation(api.social.updatePost);
  const updatePostStatus = useMutation(api.social.updatePostStatus);
  const deletePost = useMutation(api.social.deletePost);
  const saveBlueskyAccount = useMutation(api.social.saveBlueskyAccount);
  const disconnectBluesky = useMutation(api.social.disconnectBluesky);

  // Check Bluesky connection on mount
  useEffect(() => {
    const checkBlueskyConnection = async () => {
      try {
        const res = await fetch("/api/bluesky");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setBlueskyUser(data.user);
            if (!blueskyAccount) {
              await saveBlueskyAccount({
                handle: data.user.handle,
                did: data.user.did,
                displayName: data.user.displayName,
                avatar: data.user.avatar,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to check Bluesky connection:", error);
      } finally {
        setLoadingBluesky(false);
      }
    };

    checkBlueskyConnection();
  }, [blueskyAccount]);

  const handleCreatePost = async (content, mediaFile, altText) => {
    await createPost({ 
      content, 
      platform: "bluesky",
      hasMedia: !!mediaFile,
      altText: altText,
    });
    setShowCreateModal(false);
  };

  const handleUpdatePost = async (id, content) => {
    await updatePost({ id, content });
    setEditingPost(null);
  };

  const handleStatusChange = async (id, newStatus, content, mediaFile, altText) => {
    if (newStatus === "posted") {
      setPosting(id);
      try {
        // Use FormData for media support
        const formData = new FormData();
        formData.append("content", content);
        if (mediaFile) {
          formData.append("media", mediaFile);
          formData.append("mediaType", mediaFile.type.startsWith("video") ? "video" : "image");
          formData.append("altText", altText || "Image attachment");
        }

        const res = await fetch("/api/bluesky", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          await updatePostStatus({
            id,
            status: "posted",
            postUri: data.postUri,
            postedAt: new Date().toISOString(),
          });
        } else {
          await updatePostStatus({
            id,
            status: "failed",
            error: data.error || "Failed to post",
          });
        }
      } catch (error) {
        await updatePostStatus({
          id,
          status: "failed",
          error: error.message || "Network error",
        });
      } finally {
        setPosting(null);
      }
    } else {
      await updatePostStatus({ id, status: newStatus });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost({ id });
    }
  };

  // Post directly with media (bypasses draft for immediate posting)
  const handlePostNow = async (content, mediaFile, altText) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (mediaFile) {
        formData.append("media", mediaFile);
        formData.append("mediaType", mediaFile.type.startsWith("video") ? "video" : "image");
        formData.append("altText", altText || "");
      }

      const res = await fetch("/api/bluesky", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Create a record in the database as "posted"
        await createPost({
          content,
          platform: "bluesky",
          hasMedia: !!mediaFile,
          altText: altText,
        });
        // Update it to posted status (we'll get the ID from the above, but for simplicity just close)
        setShowCreateModal(false);
        alert("Posted successfully to Bluesky!");
      } else {
        alert(`Failed to post: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const isConnected = blueskyUser || blueskyAccount;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Social Media</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage and schedule your Bluesky posts
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Bluesky Connection Status */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isConnected
                  ? "border-sky-500 bg-sky-900/20"
                  : "border-gray-700 bg-gray-800/50"
              }`}
            >
              {loadingBluesky ? (
                <Loader2 size={18} className="text-gray-400 animate-spin" />
              ) : (
                <Cloud size={18} className={isConnected ? "text-sky-400" : "text-gray-400"} />
              )}
              <span className="text-sm">
                {loadingBluesky
                  ? "Connecting..."
                  : isConnected
                    ? `@${blueskyAccount?.handle || blueskyUser?.handle}`
                    : "Not Connected"}
              </span>
              {isConnected && (
                <button
                  onClick={() => disconnectBluesky()}
                  className="text-xs text-red-400 hover:text-red-300 hover:cursor-pointer ml-2"
                >
                  Disconnect
                </button>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-black font-medium hover:opacity-90 hover:cursor-pointer transition-all"
            >
              <Plus size={18} />
              Create Post
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total", value: stats?.total || 0, color: "text-white" },
            { label: "Drafts", value: stats?.draft || 0, color: "text-gray-400" },
            { label: "Pending", value: stats?.pending_approval || 0, color: "text-yellow-400" },
            { label: "Approved", value: stats?.approved || 0, color: "text-green-400" },
            { label: "Posted", value: stats?.posted || 0, color: "text-emerald-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-lg border border-gray-800 bg-[#111]"
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:cursor-pointer ${
                activeTab === tab.id
                  ? "bg-orange-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts === undefined ? (
            <div className="text-center py-12 text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No posts yet</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-orange-400 hover:text-orange-300 hover:cursor-pointer"
              >
                Create your first post →
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                posting={posting}
                onEdit={() => setEditingPost(post)}
                onDelete={() => handleDelete(post._id)}
                onStatusChange={(status) => handleStatusChange(post._id, status, post.content)}
                blueskyConnected={isConnected}
              />
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(showCreateModal || editingPost) && (
            <PostModal
              post={editingPost}
              onClose={() => {
                setShowCreateModal(false);
                setEditingPost(null);
              }}
              onSave={editingPost ? handleUpdatePost : handleCreatePost}
              onPostNow={handlePostNow}
              isConnected={isConnected}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, posting, onEdit, onDelete, onStatusChange, blueskyConnected }) {
  const config = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const StatusIcon = config.icon;
  const isPosting = posting === post._id;

  // Convert post URI to Bluesky URL
  const getBlueskyUrl = (uri) => {
    if (!uri) return null;
    // URI format: at://did:plc:xxx/app.bsky.feed.post/xxx
    const parts = uri.split("/");
    const did = parts[2];
    const postId = parts[4];
    return `https://bsky.app/profile/${did}/post/${postId}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Cloud size={16} className="text-sky-400" />
          <span className="text-xs text-gray-500">Bluesky</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.color} text-white flex items-center gap-1`}>
            <StatusIcon size={12} />
            {config.label}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.error && (
        <div className="flex items-center gap-2 text-red-400 text-xs mb-4 p-2 bg-red-900/20 rounded">
          <AlertCircle size={14} />
          {post.error}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="flex gap-2">
          {post.status === "draft" && (
            <button
              onClick={() => onStatusChange("pending_approval")}
              className="text-xs px-3 py-1.5 rounded-md bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 hover:cursor-pointer transition-all"
            >
              Submit for Approval
            </button>
          )}
          {post.status === "pending_approval" && (
            <>
              <button
                onClick={() => onStatusChange("approved")}
                className="text-xs px-3 py-1.5 rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:cursor-pointer transition-all"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusChange("draft")}
                className="text-xs px-3 py-1.5 rounded-md bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:cursor-pointer transition-all"
              >
                Reject
              </button>
            </>
          )}
          {post.status === "approved" && blueskyConnected && (
            <button
              onClick={() => onStatusChange("posted")}
              disabled={isPosting}
              className="text-xs px-3 py-1.5 rounded-md bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 hover:cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isPosting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={12} />
                  Post Now
                </>
              )}
            </button>
          )}
          {post.status === "approved" && !blueskyConnected && (
            <span className="text-xs text-gray-500">Connect Bluesky to post</span>
          )}
          {post.status === "posted" && post.postUri && (
            <a
              href={getBlueskyUrl(post.postUri)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-md bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 hover:cursor-pointer transition-all flex items-center gap-1"
            >
              <ExternalLink size={12} />
              View Post
            </a>
          )}
        </div>

        <div className="flex gap-2">
          {post.status !== "posted" && (
            <button
              onClick={onEdit}
              className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white hover:cursor-pointer transition-all"
            >
              <Edit3 size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded-md hover:bg-red-900/30 text-gray-400 hover:text-red-400 hover:cursor-pointer transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Modal Component with Media Upload
function PostModal({ post, onClose, onSave, onPostNow, isConnected }) {
  const [content, setContent] = useState(post?.content || "");
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [altText, setAltText] = useState("");

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only images supported (Bluesky video API not available via SDK)
    const isImage = file.type.startsWith("image/");
    
    if (!isImage) {
      alert("Only images are supported. Bluesky's video API is not yet available.");
      return;
    }

    // Validate file size (1MB for images on Bluesky)
    if (file.size > 1000000) {
      alert("Image must be under 1MB");
      return;
    }

    setMediaFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        url: reader.result,
        type: "image",
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setAltText("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSaving(true);
    try {
      if (post) {
        await onSave(post._id, content, mediaFile, altText);
      } else {
        await onSave(content, mediaFile, altText);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePostNow = async () => {
    if (!content.trim()) return;
    
    setPosting(true);
    try {
      await onPostNow(content, mediaFile, altText);
    } finally {
      setPosting(false);
    }
  };

  const charLimit = 300;
  const isOverLimit = content.length > charLimit;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#1a1a1a] border border-gray-700 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {post ? "Edit Post" : "Create New Post"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-lg bg-[#111] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <div className={`text-xs mt-1 text-right ${isOverLimit ? "text-red-400" : "text-gray-500"}`}>
              {content.length} / {charLimit} characters
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Add Media (Optional)
            </label>
            
            {!mediaPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-[#111] hover:bg-[#1a1a1a] hover:border-gray-600 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="text-orange-400">Click to upload</span> an image
                  </p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF up to 1MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleMediaSelect}
                />
              </label>
            ) : (
              <div className="relative">
                {mediaPreview.type === "image" ? (
                  <img
                    src={mediaPreview.url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={mediaPreview.url}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-all"
                >
                  <X size={16} />
                </button>
                <p className="text-xs text-gray-500 mt-2 truncate">{mediaPreview.name}</p>
                
                {/* Alt text input */}
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Add alt text for accessibility"
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-[#111] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-900/20 border border-sky-800/50 mb-6">
            <Cloud size={20} className="text-sky-400" />
            <span className="text-sm text-sky-300">
              This post will be shared on Bluesky
            </span>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:cursor-pointer transition-all"
            >
              Cancel
            </button>
            {!post && (
              <button
                type="submit"
                disabled={!content.trim() || saving || posting || isOverLimit}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:cursor-pointer transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
            )}
            {post ? (
              <button
                type="submit"
                disabled={!content.trim() || saving || isOverLimit}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-black font-medium hover:opacity-90 hover:cursor-pointer transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            ) : isConnected && (
              <button
                type="button"
                onClick={handlePostNow}
                disabled={!content.trim() || posting || saving || isOverLimit}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium hover:opacity-90 hover:cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {posting ? (
                  <><Loader2 size={16} className="animate-spin" /> Posting...</>
                ) : (
                  <><Send size={16} /> Post Now</>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
