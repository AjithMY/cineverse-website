import React from "react";
import { cn } from "../lib/utils";

export const Skeleton = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <div className={cn("bg-white/5 animate-pulse rounded-xl", className)} {...props} />
);
