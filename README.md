# Writerx

A focused desktop writer for X articles. Split-screen: editor on the right,
live preview on the left. Drop in a photo and Writerx applies a consistent
thumbnail treatment — contrast / saturation, film grain, vignette, and a
mixed-weight title cluster (Arial Black for content words, Arial for the
small connectors like *the*, *of*, *and*) painted with a `difference` blend
so it stays readable on any image.

Mac only, dark mode only. Built with Electron, React, TypeScript, Vite,
Tailwind. Everything the project needs lives inside this folder — delete
the folder and it's gone.

---

## Run it

You need [Node.js](https://nodejs.org/) (any modern version, 18+).

```bash
cd writerx_v1
npm install      # one-time, downloads everything to ./node_modules
npm run dev      # opens the Writerx desktop window
```

To package as a real `.app` bundle:

```bash
npm run dist     # output goes to ./release
```

When you want to wipe the project, just delete this folder. `node_modules`,
the Electron binary, the build cache, the packaged app — all of it lives
under here. Nothing was installed system-wide.

---

## Workflow

1. **Type the title** at the top of the right panel. The preview updates as
   you type.
2. **Drop a photo** onto the thumbnail area (or click to browse). The image
   is auto-fit to a 16:9 frame.
3. **Position it.** Drag inside the frame to pan. Use the *Zoom* slider to
   tighten the crop.
4. **Add body content.** Use the block buttons at the bottom (Text, H1, H2,
   Quote, Image, Rule). Press ⌘↵ inside a paragraph to start a new one.
5. **Export the thumbnail** with the button in the top right. You get a
   1600×900 PNG ready for X.
6. **Save the article** as a `.writerx` file (it's just JSON) so you can
   come back to it later.

---

## What the thumbnail treatment actually does

Every thumbnail goes through the same pipeline so the visual identity is
consistent across all your articles. Pipeline lives in
[`src/lib/effects.ts`](src/lib/effects.ts):

1. **Crop** — your photo is drawn into a 1600×900 frame using a "cover"
   fit, then transformed by your zoom + pan.
2. **Contrast + saturation** — applied via the Canvas2D `filter`
   property (`contrast(1.18) saturate(0.92)` by default). Both are
   adjustable per-article from the sliders.
3. **Film grain** — a 360×360 noise tile is generated once and tiled across
   the frame using the `overlay` blend mode. The overlay blend brightens
   highlights and darkens shadows where the noise is brighter / darker than
   mid-gray, which is what gives it that gritty film look instead of just
   "TV static on top".
4. **Vignette** — a radial gradient from transparent (center) to dark
   (edges), composited with `multiply`. Gives focus to the middle of the
   frame.
5. **Title cluster** — the title is broken into "groups", one per content
   word. Connector words (`the`, `of`, `and`, `to`, `for`, `with`, `is`,
   etc. — see the full list in `effects.ts`) attach to the nearest content
   word as a small thin Arial prefix. Each group renders on its own line
   with a leading of ~82% of the font size, so lines visually fuse into
   one block. Inside each line, the small thin word is vertically *centered*
   against the big Arial Black word, so it nests inside the cap height
   instead of sitting on the same baseline. Letter-spacing on the bold is
   roughly −5% (tight). The whole thing is painted in **white** with
   `globalCompositeOperation = "difference"`, so each pixel becomes the
   inverse of whatever's underneath — the cluster is always readable
   regardless of the photo, no drop shadow needed.

You can tweak the contrast / saturation / grain / vignette sliders per
article and pick one of six overlay positions, but the *style* (fonts,
blend mode, tracking, sizing rules) is fixed so the look stays consistent.

---

## How the project is wired

- **Electron** (`electron/main.ts`) — the native macOS window. Owns the
  file dialogs (export PNG, save/load `.writerx`). Talks to the renderer
  through a small `preload.ts` bridge using context-isolated IPC.
- **Vite + React + TypeScript** (`src/`) — the actual UI. Vite hot-reloads
  the renderer on save; `vite-plugin-electron` handles the Electron side
  of the dev loop.
- **Zustand** (`src/store.ts`) — tiny state library. The whole article
  (title, blocks, thumbnail config) lives in one store. The preview and
  editor both subscribe to it, so anything you change on the right is
  reflected on the left within a frame.
- **HTML5 Canvas** — both the editor's crop preview *and* the preview
  panel's article header use the same `<ThumbnailCanvas>` component. The
  output PNG is rendered through the same pipeline at 1600×900. So what
  you see is exactly what you ship.
- **Tailwind CSS** — the monochrome styling. Custom palette in
  `tailwind.config.js` under the `ink` namespace (white → black).

### File map

```
writerx_v1/
├── electron/
│   ├── main.ts              # Electron app + IPC handlers (file dialogs)
│   └── preload.ts           # Safe bridge between Node and the web UI
├── src/
│   ├── App.tsx              # Top-level split-screen layout
│   ├── store.ts             # Zustand state store
│   ├── types.ts             # Article / Block / Thumbnail types
│   ├── lib/
│   │   └── effects.ts       # Canvas: crop, contrast, grain, vignette, overlay
│   └── components/
│       ├── TopBar.tsx       # Title bar with Save / Open / Export
│       ├── Editor.tsx       # Right panel
│       ├── Preview.tsx      # Left panel
│       ├── ThumbnailCanvas.tsx   # Reusable canvas renderer
│       ├── ThumbnailEditor.tsx   # Crop frame, sliders, overlay controls
│       ├── BlockList.tsx    # Body block editor
│       └── Icon.tsx         # Inline SVG icon set
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Notes

- **Fonts.** macOS ships with `Arial Black`. There isn't a true *Arial Thin*
  on the system, so the eyebrow text falls back to `Helvetica Neue` (which
  is closer in spirit and very thin at light weights). If you install an
  Arial Thin font, Writerx will pick it up automatically because the
  Canvas font stack lists it first.
- **Saved articles** are plain JSON with images embedded as base64 data
  URLs. That keeps a single `.writerx` file completely portable — no
  external image files to track — at the cost of larger files.
- **No telemetry, no network.** Everything runs locally. The only network
  activity is `npm install` downloading dependencies once.

---

## Tech stack at a glance

| Tool          | What it does for us                                            |
|---------------|-----------------------------------------------------------------|
| Electron      | Wraps a web UI in a real Mac window with native file dialogs   |
| Vite          | Dev server + bundler — instant rebuilds while you edit         |
| React + TS    | The UI tree, with type-checked props/state                     |
| Tailwind CSS  | Utility classes for the monochrome look                        |
| Zustand       | Lightweight state — the whole article in one store             |
| Canvas2D API  | Pixel-level control for the thumbnail effects + text overlay   |
