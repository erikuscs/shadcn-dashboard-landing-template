"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

const INTERVAL_MS = 60_000

export function OfficeRefresh() {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  // Auto-refresh every 60 s
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
      setLastRefreshed(new Date())
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [router])

  function handleManual() {
    setSpinning(true)
    router.refresh()
    setLastRefreshed(new Date())
    setTimeout(() => setSpinning(false), 800)
  }

  const [, forceRender] = useState(0)
  // tick display every 30 s
  useEffect(() => {
    const id = setInterval(() => forceRender((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const diffSec = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000)
  const label =
    diffSec < 10
      ? "just now"
      : diffSec < 60
      ? `${diffSec}s ago`
      : `${Math.floor(diffSec / 60)}m ago`

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Updated {label}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleManual}>
        <RefreshCw className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
        <span className="sr-only">Refresh office</span>
      </Button>
    </div>
  )
}
