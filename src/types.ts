export type BlockType = 'paragraph' | 'heading' | 'subheading' | 'quote' | 'image' | 'divider'

export type Block =
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'subheading'; text: string }
  | { id: string; type: 'quote'; text: string; attribution?: string }
  | { id: string; type: 'image'; src: string; caption?: string }
  | { id: string; type: 'divider' }

export interface CropTransform {
  scale: number
  offsetX: number
  offsetY: number
}

export type OverlayBlend = 'difference' | 'overlay' | 'screen' | 'normal'
export type OverlayPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right'

export interface Thumbnail {
  imageSrc: string | null
  crop: CropTransform
  contrast: number
  grain: number
  vignette: number
  overlayBlend: OverlayBlend
  overlayPosition: OverlayPosition
  overlayTitle: string
  overlaySubtitle: string
  overlayUseArticleTitle: boolean
}

export interface Article {
  title: string
  subtitle: string
  author: string
  thumbnail: Thumbnail
  blocks: Block[]
}

export const defaultThumbnail = (): Thumbnail => ({
  imageSrc: null,
  crop: { scale: 1, offsetX: 0, offsetY: 0 },
  contrast: 1.18,
  grain: 0.32,
  vignette: 0.28,
  overlayBlend: 'difference',
  overlayPosition: 'bottom-left',
  overlayTitle: '',
  overlaySubtitle: '',
  overlayUseArticleTitle: true,
})

export const defaultArticle = (): Article => ({
  title: '',
  subtitle: '',
  author: '',
  thumbnail: defaultThumbnail(),
  blocks: [{ id: 'p-1', type: 'paragraph', text: '' }],
})
