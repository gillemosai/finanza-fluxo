import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EmojiTooltipProps {
  children: React.ReactNode;
  message: string;
  emoji?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const emojiVariants = {
  happy: "😊",
  money: "💰",
  celebrate: "🎉",
  thinking: "🤔",
  warning: "⚠️",
  tip: "💡",
  rocket: "🚀",
  star: "⭐",
  heart: "❤️",
  fire: "🔥",
  chart: "📊",
  piggy: "🐷",
  gift: "🎁",
  trophy: "🏆",
  target: "🎯",
  sparkle: "✨",
};

export type EmojiType = keyof typeof emojiVariants;

export const EmojiTooltip: React.FC<EmojiTooltipProps> = ({
  children,
  message,
  emoji = "💡",
  side = "top",
  className,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn(
          "flex items-center gap-2 bg-card border-primary/20 shadow-lg max-w-xs",
          className
        )}
      >
        <span className="text-xl animate-bounce" style={{ animationDuration: "1s" }}>
          {emoji}
        </span>
        <p className="text-sm">{message}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const getEmoji = (type: EmojiType): string => {
  return emojiVariants[type] || "💡";
};

export { emojiVariants };
