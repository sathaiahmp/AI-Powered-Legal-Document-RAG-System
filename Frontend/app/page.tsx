"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { FileUpload } from "@/components/file-upload"
import { TabbedInterface } from "@/components/tabbed-interface"
import { QuickActions } from "@/components/quick-actions"
import { motion } from "framer-motion"

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

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [docId, setDocId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<string>("")
  const [analysisType, setAnalysisType] = useState("Q&A")
  const [documentType, setDocumentType] = useState("contract")
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "session"
    let id = localStorage.getItem("legal-session-id")
    if (!id) {
      id = `sess-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem("legal-session-id", id)
    }
    return id
  })
  const [showMetadata, setShowMetadata] = useState(false)
  const [confidenceScoring, setConfidenceScoring] = useState(true)
  const [retrievalChunks, setRetrievalChunks] = useState(5)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // Shared state for tab persistence
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [activeTab, setActiveTab] = useState("chat")

  const sidebarProps = {
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileSidebarToggle={() => setIsMobileSidebarOpen(true)} />

      <div className="flex">
        <div className="hidden xl:block">
          <Sidebar {...sidebarProps} sessionId={sessionId} />
        </div>

        <MobileSidebar {...sidebarProps} isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:ml-80 min-h-[calc(100vh-4rem)] flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6 flex-1 flex flex-col"
          >
            <FileUpload uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} onUploaded={setDocId} />

            <QuickActions uploadedFile={uploadedFile} docId={docId} analysisType={analysisType} documentType={documentType} sessionId={sessionId} onResult={setLastResult} />

            <div className="flex-1 flex flex-col min-h-0">
              <TabbedInterface
                uploadedFile={uploadedFile}
                analysisType={analysisType}
                showMetadata={showMetadata}
                confidenceScoring={confidenceScoring}
                sessionId={sessionId}
                docId={docId}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                summaryData={summaryData}
                setSummaryData={setSummaryData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
