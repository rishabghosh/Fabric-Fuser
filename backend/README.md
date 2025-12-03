# TeeJutsu Backend

Python backend service for TeeJutsu mockup generator. Uses FastAPI and OpenCV for image processing with realistic fold/wrinkle simulation.

## Tech Stack

- **FastAPI** - Web framework
- **OpenCV** - Image processing
- **Uvicorn** - ASGI server

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### `POST /overlay`

Process mockup with logo overlay.

**Form Parameters:**
- `main_image` (File): Background apparel image
- `logo_image` (File): Logo/graphic to overlay
- `config` (String): JSON configuration with:
  - `x` (float): Horizontal position (0-1)
  - `y` (float): Vertical position (0-1)
  - `scale` (float): Logo scale relative to image width
  - `rotation` (float): Rotation in degrees
  - `opacity` (float): Opacity (0-1)
  - `displacementStrength` (float): Fold simulation intensity (0-1)

**Example with cURL:**
```bash
curl -X POST "http://localhost:8000/overlay" \
  -F "main_image=@jacket.jpg" \
  -F "logo_image=@logo.png" \
  -F 'config={"x": 0.5, "y": 0.5, "scale": 0.3, "rotation": 0, "opacity": 0.9, "displacementStrength": 0.5}' \
  --output result.jpg
```

### `GET /health`

Health check endpoint.

### `GET /`

API info endpoint.

## Features

- **Realistic fold simulation** using luminance-based displacement mapping
- **Alpha channel support** for PNG logos
- **Image transformations** (rotation, scaling, positioning)
- **Blend modes** and opacity control
- **CORS enabled** for frontend integration