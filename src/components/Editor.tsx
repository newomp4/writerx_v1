import { useStore } from '../store'
import { ThumbnailEditor } from './ThumbnailEditor'
import { BlockList } from './BlockList'

export function Editor() {
  const article = useStore((s) => s.article)
  const setTitle = useStore((s) => s.setTitle)
  const setSubtitle = useStore((s) => s.setSubtitle)
  const setAuthor = useStore((s) => s.setAuthor)

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-5 pb-3 border-b border-ink-200">
        <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400 font-medium">
          Article
        </div>
        <input
          className="w-full bg-transparent outline-none mt-2 text-[19px]
                     font-display tracking-tight text-ink-950 placeholder:text-ink-300"
          placeholder="Title"
          value={article.title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full bg-transparent outline-none mt-1 text-[13px]
                     text-ink-500 placeholder:text-ink-300"
          placeholder="Subtitle (optional)"
          value={article.subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <input
          className="w-full bg-transparent outline-none mt-1 text-[11px]
                     uppercase tracking-[0.12em] text-ink-400 placeholder:text-ink-300"
          placeholder="Author"
          value={article.author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="scroll-y flex-1">
        <Section title="Thumbnail">
          <ThumbnailEditor />
        </Section>

        <Section title="Body">
          <BlockList />
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-5 border-b border-ink-200">
      <h2 className="field-label mb-4">{title}</h2>
      {children}
    </div>
  )
}
