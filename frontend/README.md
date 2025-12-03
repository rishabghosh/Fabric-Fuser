# TeeJutsu Frontend

This directory contains the React Frontend for the TeeJutsu Mockup Generator. It provides a real-time, browser-based preview of logo placement on apparel using HTML5 Canvas.

## Features

- **Real-time Preview**: Uses HTML5 Canvas to simulate OpenCV operations instantly.
- **Smart Blending**: Simulates cloth folds using composite operations (Multiply/Hard-Light).
- **Interactive Controls**: Drag, scale, and rotate controls.
- **Code Generation**: Generates Python code to replicate the effect in the backend.

## Structure

The source files are located in the project root (due to the flat-file environment):
- `index.html`: Entry point.
- `App.tsx`: Main React component.
- `components/CanvasPreview.tsx`: The core Canvas rendering logic.
- `components/ControlPanel.tsx`: UI for adjusting parameters.

## Development

This project uses a standard React/Vite/Parcel setup style (implied by index.html + index.tsx).

To run locally (if exported):
```bash
npm install
npm run dev
```
