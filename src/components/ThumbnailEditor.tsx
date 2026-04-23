import { useCallback, useRef, useState } from 'react'
import { useStore } from '../store'
import type { OverlayPosition } from '../types'
import { IconReset, IconUpload } from './Icon'
import { ThumbnailCanvas } from './ThumbnailCanvas'

const POSITIONS: { value: OverlayPosition; label: string }[] = [
  { value: 'top-left', label: 'TL' },
  { value: 'top-center', label: 'TC' },
  { value: 'top-right', label: 'TR' },
  { value: 'bottom-left', label: 'BL' },
  { value: 'bottom-center', label: 'BC' },
  { value: 'bottom-right', label: 'BR' },
]

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ThumbnailEditor() {
  const thumb = useStore((s) => s.article.thumbnail)
  const articleTitle = useStore((s) => s.article.title)
  const articleSubtitle = useStore((s) => s.article.subtitle)
  const patchThumbnail = useStore((s) => s.patchThumbnail)
  const resetThumbnail = useStore((s) => s.resetThumbnail)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = Array.from(files).find((f) =>
        f.type.startsWith('image/'),
      )
      if (!file) return
      const src = await fileToDataUrl(file)
      patchThumbnail({
        imageSrc: src,
        crop: { scale: 1, offsetX: 0, offsetY: 0 },
      })
    },
    [patchThumbnail],
  )

  const effectiveTitle = thumb.overlayUseArticleTitle
    ? articleTitle
    : thumb.overlayTitle
  const effectiveSubtitle = thumb.overlayUseArticleTitle
    ? articleSubtitle
    : thumb.overlaySubtitle

  return (
    <div className="space-y-4">
      <CropFrame
        onUpload={() => inputRef.current?.click()}
        onFiles={handleFiles}
        title={effectiveTitle}
        subtitle={effectiveSubtitle}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {thumb.imageSrc && (
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn"
            onClick={() => inputRef.current?.click()}
          >
            <IconUpload size={13} />
            Replace
          </button>
          <button className="btn" onClick={resetThumbnail}>
            <IconReset size={13} />
            Remove
          </button>
        </div>
      )}

      <div>
        <label className="field-label">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={thumb.crop.scale}
          onChange={(e) =>
            patchThumbnail({
              crop: { ...thumb.crop, scale: parseFloat(e.target.value) },
            })
          }
          className="w-full accent-ink-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <Slider
          label="Contrast"
          min={0.8}
          max={1.6}
          step={0.01}
          value={thumb.contrast}
          onChange={(v) => patchThumbnail({ contrast: v })}
        />
        <Slider
          label="Saturation"
          min={0}
          max={2}
          step={0.01}
          value={thumb.saturation}
          onChange={(v) => patchThumbnail({ saturation: v })}
        />
        <Slider
          label="Grain"
          min={0}
          max={1}
          step={0.01}
          value={thumb.grain}
          onChange={(v) => patchThumbnail({ grain: v })}
        />
        <Slider
          label="Vignette"
          min={0}
          max={0.7}
          step={0.01}
          value={thumb.vignette}
          onChange={(v) => patchThumbnail({ vignette: v })}
        />
      </div>

      <div>
        <label className="field-label">Overlay position</label>
        <div className="grid grid-cols-3 gap-1.5">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              className={`h-7 text-[11px] tracking-tight rounded-md border transition-colors ${
                thumb.overlayPosition === p.value
                  ? 'bg-ink-100 text-ink-950 border-ink-100'
                  : 'bg-ink-900 text-ink-400 border-ink-800 hover:border-ink-100'
              }`}
              onClick={() =>
                patchThumbnail({ overlayPosition: p.value })
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-ink-300">
        <input
          type="checkbox"
          className="accent-ink-100"
          checked={thumb.overlayUseArticleTitle}
          onChange={(e) =>
            patchThumbnail({ overlayUseArticleTitle: e.target.checked })
          }
        />
        Use article title for overlay
      </label>

      {!thumb.overlayUseArticleTitle && (
        <div className="space-y-3">
          <div>
            <label className="field-label">Overlay title</label>
            <input
              className="field-input"
              value={thumb.overlayTitle}
              onChange={(e) =>
                patchThumbnail({ overlayTitle: e.target.value })
              }
              placeholder="HEADLINE"
            />
          </div>
          <div>
            <label className="field-label">Overlay subtitle</label>
            <input
              className="field-input"
              value={thumb.overlaySubtitle}
              onChange={(e) =>
                patchThumbnail({ overlaySubtitle: e.target.value })
              }
              placeholder="Eyebrow text"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <label className="field-label !mb-1">{label}</label>
        <span className="text-[10px] text-ink-400 tabular-nums">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-ink-100"
      />
    </div>
  )
}

function CropFrame({
  onUpload,
  onFiles,
  title,
  subtitle,
}: {
  onUpload: () => void
  onFiles: (files: FileList | null) => void
  title: string
  subtitle: string
}) {
  const thumb = useStore((s) => s.article.thumbnail)
  const patchThumbnail = useStore((s) => s.patchThumbnail)
  const [drag, setDrag] = useState(false)
  const startRef = useRef<{
    x: number
    y: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (!thumb.imageSrc) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: thumb.crop.offsetX,
      offsetY: thumb.crop.offsetY,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = (e.clientX - startRef.current.x) / rect.width
    const dy = (e.clientY - startRef.current.y) / rect.height
    const newX = clamp(startRef.current.offsetX - dx * 2, -1, 1)
    const newY = clamp(startRef.current.offsetY - dy * 2, -1, 1)
    patchThumbnail({
      crop: { ...thumb.crop, offsetX: newX, offsetY: newY },
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    startRef.current = null
  }

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        onFiles(e.dataTransfer.files)
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => {
        if (!thumb.imageSrc) {
          e.preventDefault()
          onUpload()
        }
      }}
      className={`relative w-full rounded-lg overflow-hidden bg-ink-950
                  border ${
                    drag
                      ? 'border-ink-100 border-2'
                      : 'border-ink-800'
                  }
                  ${
                    thumb.imageSrc
                      ? 'cursor-grab active:cursor-grabbing'
                      : 'cursor-pointer hover:border-ink-100'
                  } transition-colors`}
    >
      <ThumbnailCanvas
        thumb={thumb}
        title={title}
        subtitle={subtitle}
      />

      {!thumb.imageSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        text-ink-500 gap-1 pointer-events-none">
          <IconUpload size={20} />
          <div className="text-[11px] uppercase tracking-[0.12em]">
            Drop image
          </div>
          <div className="text-[10px]">or click to browse</div>
        </div>
      )}
    </div>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
