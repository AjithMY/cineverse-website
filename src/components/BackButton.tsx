import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";

export const BackButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold text-white/70 hover:text-white group",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Back
    </button>
  );
};
