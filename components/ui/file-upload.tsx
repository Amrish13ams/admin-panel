"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileImage, FileUp as File3D, Camera } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface FileUploadProps {
  onUpload: (url: string) => void
  onRemove?: () => void
  currentUrl?: string
  accept?: string
  folder?: string
  className?: string
  companyId?: string
}

export function FileUpload({
  onUpload,
  onRemove,
  currentUrl,
  accept = "image/*",
  folder = "products",
  className,
  companyId,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      if (companyId) {
        formData.append("companyId", companyId)
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const { url } = await response.json()
      onUpload(url)
    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getFileIcon = () => {
    if (accept.includes("model") || accept.includes("gltf") || accept.includes("usdz")) {
      return <File3D className="h-8 w-8 text-gray-400" />
    }
    return <FileImage className="h-8 w-8 text-gray-400" />
  }

  if (currentUrl && !isUploading) {
    return (
      <div className={`relative ${className}`}>
        {accept.includes("image") ? (
          <img
            src={currentUrl || "/placeholder.svg"}
            alt="Uploaded file"
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              {getFileIcon()}
              <p className="text-sm text-gray-600 mt-2">3D Model Uploaded</p>
            </div>
          </div>
        )}
        {onRemove && (
          <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Upload className="h-8 w-8 text-gray-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading...</p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </div>
        ) : (
          <>
            {getFileIcon()}
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Drag and drop your file here, or{" "}
                <button
                  type="button"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              {isMobile && accept.includes("image") && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {accept.includes("image") ? "PNG, JPG, WebP up to 50MB" : "GLB, USDZ up to 50MB"}
              </p>
            </div>
          </>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      {isMobile && accept.includes("image") && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  )
}
