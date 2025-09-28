"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileImage } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>
  currentFileName?: string
  accept?: string
  className?: string
  onRemove?: () => void
}

export function FileUpload({
  onFileSelect,
  currentFileName,
  accept = "image/*",
  className,
  onRemove,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setProgress(0)

    const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200)

    try {
      await onFileSelect(file)
      setProgress(100)
    } catch (err) {
      console.error(err)
    } finally {
      clearInterval(interval)
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className={className}>
      {currentFileName && !isUploading ? (
        <div className="flex items-center justify-between border rounded p-2">
          <span className="truncate">{currentFileName}</span>
          {onRemove && (
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div>
              <Upload className="mx-auto animate-pulse" />
              <Progress value={progress} className="mt-2" />
            </div>
          ) : (
            <>
              <FileImage className="mx-auto" />
              <p className="text-sm mt-2">{currentFileName ? currentFileName : "Click to select or drag & drop file"}</p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
