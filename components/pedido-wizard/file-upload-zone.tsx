"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { Upload, X, FileImage, File } from "lucide-react"
import type { UploadedFile } from "./types"

type Props = {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
}

export function FileUploadZone({ files, onChange }: Props) {
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const accepted = Array.from(incoming).filter(
        (f) => f.type.startsWith("image/") || f.type === "application/pdf"
      )
      const next = accepted.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      }))
      onChange([...files, ...next].slice(0, 8))
    },
    [files, onChange]
  )

  function removeFile(id: string) {
    const target = files.find((f) => f.id === id)
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
    onChange(files.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragging
            ? "border-gray-900 bg-gray-50 scale-[1.01]"
            : "border-gray-200 bg-gradient-to-b from-gray-50/80 to-white hover:border-gray-300"
        }`}
      >
        <label className="flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-lg">
            <Upload className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-gray-900">
            Arraste arquivos ou clique para enviar
          </p>
          <p className="mt-1.5 max-w-sm text-sm text-gray-500">
            Arte, logo, referência visual — PNG, JPG ou PDF até 10 MB cada
          </p>
          <input
            type="file"
            className="sr-only"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {item.previewUrl ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.previewUrl}
                    alt={item.file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-gray-50 p-4">
                  <File className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 truncate max-w-full px-2">{item.file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(item.id)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 border-t px-3 py-2">
                <FileImage className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-xs text-gray-600">{item.file.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
