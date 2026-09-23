"use client"

import { Scale, Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface HeaderProps {
  onMobileSidebarToggle?: () => void
}

export function Header({ onMobileSidebarToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileSidebarToggle}
            className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
            <Scale className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-foreground">
              <span className="hidden sm:inline">LexQuery</span>
              <span className="sm:hidden">LexQuery</span>
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
              AI-powered document analysis and Q&A
            </p>
          </div>
        </div>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Sun className="h-3 w-3 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3 w-3 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </div>
    </motion.header>
  )
}
