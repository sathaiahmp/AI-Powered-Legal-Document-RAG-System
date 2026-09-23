"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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

interface ChatInterfaceProps {
  uploadedFile: File | null
  analysisType: string
  showMetadata: boolean
  confidenceScoring: boolean
  sessionId?: string
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export function ChatInterface({ uploadedFile, analysisType, showMetadata, confidenceScoring, sessionId, messages, setMessages }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        // Use setTimeout to ensure the DOM has updated
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }, 100)
      }
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const query = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      const { analyzeQuery } = await import("@/api")
      const res = await analyzeQuery(query, analysisType as any, undefined, sessionId, uploadedFile?.name)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: res.answer,
        sender: "assistant",
        timestamp: new Date(),
        metadata: confidenceScoring
          ? {
            confidence: Math.round(res.confidence * 100),
            source: uploadedFile?.name || "General Knowledge",
            chunks: showMetadata ? [] : undefined,
          }
          : undefined,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: err?.response?.data?.detail || err.message || "Request failed",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // mock generator removed in favor of API

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 75) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-border/50 h-full min-h-[400px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="text-sm lg:text-base">Legal Document Q&A</span>
          {uploadedFile && (
            <Badge variant="outline" className="ml-auto text-xs">
              {analysisType}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 lg:px-6 min-h-0">
          <div className="space-y-4 pb-4 min-h-full">
            {!uploadedFile && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6">
                <div className="relative group cursor-default">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-32 h-32 bg-card rounded-2xl border border-border shadow-2xl flex items-center justify-center transform transition-transform duration-500 hover:rotate-y-12 hover:rotate-x-12 perspective-1000">
                    <Bot className="h-16 w-16 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 max-w-md mx-auto px-4">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    AI Legal Assistant
                  </h3>
                  <p className="text-muted-foreground">
                    Upload a contract, agreement, or legal text to unlock powerful AI analysis.
                    Ask questions, get summaries, and identify risks instantly.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground max-w-sm mx-auto">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Secure Analysis
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Instant Answers
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Risk Detection
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Smart Summaries
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex gap-2 lg:gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {message.sender === "assistant" && (
                    <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] lg:max-w-[80%] space-y-2",
                      message.sender === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-sm prose prose-sm max-w-none",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground ml-8 lg:ml-12"
                          : "bg-muted/50 text-foreground",
                      )}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content.split('\n').map((line, index) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <div key={index} className="font-semibold text-foreground mt-2 mb-1">
                                {line.replace(/\*\*/g, '')}
                              </div>
                            )
                          } else if (line.startsWith('•')) {
                            return (
                              <div key={index} className="ml-4 mb-1">
                                {line}
                              </div>
                            )
                          } else if (line.trim() === '') {
                            return <br key={index} />
                          } else {
                            return (
                              <div key={index} className="mb-1">
                                {line}
                              </div>
                            )
                          }
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(message.timestamp)}</span>

                      {message.metadata?.confidence && confidenceScoring && (
                        <>
                          <span>•</span>
                          <span className={getConfidenceColor(message.metadata.confidence)}>
                            {message.metadata.confidence}% confidence
                          </span>
                        </>
                      )}

                      {message.metadata?.source && showMetadata && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-20 lg:max-w-32">{message.metadata.source}</span>
                        </>
                      )}
                    </div>

                    {message.metadata?.chunks && showMetadata && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.metadata.chunks.map((chunk, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {chunk}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1">
                      <AvatarFallback className="bg-accent/10">
                        <User className="h-3 w-3 lg:h-4 lg:w-4 text-accent" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border/50 p-3 lg:p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a legal question (e.g., 'What are my fundamental rights?')..."
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1 text-sm"
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
