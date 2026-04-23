export {}

declare global {
  interface Window {
    writerx?: {
      savePng: (
        dataUrl: string,
        suggestedName: string,
      ) => Promise<{ ok: boolean; path?: string }>
      saveArticle: (
        json: string,
        suggestedName: string,
      ) => Promise<{ ok: boolean; path?: string }>
      openArticle: () => Promise<{ ok: boolean; json?: string }>
    }
  }
}
