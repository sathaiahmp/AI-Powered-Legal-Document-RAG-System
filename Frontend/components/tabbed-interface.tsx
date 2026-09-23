"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatInterface } from "@/components/chat-interface"
import { SummarizeTab } from "@/components/summarize-tab"
import { FileText, MessageSquare, FileCheck } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  metadata?: {
    confidence?: number
    source?: string
    chunks?: string[]
  }
}

interface SummaryData {
  content: string
  type: "brief" | "comprehensive" | "executive"
  timestamp: Date
}

interface TabbedInterfaceProps {
  uploadedFile: File | null
  analysisType: string
  showMetadata: boolean
  confidenceScoring: boolean
  sessionId?: string
  docId?: string | null
  chatMessages: Message[]
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>
  summaryData: SummaryData | null
  setSummaryData: (data: SummaryData | null) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function TabbedInterface({
  uploadedFile,
  analysisType,
  showMetadata,
  confidenceScoring,
  sessionId,
  docId,
  chatMessages,
  setChatMessages,
  summaryData,
  setSummaryData,
  activeTab,
  setActiveTab
}: TabbedInterfaceProps) {

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
        <TabsTrigger value="chat" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Chat & Analysis</span>
        </TabsTrigger>
        <TabsTrigger value="summarize" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Summarize Document</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="mt-0 flex-1 min-h-0">
        <ChatInterface
          uploadedFile={uploadedFile}
          analysisType={analysisType}
          showMetadata={showMetadata}
          confidenceScoring={confidenceScoring}
          sessionId={sessionId}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      </TabsContent>

      <TabsContent value="summarize" className="mt-0 flex-1 min-h-0">
        <SummarizeTab
          uploadedFile={uploadedFile}
          docId={docId}
          sessionId={sessionId}
          summaryData={summaryData}
          setSummaryData={setSummaryData}
        />
      </TabsContent>
    </Tabs>
  )
}
