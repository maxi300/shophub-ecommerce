'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Trash2, Loader } from 'lucide-react'

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  bucket?: string
}

export function ImageUploader({ onImageUpload, currentImage, bucket = 'productos' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe exceder 5MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 9)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomId}.${extension}`

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename)

      const imageUrl = publicUrl.publicUrl

      // Update preview
      setPreview(imageUrl)

      // Call callback with new URL
      onImageUpload(imageUrl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir la imagen'
      setError(errorMessage)
      console.error('[v0] Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Cambiar imagen
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed cursor-pointer hover:border-primary transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="font-medium mb-1">Haz clic para subir una imagen</p>
            <p className="text-sm text-muted-foreground">
              O arrastra una imagen aquí (máx. 5MB)
            </p>
            {uploading && (
              <div className="mt-4 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Subiendo...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded">
          {error}
        </div>
      )}
    </div>
  )
}
