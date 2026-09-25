"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  Camera,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  Brain,
  Eye,
  Compass,
  Target,
  Box,
  MessageCircle,
  Send,
  MousePointerClick,
  ScanSearch,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

// ── Types ─────────────────────────────────────────────────────

interface KnowledgeResult {
  found: boolean;
  source: "spaceatlas" | "wikipedia";
  displayName: string;
  description: string;
  imageUrl: string;
  wikiUrl?: string;
  spaceatlasPath?: string;
  details: Record<string, string | number | boolean | undefined>;
}

interface IdentifiedObject {
  displayName: string;
  className: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x_min, y_min, x_max, y_max]
  category: string;
  observation: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

type ScannerState =
  | "IDLE"
  | "IMAGE_LOADED"
  | "IDENTIFYING"
  | "OBJECT_FOUND"
  | "NO_OBJECT"
  | "CHATTING";

// ── Constants ─────────────────────────────────────────────────

const SAMPLE_IMAGES = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter_OPAL_2024.png",
    label: "Jupiter",
    hint: "Gas Giant • Great Red Spot",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg",
    label: "Saturn",
    hint: "Ring System • Gas Giant",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg",
    label: "Black Hole M87",
    hint: "Event Horizon • EHT",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg",
    label: "Orion Nebula",
    hint: "Stellar Nursery • M42",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
    label: "Mars",
    hint: "Red Planet • Valles Marineris",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/be/GPN-2000-001437.jpg",
    label: "Saturn V Launch",
    hint: "Apollo 11 • Rocket",
  },
];

// ── Helper Components ─────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 0.85
      ? "linear-gradient(90deg, #34d399, #22d3ee)"
      : value >= 0.7
      ? "linear-gradient(90deg, #38bdf8, #818cf8)"
      : "linear-gradient(90deg, #fbbf24, #f472b6)";
  return (
    <div className="relative h-2 w-full rounded-full bg-space-800 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%`, background: color }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | boolean | undefined }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-space-800/60 last:border-0">
      <span className="text-space-400 text-xs font-mono uppercase tracking-wider">{label}</span>
      <span className="text-space-100 text-sm font-medium text-right max-w-[60%] truncate">{display}</span>
    </div>
  );
}

// ── Click Ripple Animation ────────────────────────────────────

function ClickRipple({ x, y, active }: { x: number; y: number; active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute pointer-events-none z-20" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="absolute -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 animate-ping opacity-75" />
        <div className="absolute inset-0 w-8 h-8 rounded-full border border-cyan-300 animate-pulse" />
        <div className="absolute inset-2 w-4 h-4 rounded-full bg-cyan-400/30 animate-pulse" />
      </div>
    </div>
  );
}

// ── Bounding Box Overlay ──────────────────────────────────────

function BoundingBox({
  bbox,
  label,
  confidence,
}: {
  bbox: [number, number, number, number];
  label: string;
  confidence: number;
}) {
  const [xMin, yMin, xMax, yMax] = bbox;
  const left = xMin * 100;
  const top = yMin * 100;
  const width = (xMax - xMin) * 100;
  const height = (yMax - yMin) * 100;

  return (
    <div
      className="absolute pointer-events-none z-10 transition-all duration-700 ease-out animate-in fade-in"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        border: "2px solid #22d3ee",
        boxShadow: "0 0 16px #22d3ee60, inset 0 0 12px #22d3ee15",
        borderRadius: "6px",
        background: "rgba(34, 211, 238, 0.06)",
      }}
    >
      <div className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-t-md text-[11px] font-mono font-bold whitespace-nowrap bg-cyan-500 text-black">
        <Target className="w-3 h-3" />
        {label}
        <span className="opacity-70">{(confidence * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function SpaceScannerPage() {
  const [state, setState] = useState<ScannerState>("IDLE");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Click-to-identify state
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [showRipple, setShowRipple] = useState(false);
  const [identifiedObject, setIdentifiedObject] = useState<IdentifiedObject | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeResult | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [noObjectMessage, setNoObjectMessage] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Image upload ──
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setScanError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setState("IMAGE_LOADED");
      resetDetection();
    };
    reader.readAsDataURL(file);
  }, []);

  const resetDetection = () => {
    setClickPos(null);
    setShowRipple(false);
    setIdentifiedObject(null);
    setKnowledge(null);
    setSuggestedQuestions([]);
    setNoObjectMessage(null);
    setChatMessages([]);
    setShowChat(false);
    setScanError(null);
  };

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setFileName("");
    setState("IDLE");
    resetDetection();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSampleImage = useCallback((url: string, label: string) => {
    setUploadedImage(url);
    setFileName(label);
    setState("IMAGE_LOADED");
    resetDetection();
  }, []);

  // ── Click-to-Identify ──
  const handleImageClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!uploadedImage || state === "IDENTIFYING") return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Clamp to [0, 1]
      const clickX = Math.max(0, Math.min(1, x));
      const clickY = Math.max(0, Math.min(1, y));

      setClickPos({ x: clickX, y: clickY });
      setShowRipple(true);
      setIdentifiedObject(null);
      setKnowledge(null);
      setNoObjectMessage(null);
      setChatMessages([]);
      setShowChat(false);
      setState("IDENTIFYING");
      setScanError(null);

      // Kill ripple after animation
      setTimeout(() => setShowRipple(false), 1500);

      try {
        const res = await fetch("/api/space-scanner/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: uploadedImage,
            clickX,
            clickY,
            mimeType: uploadedImage.startsWith("data:")
              ? uploadedImage.substring(uploadedImage.indexOf(":") + 1, uploadedImage.indexOf(";"))
              : "image/jpeg",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setScanError(data.message || data.error || "Identification failed");
          setState("IMAGE_LOADED");
          return;
        }

        if (data.noObject) {
          setNoObjectMessage(data.message || "No identifiable object at this location.");
          setState("NO_OBJECT");
          // Auto-reset to IMAGE_LOADED after 3s
          setTimeout(() => {
            setState((s) => (s === "NO_OBJECT" ? "IMAGE_LOADED" : s));
            setNoObjectMessage(null);
          }, 4000);
          return;
        }

        setIdentifiedObject(data.object);
        setKnowledge(data.knowledge || null);
        setSuggestedQuestions(data.suggestedQuestions || []);
        setState("OBJECT_FOUND");
      } catch (err: unknown) {
        setScanError((err as Error).message || "Failed to identify. Please try again.");
        setState("IMAGE_LOADED");
      }
    },
    [uploadedImage, state]
  );

  // ── Chat ──
  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !identifiedObject || chatLoading) return;

      const userMsg: ChatMessage = { role: "user", text: message.trim() };
      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setChatLoading(true);
      setState("CHATTING");

      try {
        const res = await fetch("/api/space-scanner/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.trim(),
            context: {
              object: {
                objectName: identifiedObject.displayName,
                className: identifiedObject.className,
                category: identifiedObject.category,
                observation: identifiedObject.observation,
                knowledgeSummary: knowledge?.description,
              },
              previousMessages: chatMessages,
            },
          }),
        });

        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: "assistant",
          text: data.answer || "I couldn't generate a response. Please try again.",
        };
        setChatMessages((prev) => [...prev, assistantMsg]);

        if (data.suggestedFollowups?.length) {
          setSuggestedQuestions(data.suggestedFollowups);
        }
      } catch {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Connection error. Please try again." },
        ]);
      } finally {
        setChatLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    },
    [identifiedObject, knowledge, chatMessages, chatLoading]
  );

  // ── Render ──
  return (
    <div className="relative min-h-screen">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-accent-purple/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent-blue/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* ── Hero ── */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-micro mb-5">
            <ScanSearch className="w-3.5 h-3.5" />
            CLICK-TO-IDENTIFY VISUAL SEARCH ENGINE
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display gradient-text mb-4">
            SPACE SCANNER
          </h1>
          <p className="text-space-400 max-w-2xl mx-auto text-base sm:text-lg">
            Upload any space image and <strong className="text-space-200">click on any object</strong> to
            identify it. Our multimodal AI engine detects planets, moons, spacecraft, nebulae, and
            deep-space objects — then lets you ask questions about them.
          </p>

          {/* Architecture badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/60 border border-cyan-500/30">
              <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-space-200 font-semibold">Click to Identify</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/60 border border-purple-500/30">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-space-200 font-semibold">Multimodal AI</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/60 border border-amber-500/30">
              <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-space-200 font-semibold">NLP Chat</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/60 border border-space-700/50">
              <Compass className="w-3.5 h-3.5 text-accent-amber" />
              <span className="text-xs text-space-200">Knowledge: SpaceAtlas + Wikipedia</span>
            </div>
          </div>
        </header>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* ═══ LEFT: Upload & Image Canvas (3 cols) ═══ */}
          <div className="lg:col-span-3 space-y-6">
            {state === "IDLE" ? (
              <>
                {/* Upload zone */}
                <div
                  className={`glass-card p-8 sm:p-12 transition-all duration-300 cursor-pointer group text-center border-dashed ${
                    isDragging ? "border-accent-blue/80 bg-accent-blue/10 scale-[1.01]" : "hover:border-accent-blue/40"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
                  <div className="w-20 h-20 rounded-2xl bg-space-800/80 border border-space-700/50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:border-accent-blue/50 transition-all duration-300">
                    <Upload className="w-9 h-9 text-accent-blue group-hover:text-accent-cyan transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-space-100 mb-2">Drop a space image here, or browse</h3>
                  <p className="text-space-400 text-sm max-w-sm mx-auto mb-4">
                    Upload any image, then click on objects to identify them. Works with planets, rockets, nebulae, galaxies, and more.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent-blue font-micro">
                    <Camera className="w-3.5 h-3.5" /> CLICK TO SELECT FILE
                  </span>
                </div>

                {/* Sample images */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-micro text-space-400">OR TRY A SAMPLE IMAGE</h3>
                    <span className="text-xs text-space-500">{SAMPLE_IMAGES.length} curated</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SAMPLE_IMAGES.map((s) => (
                      <button key={s.label} onClick={() => handleSampleImage(s.url, s.label)} type="button"
                        className="group text-left p-2.5 rounded-xl bg-space-800/40 border border-space-700/40 hover:border-accent-blue/40 hover:bg-space-800/70 transition-all duration-200">
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-space-900">
                          <img src={s.url} alt={s.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <p className="text-space-200 font-medium text-xs truncate">{s.label}</p>
                        <p className="text-space-500 text-[10px] truncate">{s.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── Image Canvas with click-to-identify ── */}
                <div className="glass-card p-4 sm:p-6">
                  <div
                    ref={imageRef}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-space-950 border border-space-800 ${
                      state === "IDENTIFYING" ? "" : "cursor-crosshair"
                    }`}
                    onClick={handleImageClick}
                  >
                    <img
                      src={uploadedImage!}
                      alt="Uploaded space image"
                      className={`w-full h-full object-contain transition-all duration-500 ${
                        state === "IDENTIFYING" ? "brightness-75" : ""
                      }`}
                    />

                    {/* Click ripple */}
                    {clickPos && (
                      <ClickRipple x={clickPos.x * 100} y={clickPos.y * 100} active={showRipple} />
                    )}

                    {/* Bounding box */}
                    {identifiedObject && state !== "IDENTIFYING" && (
                      <BoundingBox
                        bbox={identifiedObject.bbox}
                        label={identifiedObject.displayName}
                        confidence={identifiedObject.confidence}
                      />
                    )}

                    {/* Scanning overlay */}
                    {state === "IDENTIFYING" && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <div className="relative w-14 h-14 mb-3">
                          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                          <div className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-purple-400 border-b-transparent border-l-transparent animate-spin" />
                        </div>
                        <p className="text-cyan-300 font-micro text-xs tracking-wider animate-pulse">
                          IDENTIFYING OBJECT...
                        </p>
                      </div>
                    )}

                    {/* No object toast */}
                    {state === "NO_OBJECT" && noObjectMessage && (
                      <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-space-900/90 backdrop-blur-md border border-space-700/50 text-center animate-in slide-in-from-bottom z-30">
                        <p className="text-space-300 text-sm">{noObjectMessage}</p>
                        <p className="text-space-500 text-xs mt-1">Click on a visible object to identify it</p>
                      </div>
                    )}

                    {/* Close button */}
                    <button onClick={(e) => { e.stopPropagation(); handleReset(); }} type="button"
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-md text-space-300 hover:text-white hover:bg-black/80 transition-colors z-30">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status bar */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-space-300 text-xs truncate font-mono max-w-[200px]">{fileName}</span>
                      {state === "IMAGE_LOADED" && (
                        <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-micro animate-pulse">
                          <MousePointerClick className="w-3 h-3" /> CLICK ON AN OBJECT
                        </span>
                      )}
                      {identifiedObject && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-micro">
                          {identifiedObject.displayName.toUpperCase()} IDENTIFIED
                        </span>
                      )}
                    </div>
                    <button onClick={handleReset} type="button"
                      className="btn-outline px-3 py-1 text-xs text-space-400 hover:text-white">
                      New Image
                    </button>
                  </div>

                  {scanError && (
                    <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {scanError}
                    </div>
                  )}
                </div>

                {/* ── Chat Panel (below image) ── */}
                {(showChat || chatMessages.length > 0) && identifiedObject && (
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-micro text-space-400 uppercase tracking-wider flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5" />
                        ASK ABOUT {identifiedObject.displayName.toUpperCase()}
                      </h3>
                      <button onClick={() => setShowChat(false)} type="button" className="text-space-500 hover:text-space-300 text-xs">
                        Minimize
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1">
                      {chatMessages.map((msg, i) => (
                        <div key={`msg-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                            msg.role === "user"
                              ? "bg-accent-blue/20 border border-accent-blue/30 text-space-100"
                              : "bg-space-800/50 border border-space-700/40 text-space-200"
                          }`}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_li]:mb-0.5">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                            ) : (
                              <p>{msg.text}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-space-800/50 border border-space-700/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-space-400 text-sm">Thinking...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Suggested questions */}
                    {suggestedQuestions.length > 0 && chatMessages.length === 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suggestedQuestions.map((q, i) => (
                          <button key={`sq-${i}`} onClick={() => sendChatMessage(q)} type="button"
                            className="px-3 py-1.5 text-xs rounded-full bg-space-800/60 border border-space-700/50 text-space-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors">
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(chatInput); } }}
                        placeholder={`Ask about ${identifiedObject.displayName}...`}
                        className="flex-1 bg-space-800/40 border border-space-700/50 rounded-xl px-4 py-2.5 text-sm text-space-100 placeholder:text-space-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        disabled={chatLoading}
                      />
                      <button onClick={() => sendChatMessage(chatInput)} disabled={!chatInput.trim() || chatLoading} type="button"
                        className="p-2.5 rounded-xl bg-accent-blue/20 border border-accent-blue/30 text-cyan-400 hover:bg-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ═══ RIGHT: Knowledge Dossier (2 cols) ═══ */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            {!identifiedObject ? (
              <div className="glass-card p-8 sm:p-10 flex flex-col items-center justify-center min-h-[460px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-space-800/60 border border-space-700/50 flex items-center justify-center mb-6">
                  <MousePointerClick className="w-10 h-10 text-space-500" />
                </div>
                <h3 className="text-xl font-semibold text-space-200 mb-2">
                  {uploadedImage ? "Click on Any Object" : "Upload an Image"}
                </h3>
                <p className="text-space-400 text-sm max-w-sm mb-6">
                  {uploadedImage
                    ? "Click anywhere on the image to identify the object at that location. SpaceAtlas will detect it, draw a bounding box, and show you everything it knows."
                    : "Upload a space image, then click on any object to identify it. Works with planets, rockets, nebulae, galaxies, spacecraft, and more."}
                </p>

                {/* How it works */}
                <div className="w-full pt-6 border-t border-space-800/80 space-y-3">
                  <p className="text-[11px] font-micro text-space-500 uppercase tracking-wider">HOW IT WORKS</p>
                  {[
                    { icon: Upload, label: "Upload any space image" },
                    { icon: MousePointerClick, label: "Click on an object in the image" },
                    { icon: ScanSearch, label: "AI identifies it with a bounding box" },
                    { icon: Eye, label: "View detailed knowledge & specs" },
                    { icon: MessageCircle, label: "Ask follow-up questions via chat" },
                  ].map((step, i) => (
                    <div key={`step-${i}`} className="flex items-center gap-3 text-left">
                      <div className="w-7 h-7 rounded-lg bg-space-800/80 border border-space-700/50 flex items-center justify-center shrink-0">
                        <step.icon className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <span className="text-space-300 text-xs">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card overflow-hidden border-space-700/50 shadow-2xl">
                {/* Header image */}
                {knowledge?.imageUrl && (
                  <div className="relative h-48 overflow-hidden bg-space-950">
                    <img src={knowledge.imageUrl} alt={knowledge.displayName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/40 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <span className="text-[10px] font-micro px-2 py-0.5 rounded bg-space-900/80 text-cyan-300 border border-cyan-500/30 uppercase">
                        {knowledge.source === "spaceatlas" ? "SpaceAtlas Database" : "Wikipedia"}
                      </span>
                      <h2 className="text-2xl font-bold text-white mt-1">{identifiedObject.displayName}</h2>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-5">
                  {/* Fallback title if no image */}
                  {!knowledge?.imageUrl && (
                    <div className="border-b border-space-800 pb-4">
                      <span className="text-[10px] font-micro px-2 py-0.5 rounded bg-space-800 text-cyan-300 uppercase">
                        {knowledge?.source === "spaceatlas" ? "SpaceAtlas" : "Wikipedia"}
                      </span>
                      <h2 className="text-2xl font-bold text-white mt-1">{identifiedObject.displayName}</h2>
                    </div>
                  )}

                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-space-400 font-micro">IDENTIFICATION CONFIDENCE</span>
                      <span className={`text-xs font-mono font-bold ${
                        identifiedObject.confidence >= 0.85 ? "text-emerald-400" : identifiedObject.confidence >= 0.7 ? "text-cyan-400" : "text-amber-400"
                      }`}>
                        {(identifiedObject.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ConfidenceBar value={identifiedObject.confidence} />
                  </div>

                  {/* AI Observation */}
                  <div className="p-3.5 rounded-xl bg-space-900/80 border border-cyan-500/20">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-micro mb-1">
                      <Eye className="w-3.5 h-3.5" /> AI OBSERVATION
                    </div>
                    <p className="text-space-300 text-xs leading-relaxed">{identifiedObject.observation}</p>
                  </div>

                  {/* Bbox coordinates */}
                  <div className="p-3 rounded-lg bg-space-900/50 border border-space-800/60">
                    <div className="flex items-center gap-1.5 text-xs text-space-400 font-micro mb-1.5">
                      <Box className="w-3 h-3" /> DETECTION BOX
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
                      {["X₁", "Y₁", "X₂", "Y₂"].map((l, i) => (
                        <div key={l}>
                          <span className="text-space-500">{l}</span>
                          <span className="text-space-200 ml-1">{identifiedObject.bbox[i].toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overview */}
                  {knowledge?.description && (
                    <div>
                      <h4 className="text-xs font-micro text-space-400 mb-1.5 uppercase tracking-wider">OVERVIEW</h4>
                      <p className="text-space-300 text-sm leading-relaxed">{knowledge.description}</p>
                    </div>
                  )}

                  {/* Specs */}
                  {knowledge?.details && Object.keys(knowledge.details).length > 0 && (
                    <div>
                      <h4 className="text-xs font-micro text-space-400 mb-2 uppercase tracking-wider">SPECIFICATIONS</h4>
                      <div className="rounded-xl bg-space-900/50 p-3.5 border border-space-800/80">
                        {Object.entries(knowledge.details).map(([k, v]) => (
                          <DetailRow key={k} label={k} value={v} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    {/* Chat button */}
                    <button onClick={() => setShowChat(true)} type="button"
                      className="w-full py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 bg-accent-purple/15 border border-accent-purple/30 text-purple-300 hover:bg-accent-purple/25 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Ask About {identifiedObject.displayName}
                    </button>

                    <div className="flex gap-2">
                      {knowledge?.spaceatlasPath && (
                        <Link href={knowledge.spaceatlasPath}
                          className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5">
                          Explore <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {knowledge?.wikiUrl && (
                        <a href={knowledge.wikiUrl} target="_blank" rel="noopener noreferrer"
                          className="btn-outline flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5 text-space-300 hover:text-white">
                          Wikipedia <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
