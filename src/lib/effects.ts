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

  const dx = -slackX / 2 + (thumb.crop.offsetX * slackX) / 2
  const dy = -slackY / 2 + (thumb.crop.offsetY * slackY) / 2

  const saturation = thumb.saturation ?? 0.92

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()

  ctx.filter = `contrast(${thumb.contrast}) saturate(${saturation})`
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

// ─── Overlay (mixed-weight cluster) ─────────────────────────────────────
//
// Title is broken into "groups", one per content word. Connector words
// ("the", "of", "and", …) attach to the nearest content word as a small
// thin prefix or trailing suffix. Each group renders on its own line with
// extremely tight leading so the lines visually fuse into one cluster.

const CONNECTORS = new Set([
  'a', 'an', 'the',
  'and', 'or', 'but', 'nor', 'yet', 'so',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'as', 'is', 'are', 'be', 'was', 'were', 'am',
  'into', 'over', 'under', 'about', 'after', 'before',
  'my', 'your', 'our', 'his', 'her', 'their', 'its',
  'this', 'that', 'these', 'those', 'it',
  'no', 'not',
  'i', 'we', 'you', 'they', 'he', 'she',
  'vs', 'vs.', '&',
])

interface ClusterGroup {
  prefix: string[]
  content: string
  suffix: string[]
}

function isConnector(token: string): boolean {
  const bare = token.toLowerCase().replace(/[^a-z]/g, '')
  return CONNECTORS.has(bare)
}

function buildClusterGroups(title: string): ClusterGroup[] {
  const tokens = title
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toUpperCase())
  if (tokens.length === 0) return []

  const groups: ClusterGroup[] = []
  let pendingPrefix: string[] = []

  for (const tok of tokens) {
    if (isConnector(tok)) {
      pendingPrefix.push(tok)
    } else {
      groups.push({ prefix: pendingPrefix, content: tok, suffix: [] })
      pendingPrefix = []
    }
  }

  if (pendingPrefix.length > 0) {
    if (groups.length > 0) {
      groups[groups.length - 1].suffix = pendingPrefix
    } else {
      // Title is all connectors. Treat the whole thing as one content line.
      groups.push({
        prefix: [],
        content: pendingPrefix.join(' '),
        suffix: [],
      })
    }
  }

  return groups
}

interface Ctx2DWithLetterSpacing extends CanvasRenderingContext2D {
  letterSpacing: string
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  ;(ctx as Ctx2DWithLetterSpacing).letterSpacing = `${px}px`
}

function blackFont(size: number) {
  return `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`
}

function thinFont(size: number) {
  return `400 ${size}px "Arial", "Helvetica Neue", sans-serif`
}

interface MeasuredGroup {
  prefixText: string
  prefixW: number
  contentW: number
  suffixText: string
  suffixW: number
  totalW: number
}

function measureGroups(
  ctx: CanvasRenderingContext2D,
  groups: ClusterGroup[],
  titleSize: number,
  thinSize: number,
  innerGap: number,
): { items: MeasuredGroup[]; widest: number; totalH: number } {
  const items: MeasuredGroup[] = []
  let widest = 0

  const blackLs = Math.round(titleSize * -0.05)
  const thinLs = Math.round(thinSize * 0.04)

  for (const g of groups) {
    ctx.font = thinFont(thinSize)
    setLetterSpacing(ctx, thinLs)
    const prefixText = g.prefix.join(' ')
    const prefixOnly = prefixText ? ctx.measureText(prefixText).width : 0
    const prefixW = prefixText ? prefixOnly + innerGap : 0

    ctx.font = blackFont(titleSize)
    setLetterSpacing(ctx, blackLs)
    const contentW = ctx.measureText(g.content).width

    ctx.font = thinFont(thinSize)
    setLetterSpacing(ctx, thinLs)
    const suffixText = g.suffix.join(' ')
    const suffixOnly = suffixText ? ctx.measureText(suffixText).width : 0
    const suffixW = suffixText ? suffixOnly + innerGap : 0

    const totalW = prefixW + contentW + suffixW
    if (totalW > widest) widest = totalW

    items.push({
      prefixText,
      prefixW,
      contentW,
      suffixText,
      suffixW,
      totalW,
    })
  }

  // Tight leading: ~82% of titleSize per line
  const lineStride = titleSize * 0.82
  const totalH = (groups.length - 1) * lineStride + titleSize

  return { items, widest, totalH }
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

  const padding = Math.round(width * 0.045)
  const maxW = width - padding * 2
  const maxH = height - padding * 2

  const groups = buildClusterGroups(title)

  // ── Auto-fit: shrink until cluster fits the safe area ──
  let titleSize = width * 0.16
  let thinSize = titleSize * 0.36
  let innerGap = titleSize * 0.16
  let measured = groups.length
    ? measureGroups(ctx, groups, titleSize, thinSize, innerGap)
    : { items: [], widest: 0, totalH: 0 }

  let safety = 60
  while (
    safety-- > 0 &&
    groups.length > 0 &&
    (measured.widest > maxW || measured.totalH > maxH * 0.92)
  ) {
    titleSize *= 0.94
    thinSize = titleSize * 0.36
    innerGap = titleSize * 0.16
    measured = measureGroups(ctx, groups, titleSize, thinSize, innerGap)
    if (titleSize < 24) break
  }

  // ── Subtitle (eyebrow) ──
  const subSize = Math.max(14, Math.round(width * 0.018))
  const subText = subtitle ? subtitle.toUpperCase() : ''
  let subW = 0
  let subH = 0
  if (subText) {
    ctx.font = thinFont(subSize)
    setLetterSpacing(ctx, Math.round(subSize * 0.18))
    subW = ctx.measureText(subText).width
    subH = subSize * 1.2
  }

  // ── Anchoring ──
  const isTop = position.startsWith('top')
  const isCenter = position.endsWith('center')
  const isRight = position.endsWith('right')

  const anchorXFor = (w: number) => {
    if (isCenter) return width / 2 - w / 2
    if (isRight) return width - padding - w
    return padding
  }

  const subGap = subText ? Math.round(width * 0.012) : 0
  const totalH = (subText ? subH + subGap : 0) + measured.totalH
  const stackTop = isTop ? padding : height - padding - totalH

  // For top positions, subtitle reads better BELOW the cluster (like a
  // caption). For bottom positions, subtitle goes ABOVE the cluster
  // (eyebrow). Cluster Y depends on where the subtitle sits.
  const clusterY = isTop ? stackTop : stackTop + (subText ? subH + subGap : 0)
  const subtitleY = isTop
    ? stackTop + measured.totalH + subGap
    : stackTop

  // ── Subtitle ──
  if (subText) {
    ctx.font = thinFont(subSize)
    setLetterSpacing(ctx, Math.round(subSize * 0.18))
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText(subText, anchorXFor(subW), subtitleY)
  }

  // ── Cluster lines ──
  const lineStride = titleSize * 0.82
  const blackLs = Math.round(titleSize * -0.05)
  const thinLs = Math.round(thinSize * 0.04)

  let y = clusterY
  for (let i = 0; i < measured.items.length; i++) {
    const g = groups[i]
    const m = measured.items[i]
    let x = anchorXFor(m.totalW)

    // Prefix (thin, middle-aligned with content's mid)
    if (m.prefixText) {
      ctx.font = thinFont(thinSize)
      setLetterSpacing(ctx, thinLs)
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      ctx.fillText(m.prefixText, x, y + titleSize * 0.5)
      x += m.prefixW
    }

    // Content (big black, top-aligned)
    ctx.font = blackFont(titleSize)
    setLetterSpacing(ctx, blackLs)
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText(g.content, x, y)
    x += m.contentW

    // Suffix (thin, middle-aligned). Leading gap before the text.
    if (m.suffixText) {
      ctx.font = thinFont(thinSize)
      setLetterSpacing(ctx, thinLs)
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      ctx.fillText(m.suffixText, x + innerGap, y + titleSize * 0.5)
    }

    y += lineStride
  }

  setLetterSpacing(ctx, 0)
  ctx.restore()
}
