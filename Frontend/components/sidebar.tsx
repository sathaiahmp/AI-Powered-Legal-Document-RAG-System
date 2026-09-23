"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { Settings, BarChart3, TrendingUp, FileText, Shield, AlertTriangle, Scale } from "lucide-react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { getAnalytics } from "@/api"

interface SidebarProps {
  analysisType: string
  setAnalysisType: (type: string) => void
  documentType: string
  setDocumentType: (type: string) => void
  showMetadata: boolean
  setShowMetadata: (show: boolean) => void
  confidenceScoring: boolean
  setConfidenceScoring: (show: boolean) => void
  retrievalChunks: number
  setRetrievalChunks: (chunks: number) => void
  sessionId?: string   // ✅ already optional
}

const chartConfig = {
  count: {
    label: "Queries",
  },
  "Q&A": {
    label: "Q&A Analysis",
    color: "hsl(var(--chart-1))",
  },
  Contract: {
    label: "Contract Analysis",
    color: "hsl(var(--chart-2))",
  },
  Compliance: {
    label: "Compliance Check",
    color: "hsl(var(--chart-3))",
  },
  Risk: {
    label: "Risk Assessment",
    color: "hsl(var(--chart-4))",
  },
}

export function Sidebar({
  analysisType,
  setAnalysisType,
  documentType,
  setDocumentType,
  showMetadata,
  setShowMetadata,
  confidenceScoring,
  setConfidenceScoring,
  retrievalChunks,
  setRetrievalChunks,
  sessionId,   // ✅ destructured here
}: SidebarProps) {
  const sid = sessionId || "demo-session"

  const { data: analytics } = useQuery({
    queryKey: ["analytics", sid],
    queryFn: () => getAnalytics(sid),
    staleTime: 10_000,
  })

  const chartData = (() => {
    const intents = analytics?.intents || {}
    return [
      { intent: "Q&A", count: intents["general"] || 0, fill: "var(--color-chart-1)" },
      { intent: "Contract", count: intents["contract_analysis"] || 0, fill: "var(--color-chart-2)" },
      { intent: "Compliance", count: intents["compliance_check"] || 0, fill: "var(--color-chart-3)" },
      { intent: "Risk", count: intents["risk_assessment"] || 0, fill: "var(--color-chart-4)" },
    ]
  })()

  const analysisTypes = [
    { value: "Q&A", label: "Q&A Analysis", icon: FileText },
    { value: "Contract Analysis", label: "Contract Analysis", icon: Scale },
    { value: "Compliance Check", label: "Compliance Check", icon: Shield },
    { value: "Risk Assessment", label: "Risk Assessment", icon: AlertTriangle },
  ]

  const documentTypes = [
    { value: "contract", label: "Contract" },
    { value: "nda", label: "NDA" },
    { value: "employment", label: "Employment" },
    { value: "lease", label: "Lease" },
    { value: "judgment", label: "Judgment" },
    { value: "policy", label: "Policy" },
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent shadow-xl z-40"
    >
      <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
        {/* Analysis Configuration */}
        <Card className="bg-card/50 backdrop-blur-sm border border-sidebar-border shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3 xl:pb-4">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Settings className="h-4 w-4 text-primary" />
              <span>Analysis Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 xl:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analysis-type" className="text-xs font-medium text-muted-foreground">
                Analysis Type
              </Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger id="analysis-type" className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-type" className="text-xs font-medium text-muted-foreground">
                Document Type
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="document-type" className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
          <CardHeader className="pb-3 xl:pb-4">
            <CardTitle className="text-sm">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 xl:space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="retrieval-chunks" className="text-xs font-medium text-muted-foreground">
                  Retrieval Chunks
                </Label>
                <Badge variant="outline" className="text-xs">
                  {retrievalChunks}
                </Badge>
              </div>
              <Slider
                id="retrieval-chunks"
                min={1}
                max={10}
                step={1}
                value={[retrievalChunks]}
                onValueChange={(value) => setRetrievalChunks(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-metadata" className="text-sm font-medium">
                Show Metadata
              </Label>
              <Switch id="show-metadata" checked={showMetadata} onCheckedChange={setShowMetadata} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="confidence-scoring" className="text-sm font-medium">
                Confidence Scoring
              </Label>
              <Switch id="confidence-scoring" checked={confidenceScoring} onCheckedChange={setConfidenceScoring} />
            </div>
          </CardContent>
        </Card>

        {/* Session Analytics */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
          <CardHeader className="pb-3 xl:pb-4">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Session Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 xl:space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Intent Distribution</Label>
              <ChartContainer config={chartConfig} className="h-28 xl:h-32 w-full">
                <BarChart data={chartData}>
                  <XAxis dataKey="intent" tickLine={false} tickMargin={10} axisLine={false} fontSize={10} />
                  <YAxis hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Avg Confidence</Label>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-semibold">{((analytics?.averageConfidence || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Total Queries</Label>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-lg font-semibold">{analytics?.totalQueries || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
          <CardContent className="p-3 xl:p-4">
            <div className="grid grid-cols-2 gap-3 xl:gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xl xl:text-2xl font-bold text-primary">24</div>
                <div className="text-xs text-muted-foreground">Documents Analyzed</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl xl:text-2xl font-bold text-accent">4.8</div>
                <div className="text-xs text-muted-foreground">Avg Risk Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.aside>
  )
}
