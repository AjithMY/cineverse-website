import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Bot, User, Loader2, X, MessageSquare, Film, Trash2 } from "lucide-react";
import { geminiService } from "../services/geminiService";
import { api } from "../lib/api";
import { Movie } from "../types";
import { MovieCard } from "./MovieCard";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "model";
  content: string;
}

export const FloatingAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hi! I'm CineVerse AI. I can recommend movies, find where to stream them, or even help you write a movie script! What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = geminiService.createChatSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      // Only scroll to bottom when the chat is first opened, not on every message
      scrollToBottom();
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setRecommendedMovies([]);

    try {
      let response = await chatSessionRef.current.sendMessage({ message: userMessage });
      
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        
        for (const call of response.functionCalls) {
          let result;
          const args = call.args as any;

          switch (call.name) {
            case "getTrendingMovies":
              result = await api.getTrending(args.timeWindow || "week");
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "getPopularMovies":
              result = await api.getPopular();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "getTopRatedMovies":
              result = await api.getTopRated();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "getUpcomingMovies":
              result = await api.getUpcoming();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "getHollywoodMovies":
              result = await api.getHollywoodMovies();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "getIndianMovies":
              result = await api.getIndianMovies();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "searchMovies":
              result = await api.searchMovies(args.query);
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 3)]);
              break;
            case "getMovieDetails":
              result = await api.getMovieDetails(args.id);
              break;
            case "getWatchProviders":
              result = await api.getWatchProviders(args.id);
              break;
            default:
              result = { error: "Function not found" };
          }

          functionResponses.push({
            name: call.name,
            response: { result },
            id: call.id
          });
        }

        response = await chatSessionRef.current.sendMessage({
          message: functionResponses.map(fr => ({
            functionResponse: {
              name: fr.name,
              response: fr.response
            }
          }))
        });
      }

      const finalContent = response.text || "I've processed your request!";
      setMessages(prev => [...prev, { role: "model", content: finalContent }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    "Recommend mind-bending movies",
    "Where can I watch Interstellar?",
    "Suggest feel-good movies",
    "Write a short horror script",
    "Explain the ending of Tenet"
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[200] hidden md:block">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[500px] max-w-[calc(100vw-4rem)] h-[750px] max-h-[calc(100vh-10rem)] bg-[#0a0a0a] border border-white/[0.08] rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">CINEVERSE AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setMessages([{ role: "model", content: "Chat cleared! How can I help you now?" }]);
                    setRecommendedMovies([]);
                    chatSessionRef.current = geminiService.createChatSession();
                  }}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col gap-4", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <div className={cn("flex gap-3 max-w-[90%]", msg.role === "user" ? "flex-row-reverse" : "")}>
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg", 
                      msg.role === "user" ? "bg-white/10" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn("p-5 rounded-[24px] text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-xl", 
                      msg.role === "user" 
                        ? "bg-white text-black rounded-tr-none" 
                        : "bg-white/[0.05] border border-white/[0.08] text-white/80 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>

                  {/* Inline Recommendations */}
                  {msg.role === "model" && i === messages.length - 1 && recommendedMovies.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full grid grid-cols-2 gap-4 mt-2"
                    >
                      {recommendedMovies.map(movie => (
                        <div key={movie.id} className="transform hover:scale-[1.02] transition-transform">
                          <MovieCard movie={movie} />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-5 rounded-[24px] bg-white/[0.05] border border-white/[0.08]">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {quickSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-[10px] font-bold text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white/[0.02] border-t border-white/[0.08]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask CineVerse AI..."
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl pl-5 pr-12 py-3.5 text-xs outline-none focus:border-emerald-500/50 transition-all font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen 
            ? "bg-white text-black rotate-90" 
            : "bg-emerald-500 text-black shadow-emerald-500/20"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
          </div>
        )}
      </motion.button>
    </div>
  );
};
