"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, FileText, FileCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { uploadDocument } from "@/api"
import { toast } from "@/hooks/use-toast"

interface FileUploadProps {
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  onUploaded?: (docId: string) => void
  sessionId?: string
}

export function FileUpload({ uploadedFile, setUploadedFile, onUploaded, sessionId }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const { mutate: doUpload, isPending } = useMutation({
    mutationFn: async (file: File) => {
      return await uploadDocument(file, sessionId)
    },
    onSuccess: (data) => {
      toast({ title: "Uploaded", description: data.message })
      onUploaded?.(data.docId)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message
      toast({ title: "Upload failed", description: msg })
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const f = acceptedFiles[0]
        setUploadedFile(f)
        doUpload(f)
      }
    },
    [setUploadedFile, doUpload],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 200 * 1024 * 1024, // 200MB
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  })

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "docx":
        return <FileCode className="h-8 w-8 text-blue-500" />
      case "txt":
        return <File className="h-8 w-8 text-gray-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
                isDragActive ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div {...getRootProps()} className="text-center">
                  <input {...getInputProps()} />
                  <motion.div
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full bg-primary/10"
                  >
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {isDragActive ? "Drop your document here" : isPending ? "Uploading..." : "Upload Legal Document"}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-3 sm:mb-4">
                    <Badge variant="secondary">PDF</Badge>
                    <Badge variant="secondary">DOCX</Badge>
                    <Badge variant="secondary">TXT</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Maximum file size: 200MB</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50 flex-shrink-0">
                      {getFileIcon(uploadedFile.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                        {uploadedFile.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-0">
                        <span>{formatFileSize(uploadedFile.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="capitalize">{uploadedFile.type.split("/")[1] || "Unknown"}</span>
                        <span className="hidden sm:inline">•</span>
                        <Badge variant="outline" className="text-xs w-fit">
                          Ready for Analysis
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                    disabled={isPending}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                {isPending && (
                  <div className="mt-3 text-xs text-muted-foreground">Uploading and indexing...</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
