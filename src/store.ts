import { create } from 'zustand'
import {
  Article,
  Block,
  BlockType,
  Thumbnail,
  defaultArticle,
} from './types'

const uid = () => Math.random().toString(36).slice(2, 10)

const empty = (type: BlockType): Block => {
  switch (type) {
    case 'paragraph':
      return { id: uid(), type, text: '' }
    case 'heading':
      return { id: uid(), type, text: '' }
    case 'subheading':
      return { id: uid(), type, text: '' }
    case 'quote':
      return { id: uid(), type, text: '', attribution: '' }
    case 'image':
      return { id: uid(), type, src: '', caption: '' }
    case 'divider':
      return { id: uid(), type }
  }
}

interface State {
  article: Article
  selectedBlockId: string | null
  setTitle: (s: string) => void
  setSubtitle: (s: string) => void
  setAuthor: (s: string) => void
  patchThumbnail: (patch: Partial<Thumbnail>) => void
  resetThumbnail: () => void
  addBlock: (type: BlockType, afterId?: string) => string
  updateBlock: (id: string, patch: Partial<Block>) => void
  removeBlock: (id: string) => void
  moveBlock: (id: string, direction: -1 | 1) => void
  selectBlock: (id: string | null) => void
  loadArticle: (a: Article) => void
  resetArticle: () => void
}

export const useStore = create<State>((set) => ({
  article: defaultArticle(),
  selectedBlockId: null,
  setTitle: (s) =>
    set((st) => ({ article: { ...st.article, title: s } })),
  setSubtitle: (s) =>
    set((st) => ({ article: { ...st.article, subtitle: s } })),
  setAuthor: (s) =>
    set((st) => ({ article: { ...st.article, author: s } })),
  patchThumbnail: (patch) =>
    set((st) => ({
      article: {
        ...st.article,
        thumbnail: { ...st.article.thumbnail, ...patch },
      },
    })),
  resetThumbnail: () =>
    set((st) => ({
      article: {
        ...st.article,
        thumbnail: { ...st.article.thumbnail, imageSrc: null,
          crop: { scale: 1, offsetX: 0, offsetY: 0 } },
      },
    })),
  addBlock: (type, afterId) => {
    const block = empty(type)
    set((st) => {
      const blocks = [...st.article.blocks]
      if (afterId) {
        const idx = blocks.findIndex((b) => b.id === afterId)
        if (idx === -1) blocks.push(block)
        else blocks.splice(idx + 1, 0, block)
      } else {
        blocks.push(block)
      }
      return {
        article: { ...st.article, blocks },
        selectedBlockId: block.id,
      }
    })
    return block.id
  },
  updateBlock: (id, patch) =>
    set((st) => ({
      article: {
        ...st.article,
        blocks: st.article.blocks.map((b) =>
          b.id === id ? ({ ...b, ...patch } as Block) : b,
        ),
      },
    })),
  removeBlock: (id) =>
    set((st) => {
      const blocks = st.article.blocks.filter((b) => b.id !== id)
      return {
        article: {
          ...st.article,
          blocks: blocks.length
            ? blocks
            : [{ id: uid(), type: 'paragraph', text: '' }],
        },
        selectedBlockId:
          st.selectedBlockId === id ? null : st.selectedBlockId,
      }
    }),
  moveBlock: (id, direction) =>
    set((st) => {
      const blocks = [...st.article.blocks]
      const idx = blocks.findIndex((b) => b.id === id)
      const target = idx + direction
      if (idx === -1 || target < 0 || target >= blocks.length) {
        return st
      }
      ;[blocks[idx], blocks[target]] = [blocks[target], blocks[idx]]
      return { article: { ...st.article, blocks } }
    }),
  selectBlock: (id) => set({ selectedBlockId: id }),
  loadArticle: (a) => set({ article: a, selectedBlockId: null }),
  resetArticle: () =>
    set({ article: defaultArticle(), selectedBlockId: null }),
}))
