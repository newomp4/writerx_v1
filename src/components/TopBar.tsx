import { useStore } from '../store'
import {
  IconExport,
  IconOpen,
  IconReset,
  IconSave,
} from './Icon'
import { renderThumbnail, THUMB_H, THUMB_W, loadImage } from '../lib/effects'

async function exportThumbnail() {
  const article = useStore.getState().article
  const canvas = document.createElement('canvas')
  canvas.width = THUMB_W
  canvas.height = THUMB_H
  const ctx = canvas.getContext('2d')!
  const img = article.thumbnail.imageSrc
    ? await loadImage(article.thumbnail.imageSrc)
    : null
  const effectiveTitle = article.thumbnail.overlayUseArticleTitle
    ? article.title
    : article.thumbnail.overlayTitle
  const effectiveSubtitle = article.thumbnail.overlayUseArticleTitle
    ? article.subtitle
    : article.thumbnail.overlaySubtitle
  renderThumbnail({
    ctx,
    img,
    thumb: article.thumbnail,
    width: THUMB_W,
    height: THUMB_H,
    effectiveTitle,
    effectiveSubtitle,
  })
  const dataUrl = canvas.toDataURL('image/png')
  const filename = (article.title || 'thumbnail')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.png'

  if (window.writerx) {
    await window.writerx.savePng(dataUrl, filename)
  } else {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }
}

async function saveArticle() {
  const article = useStore.getState().article
  const json = JSON.stringify(article, null, 2)
  const filename = (article.title || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.writerx'
  if (window.writerx) {
    await window.writerx.saveArticle(json, filename)
  } else {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

async function openArticle() {
  if (!window.writerx) return
  const result = await window.writerx.openArticle()
  if (result.ok && result.json) {
    try {
      const article = JSON.parse(result.json)
      useStore.getState().loadArticle(article)
    } catch (e) {
      console.error('Failed to parse article', e)
    }
  }
}

function resetArticle() {
  if (confirm('Reset the article? Unsaved changes will be lost.')) {
    useStore.getState().resetArticle()
  }
}

export function TopBar() {
  const title = useStore((s) => s.article.title)
  return (
    <header className="titlebar-drag h-11 px-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-3 pl-16">
        <span className="text-[13px] font-semibold tracking-tight text-ink-900">
          Writerx
        </span>
        <span className="text-[12px] text-ink-400 truncate max-w-[280px]">
          {title || 'Untitled article'}
        </span>
      </div>
      <div className="flex items-center gap-1 titlebar-no-drag">
        <button className="icon-btn" title="Reset" onClick={resetArticle}>
          <IconReset size={14} />
        </button>
        <button className="icon-btn" title="Open" onClick={openArticle}>
          <IconOpen size={14} />
        </button>
        <button className="icon-btn" title="Save" onClick={saveArticle}>
          <IconSave size={14} />
        </button>
        <button className="btn btn-primary" onClick={exportThumbnail}>
          <IconExport size={13} />
          Export thumbnail
        </button>
      </div>
    </header>
  )
}
