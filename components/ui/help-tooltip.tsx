"use client"

import { HelpCircle } from "lucide-react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

interface HelpTooltipProps {
  content: string | React.ReactNode
  className?: string
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button className={cn("text-muted-foreground hover:text-foreground transition-colors", className)}>
            <HelpCircle size={18} />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="max-w-sm bg-white p-3 text-sm leading-relaxed text-gray-700 shadow-lg rounded-lg border"
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-white" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
