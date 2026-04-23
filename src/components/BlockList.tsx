import { useRef } from 'react'
import { useStore } from '../store'
import type { Block, BlockType } from '../types'
import {
  IconDivider,
  IconDown,
  IconHeading,
  IconImage,
  IconParagraph,
  IconPlus,
  IconQuote,
  IconSubheading,
  IconTrash,
  IconUp,
} from './Icon'

const TYPES: { type: BlockType; label: string; Icon: typeof IconParagraph }[] = [
  { type: 'paragraph', label: 'Text', Icon: IconParagraph },
  { type: 'heading', label: 'H1', Icon: IconHeading },
  { type: 'subheading', label: 'H2', Icon: IconSubheading },
  { type: 'quote', label: 'Quote', Icon: IconQuote },
  { type: 'image', label: 'Image', Icon: IconImage },
  { type: 'divider', label: 'Rule', Icon: IconDivider },
]

export function BlockList() {
  const blocks = useStore((s) => s.article.blocks)
  const addBlock = useStore((s) => s.addBlock)

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <BlockRow key={block.id} block={block} index={idx} total={blocks.length} />
      ))}

      <div className="pt-2">
        <div className="field-label">Add block</div>
        <div className="grid grid-cols-3 gap-1.5">
          {TYPES.map(({ type, label, Icon }) => (
            <button
              key={type}
              className="btn"
              onClick={() => addBlock(type)}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function BlockRow({
  block,
  index,
  total,
}: {
  block: Block
  index: number
  total: number
}) {
  const updateBlock = useStore((s) => s.updateBlock)
  const removeBlock = useStore((s) => s.removeBlock)
  const moveBlock = useStore((s) => s.moveBlock)
  const addBlock = useStore((s) => s.addBlock)

  const onParagraphKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      addBlock('paragraph', block.id)
    }
  }

  return (
    <div className="group relative rounded-md border border-transparent
                    hover:border-ink-800 transition-colors p-2 -mx-2">
      <div className="absolute -left-1 top-2 hidden group-hover:flex flex-col gap-0.5">
        <button
          className="icon-btn !w-5 !h-5"
          onClick={() => moveBlock(block.id, -1)}
          disabled={index === 0}
          title="Move up"
        >
          <IconUp size={12} />
        </button>
        <button
          className="icon-btn !w-5 !h-5"
          onClick={() => moveBlock(block.id, 1)}
          disabled={index === total - 1}
          title="Move down"
        >
          <IconDown size={12} />
        </button>
      </div>

      <div className="absolute -right-1 top-2 hidden group-hover:block">
        <button
          className="icon-btn !w-5 !h-5 hover:!text-red-600"
          onClick={() => removeBlock(block.id)}
          title="Delete"
        >
          <IconTrash size={12} />
        </button>
      </div>

      <BlockMeta type={block.type} />

      {block.type === 'paragraph' && (
        <AutoTextarea
          value={block.text}
          placeholder="Write a paragraph…"
          onChange={(text) => updateBlock(block.id, { text })}
          onKeyDown={onParagraphKeyDown}
          className="field-textarea !bg-transparent !border-transparent !p-0
                     text-[14px] text-ink-200"
        />
      )}

      {block.type === 'heading' && (
        <input
          className="w-full bg-transparent outline-none text-[16px] font-display
                     tracking-tight text-ink-50 placeholder:text-ink-700"
          placeholder="Heading"
          value={block.text}
          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
        />
      )}

      {block.type === 'subheading' && (
        <input
          className="w-full bg-transparent outline-none text-[14px] font-semibold
                     tracking-tight text-ink-100 placeholder:text-ink-700"
          placeholder="Subheading"
          value={block.text}
          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
        />
      )}

      {block.type === 'quote' && (
        <div className="space-y-1.5 pl-3 border-l-2 border-ink-700">
          <AutoTextarea
            value={block.text}
            placeholder="Quote…"
            onChange={(text) => updateBlock(block.id, { text })}
            className="field-textarea !bg-transparent !border-transparent !p-0
                       italic text-[14px] text-ink-200"
          />
          <input
            className="w-full bg-transparent outline-none text-[11px] uppercase
                       tracking-[0.12em] text-ink-500 placeholder:text-ink-700"
            placeholder="— Attribution"
            value={block.attribution || ''}
            onChange={(e) =>
              updateBlock(block.id, { attribution: e.target.value })
            }
          />
        </div>
      )}

      {block.type === 'image' && (
        <ImageBlock
          src={block.src}
          caption={block.caption || ''}
          onSrc={(src) => updateBlock(block.id, { src })}
          onCaption={(caption) => updateBlock(block.id, { caption })}
        />
      )}

      {block.type === 'divider' && (
        <div className="h-px bg-ink-700 my-2" />
      )}
    </div>
  )
}

function BlockMeta({ type }: { type: BlockType }) {
  const labels: Record<BlockType, string> = {
    paragraph: 'P',
    heading: 'H1',
    subheading: 'H2',
    quote: 'Quote',
    image: 'Image',
    divider: 'Rule',
  }
  return (
    <div className="absolute -top-2 left-2 px-1.5 bg-ink-900 text-[9px] uppercase
                    tracking-[0.12em] text-ink-500 hidden group-hover:block">
      {labels[type]}
    </div>
  )
}

function AutoTextarea({
  value,
  placeholder,
  onChange,
  onKeyDown,
  className,
}: {
  value: string
  placeholder: string
  onChange: (s: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  className?: string
}) {
  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
  return (
    <textarea
      ref={(el) => {
        if (el) resize(el)
      }}
      className={className}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value)
        resize(e.currentTarget)
      }}
      onKeyDown={onKeyDown}
      rows={1}
    />
  )
}

function ImageBlock({
  src,
  caption,
  onSrc,
  onCaption,
}: {
  src: string
  caption: string
  onSrc: (s: string) => void
  onCaption: (s: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = Array.from(files).find((f) =>
      f.type.startsWith('image/'),
    )
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <div
        className={`w-full rounded-md border border-dashed border-ink-800
                    overflow-hidden bg-ink-950/40 cursor-pointer
                    hover:border-ink-100 transition-colors ${
                      src ? '' : 'aspect-video flex items-center justify-center text-ink-500'
                    }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        {src ? (
          <img src={src} alt="" className="w-full block" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <IconPlus size={16} />
            <div className="text-[11px] uppercase tracking-[0.12em]">
              Add image
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        className="field-input"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => onCaption(e.target.value)}
      />
    </div>
  )
}
