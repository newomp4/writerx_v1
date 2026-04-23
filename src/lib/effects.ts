import type { OverlayBlend, OverlayPosition, Thumbnail } from '../types'

export const THUMB_W = 1600
export const THUMB_H = 900

let noiseCanvas: HTMLCanvasElement | null = null
let noiseCanvasSize = { w: 0, h: 0 }

function getNoiseTile(w: number, h: number): HTMLCanvasElement {
  if (
    noiseCanvas &&
    noiseCanvasSize.w === w &&
    noiseCanvasSize.h === h
  ) {
    return noiseCanvas
  }
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const data = img.data
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  noiseCanvas = c
  noiseCanvasSize = { w, h }
  return c
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

interface RenderOpts {
  ctx: CanvasRenderingContext2D
  img: HTMLImageElement | null
  thumb: Thumbnail
  width: number
  height: number
  effectiveTitle: string
  effectiveSubtitle: string
}

export function renderThumbnail({
  ctx,
  img,
  thumb,
  width,
  height,
  effectiveTitle,
  effectiveSubtitle,
}: RenderOpts) {
  ctx.save()
  ctx.clearRect(0, 0, width, height)

  if (!img) {
    drawPlaceholder(ctx, width, height)
  } else {
    drawCroppedImage(ctx, img, thumb, width, height)
  }

  if (img) {
    drawGrain(ctx, width, height, thumb.grain)
    drawVignette(ctx, width, height, thumb.vignette)
  }

  drawOverlay(ctx, {
    width,
    height,
    title: effectiveTitle,
    subtitle: effectiveSubtitle,
    position: thumb.overlayPosition,
    blend: thumb.overlayBlend,
  })

  ctx.restore()
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.fillStyle = '#171717'
  ctx.fillRect(0, 0, w, h)
  const tile = 40
  ctx.fillStyle = '#262626'
  for (let y = 0; y < h; y += tile) {
    for (let x = 0; x < w; x += tile) {
      if (((x / tile) + (y / tile)) % 2 === 0) {
        ctx.fillRect(x, y, tile, tile)
      }
    }
  }
}

function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  thumb: Thumbnail,
  w: number,
  h: number,
) {
  const frameAspect = w / h
  const imgAspect = img.naturalWidth / img.naturalHeight

  // "cover" base: image fills frame fully
  let baseW: number, baseH: number
  if (imgAspect > frameAspect) {
    baseH = h
    baseW = h * imgAspect
  } else {
    baseW = w
    baseH = w / imgAspect
  }

  const drawW = baseW * thumb.crop.scale
  const drawH = baseH * thumb.crop.scale

  const slackX = drawW - w
  const slackY = drawH - h

  // offset is -1..1, where -1 = max left/up, 1 = max right/down
  const dx = -slackX / 2 + (thumb.crop.offsetX * slackX) / 2
  const dy = -slackY / 2 + (thumb.crop.offsetY * slackY) / 2

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()

  ctx.filter = `contrast(${thumb.contrast}) saturate(0.92)`
  ctx.drawImage(img, dx, dy, drawW, drawH)
  ctx.filter = 'none'
  ctx.restore()
}

function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number,
) {
  if (amount <= 0) return
  const tile = getNoiseTile(360, 360)
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = Math.min(1, amount)
  const pattern = ctx.createPattern(tile, 'repeat')
  if (pattern) {
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number,
) {
  if (amount <= 0) return
  const cx = w / 2
  const cy = h / 2
  const radius = Math.hypot(cx, cy)
  const gradient = ctx.createRadialGradient(
    cx,
    cy,
    radius * 0.45,
    cx,
    cy,
    radius,
  )
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.85, amount)})`)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

interface OverlayOpts {
  width: number
  height: number
  title: string
  subtitle: string
  position: OverlayPosition
  blend: OverlayBlend
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  { width, height, title, subtitle, position, blend }: OverlayOpts,
) {
  if (!title && !subtitle) return

  ctx.save()
  ctx.globalCompositeOperation = blend as GlobalCompositeOperation
  ctx.fillStyle = '#ffffff'
  // For 'difference' blend, white inverts whatever's beneath.

  // Tight tracking - newer browsers support letterSpacing on Canvas2D
  const ctxAny = ctx as unknown as { letterSpacing?: string }
  const titleSize = Math.round(width * 0.078)
  const subSize = Math.round(width * 0.022)
  const lineGap = Math.round(width * 0.012)
  const padding = Math.round(width * 0.045)

  const TITLE_FONT = `900 ${titleSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`
  const SUB_FONT = `100 ${subSize}px "Helvetica Neue", "Arial", sans-serif`

  // measure
  ctxAny.letterSpacing = `${Math.round(titleSize * -0.05)}px`
  ctx.font = TITLE_FONT
  const titleLines = wrapText(ctx, title.toUpperCase(), width * 0.55)
  const titleHeight = titleLines.length * titleSize * 0.95

  ctxAny.letterSpacing = `${Math.round(subSize * -0.02)}px`
  ctx.font = SUB_FONT
  const subWidth = subtitle ? ctx.measureText(subtitle.toUpperCase()).width : 0
  const subHeight = subtitle ? subSize * 1.1 : 0

  const totalHeight = titleHeight + (subtitle ? subHeight + lineGap : 0)

  const isLeft = position.endsWith('left')
  const isRight = position.endsWith('right')
  const isCenter = position.endsWith('center')
  const isTop = position.startsWith('top')

  let originX = padding
  if (isCenter) originX = width / 2
  if (isRight) originX = width - padding

  let originY = isTop ? padding : height - padding - totalHeight

  // Subtitle: above the title, like an eyebrow
  if (subtitle) {
    ctxAny.letterSpacing = `${Math.round(subSize * -0.02)}px`
    ctx.font = SUB_FONT
    ctx.textBaseline = 'top'
    if (isCenter) {
      ctx.textAlign = 'center'
    } else if (isRight) {
      ctx.textAlign = 'right'
    } else {
      ctx.textAlign = 'left'
    }
    ctx.fillText(subtitle.toUpperCase(), originX, originY)
    originY += subHeight + lineGap
  }

  if (title) {
    ctxAny.letterSpacing = `${Math.round(titleSize * -0.05)}px`
    ctx.font = TITLE_FONT
    ctx.textBaseline = 'top'
    if (isCenter) {
      ctx.textAlign = 'center'
    } else if (isRight) {
      ctx.textAlign = 'right'
    } else {
      ctx.textAlign = 'left'
    }
    let y = originY
    for (const line of titleLines) {
      ctx.fillText(line, originX, y)
      y += titleSize * 0.95
    }
  }

  // reset letterSpacing
  ctxAny.letterSpacing = '0px'
  // mark unused
  void subWidth
  ctx.restore()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text) return []
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? current + ' ' + word : word
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 4)
}
