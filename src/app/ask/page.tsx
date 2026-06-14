"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, ArrowLeft, ZoomIn, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NasaImage {
  url: string;
  title: string;
  description: string;
}

interface Message {
  role: "user" | "model";
  text: string;
  images?: NasaImage[];
}

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Greetings. I am ATLAS, the SpaceAtlas intelligence core. How may I assist you with your exploration of the cosmos today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lightbox, setLightbox] = useState<NasaImage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiHistory = messages.filter((_, index) => index > 0);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: apiHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages([...newMessages, { role: "model", text: data.text, images: data.images ?? [] }]);
    } catch (error: any) {
      setMessages([
        ...newMessages,
        {
          role: "model",
          text: `**System Error:** ${error.message}. Please verify your GEMINI_API_KEY is properly configured.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col pt-20">

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between border-b border-space-500/20">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-space-500/20 rounded-full transition-colors text-space-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-widest">ATLAS CORE</h1>
              <p className="text-xs font-micro text-accent-blue uppercase tracking-widest">AI Space Guide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 overflow-y-auto space-y-8 no-scrollbar pb-32">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-space-700"
                  : "bg-gradient-to-tr from-accent-blue to-accent-purple shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>

            <div className={`max-w-[80%] flex flex-col gap-4 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Text bubble */}
              <div
                className={`rounded-2xl p-5 ${
                  msg.role === "user"
                    ? "bg-space-800 text-white rounded-tr-sm"
                    : "glass-card border border-space-500/30 text-space-100 rounded-tl-sm shadow-xl"
                }`}
              >
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-space-900 prose-pre:border prose-pre:border-space-500/30 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              </div>

              {/* NASA Images Grid */}
              {msg.images && msg.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="w-full"
                >
                  <p className="text-[10px] font-micro uppercase tracking-[2px] text-space-500 mb-2 flex items-center gap-1.5">
                    <span className="w-3 h-[1px] bg-space-500 inline-block" />
                    NASA Image Archive
                    <span className="w-3 h-[1px] bg-space-500 inline-block" />
                  </p>
                  <div className={`grid gap-3 ${msg.images.length === 1 ? "grid-cols-1" : msg.images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {msg.images.map((img, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                        onClick={() => setLightbox(img)}
                        className="group relative rounded-xl overflow-hidden aspect-video border border-space-500/20 hover:border-accent-blue/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{img.title}</p>
                        </div>
                        {/* Zoom icon */}
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-3 h-3 text-white" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card border border-space-500/30 text-space-100 rounded-2xl rounded-tl-sm p-5 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent-blue" />
              <span className="text-sm font-micro text-space-400 uppercase tracking-widest animate-pulse">Processing Telemetry...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#020617] via-[#020617] to-transparent pt-20 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask ATLAS about the universe..."
              className="w-full bg-[#0f172a]/80 border border-space-500/50 backdrop-blur-xl text-white rounded-full py-4 pl-6 pr-14 outline-none focus:border-accent-blue transition-colors placeholder:text-space-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-blue/80 transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <p className="text-center text-[10px] font-micro uppercase tracking-[2px] text-space-600 mt-4">
            ATLAS can make mistakes. Verify critical telemetry.
          </p>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-space-500/30 shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.url} alt={lightbox.title} className="w-full max-h-[75vh] object-contain bg-black" />
              <div className="bg-[#0f172a] px-6 py-4">
                <p className="text-white font-semibold text-sm">{lightbox.title}</p>
                {lightbox.description && (
                  <p className="text-space-400 text-xs mt-1 leading-relaxed">{lightbox.description}</p>
                )}
                <p className="text-space-600 text-[10px] mt-2 uppercase tracking-widest">NASA Image Archive</p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
