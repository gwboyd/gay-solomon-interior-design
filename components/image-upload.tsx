"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelected: (file: File) => void
  currentImageUrl?: string
  className?: string
}

export function ImageUpload({ onImageSelected, currentImageUrl, className = "" }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Pass the file to the parent component
    onImageSelected(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClearImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {previewUrl ? (
        <div className="relative w-full h-40">
          <Image src={previewUrl} alt="Preview" fill className="object-cover rounded-md" />
          <button
            type="button"
            onClick={handleClearImage}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Clear image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg transition-colors ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="image-upload"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer flex flex-col items-center justify-center p-8"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium mb-1">Click to upload or drag and drop</span>
            <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
          </label>
        </div>
      )}
    </div>
  )
}
