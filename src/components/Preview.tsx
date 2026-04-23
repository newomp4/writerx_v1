import { useStore } from '../store'
import type { Block } from '../types'
import { ThumbnailCanvas } from './ThumbnailCanvas'

export function Preview() {
  const article = useStore((s) => s.article)
  const effectiveTitle = article.thumbnail.overlayUseArticleTitle
    ? article.title
    : article.thumbnail.overlayTitle
  const effectiveSubtitle = article.thumbnail.overlayUseArticleTitle
    ? article.subtitle
    : article.thumbnail.overlaySubtitle

  const dateLabel = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="h-full scroll-y bg-ink-950">
      <div className="max-w-[720px] mx-auto py-10 px-8">
        <div className="rounded-xl overflow-hidden bg-ink-900 border border-ink-800">
          <ThumbnailCanvas
            thumb={article.thumbnail}
            title={effectiveTitle}
            subtitle={effectiveSubtitle}
          />
        </div>

        <div className="mt-8 space-y-2">
          <h1 className="font-display text-[36px] leading-[1.1] tracking-tight text-ink-50">
            {article.title || (
              <span className="text-ink-700">Article title</span>
            )}
          </h1>
          {article.subtitle && (
            <p className="text-[18px] leading-snug text-ink-400">
              {article.subtitle}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 text-[12px] text-ink-500">
          {article.author && (
            <>
              <span className="font-medium text-ink-300">{article.author}</span>
              <span className="text-ink-700">·</span>
            </>
          )}
          <span>{dateLabel}</span>
        </div>

        <div className="mt-8 space-y-5">
          {article.blocks.map((block) => (
            <BlockView key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[16px] leading-[1.65] text-ink-200 whitespace-pre-wrap">
          {block.text || (
            <span className="text-ink-700">Empty paragraph…</span>
          )}
        </p>
      )
    case 'heading':
      return (
        <h2 className="font-display text-[24px] leading-tight tracking-tight text-ink-50 mt-6">
          {block.text || <span className="text-ink-700">Heading</span>}
        </h2>
      )
    case 'subheading':
      return (
        <h3 className="text-[18px] font-semibold leading-tight tracking-tight text-ink-100 mt-4">
          {block.text || <span className="text-ink-700">Subheading</span>}
        </h3>
      )
    case 'quote':
      return (
        <blockquote className="border-l-2 border-ink-100 pl-5 my-2">
          <p className="text-[18px] italic leading-snug text-ink-200">
            {block.text || (
              <span className="text-ink-700">Quote text…</span>
            )}
          </p>
          {block.attribution && (
            <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-ink-500">
              — {block.attribution}
            </div>
          )}
        </blockquote>
      )
    case 'image':
      return (
        <figure className="my-2">
          {block.src ? (
            <img
              src={block.src}
              alt=""
              className="w-full rounded-md border border-ink-800"
            />
          ) : (
            <div className="aspect-video bg-ink-900 rounded-md border border-dashed border-ink-700
                            flex items-center justify-center text-ink-500 text-[12px]">
              Image
            </div>
          )}
          {block.caption && (
            <figcaption className="mt-2 text-[12px] text-ink-500 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'divider':
      return (
        <div className="my-4 flex justify-center">
          <div className="w-12 h-px bg-ink-700" />
        </div>
      )
  }
}
