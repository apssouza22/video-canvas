# Video Canvas Component Plan

**Complexity:** ⚠️ Medium — Custom transform handles and multi-media layering; achievable in one pass with focused scope (canvas only, no timeline).

## Goal

Build a React 18 + TypeScript + Vite canvas editor inspired by [React Video Editor](https://demo.reactvideoeditor.com/), focused only on the preview/canvas surface. Users can add and manipulate **video**, **image**, and **text** elements with selection, drag, resize, and rotate — no timeline.

## Architecture

- Domain package: `src/domains/canvas/`
- State: React context + reducer for elements and selection
- Rendering: absolutely positioned layers inside a fixed-aspect-ratio viewport (1280×720 logical space, scaled to fit container)
- Interaction: custom transform overlay (move, 8-point resize, rotate handle)

## Implementation Steps

- [x] Scaffold Vite + React + TypeScript project (port 5555)
  - Validation: `npm run dev` starts without errors
- [x] Define canvas domain types (`VideoElement`, `ImageElement`, `TextElement`, transforms)
  - Validation: TypeScript compiles
- [x] Implement canvas store (add/update/delete/select elements, z-order)
  - Validation: unit test for reducer actions
- [x] Build `VideoCanvas` viewport with scaled composition area
  - Validation: renders empty canvas with correct aspect ratio
- [x] Build `CanvasElement` renderers for video, image, text
  - Validation: demo elements visible on canvas
- [x] Build `TransformOverlay` (selection box, drag, resize, rotate)
  - Validation: manual interaction updates element transform in state
- [x] Build toolbar to add video/image/text and properties panel for selected element
  - Validation: full add → select → transform → edit flow works in browser
- [x] Add Vitest unit tests for store reducer
  - Validation: `npm test` passes

## Out of Scope

- Timeline, playback scrubbing, export/render pipeline
- Remotion integration (canvas-only manipulation layer)
- External media APIs (Pexels, etc.) — use file upload and sample URLs
