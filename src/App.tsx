import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { TopBar } from './components/TopBar'

export function App() {
  return (
    <div className="h-screen flex flex-col bg-ink-50 text-ink-900">
      <TopBar />
      <div className="flex-1 flex min-h-0 border-t border-ink-200">
        <section className="flex-1 min-w-0 border-r border-ink-200 bg-ink-100/40">
          <Preview />
        </section>
        <section className="w-[460px] shrink-0 bg-white">
          <Editor />
        </section>
      </div>
    </div>
  )
}
