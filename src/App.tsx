import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { TopBar } from './components/TopBar'

export function App() {
  return (
    <div className="h-screen flex flex-col bg-ink-950 text-ink-100">
      <TopBar />
      <div className="flex-1 flex min-h-0 border-t border-ink-800">
        <section className="flex-1 min-w-0 border-r border-ink-800 bg-ink-950">
          <Preview />
        </section>
        <section className="w-[460px] shrink-0 bg-ink-900">
          <Editor />
        </section>
      </div>
    </div>
  )
}
