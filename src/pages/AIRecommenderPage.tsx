import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Bot, User, Loader2, Film } from "lucide-react";
import { PageWrapper } from "../components/PageWrapper";
import { geminiService } from "../services/geminiService";
import { api } from "../lib/api";
import { Movie } from "../types";
import { MovieCard } from "../components/MovieCard";
import { Skeleton } from "../components/Skeleton";

interface Message {
  role: "user" | "model";
  content: string;
}

const AIRecommenderPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hi! I'm CineVerse AI. Tell me what kind of movies you're in the mood for, or ask me for a recommendation based on your favorite genre!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = geminiService.createChatSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Removed automatic scroll on message change to prevent jumping

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
      
      // Handle function calls
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        
        for (const call of response.functionCalls) {
          let result;
          const args = call.args as any;

          switch (call.name) {
            case "getTrendingMovies":
              result = await api.getTrending(args.timeWindow || "week");
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
              break;
            case "getPopularMovies":
              result = await api.getPopular();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
              break;
            case "getTopRatedMovies":
              result = await api.getTopRated();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
              break;
            case "getUpcomingMovies":
              result = await api.getUpcoming();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
              break;
            case "getHollywoodMovies":
              result = await api.getHollywoodMovies();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
              break;
            case "getIndianMovies":
              result = await api.getIndianMovies();
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
              break;
            case "searchMovies":
              result = await api.searchMovies(args.query);
              if (result.results) setRecommendedMovies(prev => [...prev, ...result.results.slice(0, 5)]);
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

        // Send function results back to model
        response = await chatSessionRef.current.sendMessage({
          message: functionResponses.map(fr => ({
            functionResponse: {
              name: fr.name,
              response: fr.response
            }
          }))
        });
      }

      const finalContent = response.text || "I've found some movies for you based on your request!";
      setMessages(prev => [...prev, { role: "model", content: finalContent }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="pt-24 sm:pt-32 px-4 sm:px-12 lg:px-24 max-w-5xl mx-auto pb-12 sm:pb-24">
        <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-200px)] min-h-[500px] sm:min-h-[700px]">
          
          {/* Chat Section - Now Full Width and Enlarged */}
          <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/[0.08] rounded-[24px] sm:rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-4 sm:p-8 border-b border-white/[0.08] flex items-center gap-4 sm:gap-6 bg-white/[0.02]">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight">CINEVERSE AI</h1>
                <p className="text-[8px] sm:text-xs text-white/40 font-bold uppercase tracking-widest">Your Intelligent Movie Companion</p>
              </div>
              <button 
                onClick={() => {
                  setMessages([{ role: "model", content: "Chat cleared! How can I help you now?" }]);
                  setRecommendedMovies([]);
                  chatSessionRef.current = geminiService.createChatSession();
                }}
                className="px-3 sm:px-6 py-2 sm:py-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 rounded-xl sm:rounded-2xl hover:bg-white/5"
              >
                <span className="hidden sm:inline">Clear Conversation</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col gap-3 sm:gap-4 max-w-[90%] sm:max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                          msg.role === "user" ? "bg-white/10" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {msg.role === "user" ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <div className={`p-4 sm:p-6 rounded-[20px] sm:rounded-[32px] text-sm sm:text-base font-medium leading-relaxed shadow-xl ${
                          msg.role === "user" 
                            ? "bg-white text-black rounded-tr-none" 
                            : "bg-white/[0.05] border border-white/[0.08] text-white/90 rounded-tl-none"
                        }`}>
                          {msg.content}
                        </div>
                      </div>

                      {/* Inline Recommendations - Only shown if movies were found for this specific turn */}
                      {msg.role === "model" && i === messages.length - 1 && recommendedMovies.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full mt-2 sm:mt-4"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
                            <Film className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">Recommended for you</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {recommendedMovies.map(movie => (
                              <div key={movie.id} className="transform hover:scale-[1.02] transition-transform">
                                <MovieCard movie={movie} />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[32px] bg-white/[0.05] border border-white/[0.08]">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 sm:p-8 bg-white/[0.02] border-t border-white/[0.08]">
              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {["Recommend mind-bending movies", "Where can I watch Interstellar?", "Write a short horror script", "Suggest feel-good movies"].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.03] border border-white/[0.08] rounded-full text-[10px] sm:text-xs font-bold text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all hover:bg-white/5"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask CineVerse AI..."
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl sm:rounded-[24px] pl-4 sm:pl-8 pr-12 sm:pr-16 py-3.5 sm:py-5 text-sm sm:text-base outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-white/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 px-4 sm:px-6 bg-emerald-500 text-black rounded-lg sm:rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default AIRecommenderPage;
