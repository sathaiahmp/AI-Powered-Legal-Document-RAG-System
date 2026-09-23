"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Shield, AlertTriangle, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

import { useMutation } from "@tanstack/react-query"
import { analyzeQuery, getSummary } from "@/api"
import { toast } from "@/hooks/use-toast"

interface QuickActionsProps {
  uploadedFile: File | null
  docId?: string | null
  analysisType?: string
  documentType?: string
  sessionId?: string
  onResult?: (text: string) => void
}

export function QuickActions({ uploadedFile, docId, analysisType, documentType, sessionId, onResult }: QuickActionsProps) {
  const { mutate: runAnalyze, isPending } = useMutation({
    mutationFn: async (payload: { prompt: string; intent?: string }) => {
      return await analyzeQuery(payload.prompt, analysisType as any, documentType, sessionId, docId || undefined)
    },
    onSuccess: (res) => {
      onResult?.(res.answer)
      toast({ title: "Completed", description: `Intent: ${res.intent} • Confidence: ${(res.confidence * 100).toFixed(1)}%` })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message
      toast({ title: "Action failed", description: msg })
    }
  })

  const { mutate: runSummary, isPending: isSummarizing } = useMutation({
    mutationFn: async () => {
      if (!docId) throw new Error("No document uploaded")
      return await getSummary(docId)
    },
    onSuccess: (res) => {
      onResult?.(res.summary)
      toast({ title: "Summary generated" })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message
      toast({ title: "Summary failed", description: msg })
    }
  })

  const actions = [
    {
      icon: AlertTriangle,
      label: "Risk Analysis",
      description: "Identify potential legal risks",
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900",
      borderColor: "border-orange-200 dark:border-orange-800",
      disabled: !uploadedFile,
    },
    {
      icon: Shield,
      label: "Compliance Check",
      description: "Verify regulatory compliance",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900",
      borderColor: "border-green-200 dark:border-green-800",
      disabled: !uploadedFile,
    },
    {
      icon: Trash2,
      label: "Clear History",
      description: "Reset conversation history",
      color: "text-red-600",
      bgColor: "bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900",
      borderColor: "border-red-200 dark:border-red-800",
      disabled: false,
    },
  ]

  const handleAction = (actionLabel: string) => {
    if (!uploadedFile) {
      toast({ title: "No file", description: "Upload a document first" })
      return
    }

    switch (actionLabel) {
      case "Generate Summary":
        // This will be handled by the SummarizeTab component
        toast({ 
          title: "Use Summarize Tab", 
          description: "Please use the 'Summarize Document' tab for detailed summaries" 
        })
        break
      case "Risk Analysis":
        runAnalyze({ 
          prompt: "Analyze this document for potential legal risks. Identify: 1) High-risk clauses, 2) Liability issues, 3) Enforcement concerns, 4) Missing protections. Provide actionable recommendations." 
        })
        break
      case "Compliance Check":
        runAnalyze({ 
          prompt: "Check this document for regulatory compliance. Review: 1) Required clauses, 2) Legal standards, 3) Industry requirements, 4) Missing elements. Highlight any violations or gaps." 
        })
        break
      case "Clear History":
        onResult?.("")
        toast({ title: "Cleared", description: "History cleared" })
        break
    }
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
      <CardContent className="p-4 lg:p-6">
        <h3 className="font-semibold mb-4 text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={`h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 sm:space-y-3 w-full transition-all duration-200 ${action.bgColor} ${action.borderColor} border-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
                disabled={action.disabled || isPending || isSummarizing}
                onClick={() => handleAction(action.label)}
              >
                <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color} transition-colors duration-200`} />
                <div className="text-center space-y-1">
                  <div className="font-semibold text-sm sm:text-base text-foreground">{action.label}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-tight hidden sm:block">{action.description}</div>
                </div>
                {(isPending || isSummarizing) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
