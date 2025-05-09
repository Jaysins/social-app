"use client"

import { useState, useEffect } from "react"

export function useScreenSize() {
  // Start with null to avoid hydration mismatch
  const [screenSize, setScreenSize] = useState({
    width: null as number | null,
    height: null as number | null,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    // This runs only on the client after hydration
    const handleResize = () => {
      const width = window.innerWidth
      setScreenSize({
        width,
        height: window.innerHeight,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    // Set initial size
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return screenSize
}

