"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Loader2, CheckCircle2 } from "lucide-react"

interface ToolRunButtonProps {
  toolId: string
  toolName: string
  disabled?: boolean
}

export function ToolRunButton({ toolId, toolName, disabled }: ToolRunButtonProps) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle")

  async function handleRun() {
    setState("running")
    try {
      await fetch(`/api/tools/${toolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run: true }),
      })
      setState("done")
      setTimeout(() => setState("idle"), 3000)
    } catch {
      setState("idle")
    }
  }

  if (state === "running") {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running…
      </Button>
    )
  }

  if (state === "done") {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1.5 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={handleRun}
      title={`Run ${toolName}`}
      className="gap-1.5"
    >
      <Play className="h-3 w-3" />
      Run
    </Button>
  )
}
