"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * NavigationProgress — thin burgundy progress bar at top of page.
 * Fires on every route change to give instant visual feedback.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // When pathname changes → navigation complete → finish bar
    if (!visible) return
    setProgress(100)
    const t = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Expose a function to start the bar (called on Link clicks via event)
  useEffect(() => {
    const startProgress = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      setProgress(15)
      setVisible(true)

      let val = 15
      intervalRef.current = setInterval(() => {
        // Ease toward 85% — never completes until navigation finishes
        val = val + (85 - val) * 0.08
        setProgress(Math.min(val, 85))
      }, 80)
    }

    // Intercept all <a> clicks for instant progress start
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href") || ""
      // Only internal non-anchor links
      if (href.startsWith("/") && !href.startsWith("/#")) {
        startProgress()
      }
    }

    document.addEventListener("click", handler, true)
    return () => {
      document.removeEventListener("click", handler, true)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none transition-all"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, var(--burgundy), var(--gold))",
        opacity: visible ? 1 : 0,
        transition: progress === 100
          ? "width 0.2s ease-out, opacity 0.3s ease 0.1s"
          : "width 0.08s linear",
        boxShadow: "0 0 8px var(--gold)",
      }}
    />
  )
}
