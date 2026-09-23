"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Copy, RefreshCw, CheckCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import { getSummary } from "@/api"
import { toast } from "@/hooks/use-toast"

interface SummaryData {
  content: string
  type: "brief" | "comprehensive" | "executive"
  timestamp: Date
}

interface SummarizeTabProps {
  uploadedFile: File | null
  docId?: string | null
  sessionId?: string
  summaryData: SummaryData | null
  setSummaryData: (data: SummaryData | null) => void
}

type SummaryType = "brief" | "comprehensive" | "executive"

export function SummarizeTab({ uploadedFile, docId, sessionId, summaryData, setSummaryData }: SummarizeTabProps) {
  const [summaryType, setSummaryType] = useState<SummaryType>(summaryData?.type || "comprehensive")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Use shared state for summary content
  const generatedSummary = summaryData?.content || ""
  
  // Update summary type when summaryData changes
  React.useEffect(() => {
    if (summaryData?.type) {
      setSummaryType(summaryData.type)
    }
  }, [summaryData?.type])

  const { mutate: generateSummary, isPending } = useMutation({
    mutationFn: async (type: SummaryType) => {
      if (!docId) throw new Error("No document uploaded")
      return await getSummary(docId, type)
    },
    onSuccess: (res, variables) => {
      const newSummaryData: SummaryData = {
        content: res.summary,
        type: variables,
        timestamp: new Date()
      }
      setSummaryData(newSummaryData)
      toast({ 
        title: "Summary Generated", 
        description: `${variables.charAt(0).toUpperCase() + variables.slice(1)} summary created successfully` 
      })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message
      toast({ title: "Summary failed", description: msg })
    }
  })

  const handleGenerateSummary = () => {
    if (!uploadedFile) {
      toast({ title: "No file", description: "Upload a document first" })
      return
    }
    generateSummary(summaryType)
  }

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generatedSummary)
      setCopied(true)
      toast({ title: "Copied", description: "Summary copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({ title: "Copy failed", description: "Failed to copy summary" })
    }
  }

  const handleDownloadSummary = () => {
    const blob = new Blob([generatedSummary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary-${uploadedFile?.name?.replace(/\.[^/.]+$/, "") || 'document'}-${summaryData?.type || summaryType}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Downloaded", description: "Summary downloaded successfully" })
  }

  const handleClearSummary = () => {
    setSummaryData(null)
    setSummaryType("comprehensive")
    toast({ title: "Cleared", description: "Summary cleared" })
  }

  const summaryTypes = [
    { value: "brief", label: "Brief Summary", description: "2-3 sentence overview" },
    { value: "comprehensive", label: "Comprehensive", description: "Detailed analysis with key points" },
    { value: "executive", label: "Executive Summary", description: "Business-focused highlights" }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Controls */}
      <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Document Summarization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Summary Type
              </label>
              <Select value={summaryType} onValueChange={(value: SummaryType) => setSummaryType(value)}>
                <SelectTrigger className="w-full p-5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {summaryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGenerateSummary}
              disabled={!uploadedFile || isPending}
              className="w-full m-7 p-5 sm:w-auto "
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-1" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>

          {!uploadedFile && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Upload a document to generate summaries</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <AnimatePresence>
        {generatedSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Summary Preview</span>
                    <Badge variant="outline" className="ml-2">
                      {(summaryData?.type || summaryType).charAt(0).toUpperCase() + (summaryData?.type || summaryType).slice(1)}
                    </Badge>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySummary}
                      className="flex items-center space-x-1"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadSummary}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSummary}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {generatedSummary.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div key={index} className="font-semibold text-foreground mt-4 mb-2 text-lg">
                            {line.replace(/\*\*/g, '')}
                          </div>
                        )
                      } else if (line.startsWith('•') || line.startsWith('-')) {
                        return (
                          <div key={index} className="ml-4 mb-2 flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{line.substring(1).trim()}</span>
                          </div>
                        )
                      } else if (line.trim() === '') {
                        return <br key={index} />
                      } else {
                        return (
                          <div key={index} className="mb-2">
                            {line}
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
