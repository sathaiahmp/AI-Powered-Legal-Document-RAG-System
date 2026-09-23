"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Settings, BarChart3, FileText, Shield, AlertTriangle, Scale } from "lucide-react"

interface MobileSidebarProps {
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
  isOpen: boolean
  onClose: () => void
}

const chartData = [
  { intent: "Q&A", count: 45, fill: "var(--color-chart-1)" },
  { intent: "Contract", count: 32, fill: "var(--color-chart-2)" },
  { intent: "Compliance", count: 28, fill: "var(--color-chart-3)" },
  { intent: "Risk", count: 21, fill: "var(--color-chart-4)" },
]

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

export function MobileSidebar({
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
  isOpen,
  onClose,
}: MobileSidebarProps) {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[85vw] max-w-sm p-0 overflow-y-auto">
        <SheetHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <SheetTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Analysis Controls</span>
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
          {/* Analysis Configuration */}
          <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-sm">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-analysis-type" className="text-xs font-medium text-muted-foreground">
                  Analysis Type
                </Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger id="mobile-analysis-type" className="w-full h-10">
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
                <Label htmlFor="mobile-document-type" className="text-xs font-medium text-muted-foreground">
                  Document Type
                </Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="mobile-document-type" className="w-full h-10">
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
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-sm">Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-retrieval-chunks" className="text-xs font-medium text-muted-foreground">
                    Retrieval Chunks
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {retrievalChunks}
                  </Badge>
                </div>
                <Slider
                  id="mobile-retrieval-chunks"
                  min={1}
                  max={10}
                  step={1}
                  value={[retrievalChunks]}
                  onValueChange={(value) => setRetrievalChunks(value[0])}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label htmlFor="mobile-show-metadata" className="text-sm font-medium">
                  Show Metadata
                </Label>
                <Switch id="mobile-show-metadata" checked={showMetadata} onCheckedChange={setShowMetadata} />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label htmlFor="mobile-confidence-scoring" className="text-sm font-medium">
                  Confidence Scoring
                </Label>
                <Switch
                  id="mobile-confidence-scoring"
                  checked={confidenceScoring}
                  onCheckedChange={setConfidenceScoring}
                />
              </div>
            </CardContent>
          </Card>

          {/* Session Analytics - Simplified for mobile */}
          <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-bold text-primary">87.3%</div>
                  <div className="text-xs text-muted-foreground">Avg Confidence</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-bold text-accent">126</div>
                  <div className="text-xs text-muted-foreground">Total Queries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
