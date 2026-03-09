"use client"

import { useEffect, useRef, useState, useId } from "react"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, "")
  const [scale, setScale] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "Inter, system-ui, sans-serif",
          flowchart: { curve: "basis", padding: 20 },
          themeVariables: {
            primaryColor: "#0d5c3a",
            primaryTextColor: "#fff",
            primaryBorderColor: "#0a4a2e",
            lineColor: "#6b7280",
            secondaryColor: "#f0f7f4",
            tertiaryColor: "#f9fafb",
          },
        })

        const { svg } = await mermaid.render(`mermaid-${id}`, chart)
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
          // Make SVG responsive
          const svgEl = ref.current.querySelector("svg")
          if (svgEl) {
            svgEl.style.maxWidth = "100%"
            svgEl.style.height = "auto"
            svgEl.removeAttribute("width")
          }
          setRendered(true)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram render failed")
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart, id])

  const downloadSvg = () => {
    const svgEl = ref.current?.querySelector("svg")
    if (!svgEl) return
    const blob = new Blob([svgEl.outerHTML], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram.svg"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
        <p className="text-sm text-red-700 dark:text-red-300 font-mono">{error}</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {rendered && (
        <div className="flex items-center gap-1 absolute top-2 right-2 z-10">
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setScale(s => Math.min(s + 0.2, 3))}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setScale(s => Math.max(s - 0.2, 0.3))}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setScale(1)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={downloadSvg}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <div
        className="overflow-auto rounded-md bg-background p-4 min-h-[200px]"
        style={{ cursor: "grab" }}
      >
        <div
          ref={ref}
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", transition: "transform 0.2s" }}
        />
        {!rendered && !error && (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm animate-pulse">
            Rendering diagram...
          </div>
        )}
      </div>
    </div>
  )
}
