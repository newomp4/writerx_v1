import { useEffect, useRef, useState } from 'react'
import { renderThumbnail, loadImage, THUMB_W, THUMB_H } from '../lib/effects'
import type { Thumbnail } from '../types'

interface Props {
  thumb: Thumbnail
  title: string
  subtitle: string
  className?: string
}

export function ThumbnailCanvas({
  thumb,
  title,
  subtitle,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const lastSrc = useRef<string | null>(null)

  useEffect(() => {
    if (!thumb.imageSrc) {
      setImg(null)
      lastSrc.current = null
      return
    }
    if (lastSrc.current === thumb.imageSrc && img) return
    lastSrc.current = thumb.imageSrc
    let cancelled = false
    loadImage(thumb.imageSrc)
      .then((loaded) => {
        if (!cancelled) setImg(loaded)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumb.imageSrc])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    if (cssW === 0 || cssH === 0) return
    const px = Math.round(cssW * dpr)
    const py = Math.round(cssH * dpr)
    if (canvas.width !== px) canvas.width = px
    if (canvas.height !== py) canvas.height = py

    renderThumbnail({
      ctx,
      img,
      thumb,
      width: px,
      height: py,
      effectiveTitle: title,
      effectiveSubtitle: subtitle,
    })
  }, [img, thumb, title, subtitle])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', aspectRatio: `${THUMB_W} / ${THUMB_H}` }}
    />
  )
}
