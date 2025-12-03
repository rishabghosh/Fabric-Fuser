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
  - `horizontal` (float): Horizontal position (0-1)
  - `vertical` (float): Vertical position (0-1)
  - `scale` (float): Logo scale relative to image width
  - `rotation` (float): Rotation in degrees
  - `opacity` (float): Opacity (0-1)
  - `fold_shadow_intensity` (float): Fold simulation intensity (0-1)

**Example with cURL:**
```bash
curl -X POST "http://localhost:8000/overlay" \
  -F "main_image=@jacket.jpg" \
  -F "logo_image=@logo.png" \
  -F 'config={"horizontal": 0.5, "vertical": 0.5, "scale": 0.3, "rotation": 0, "opacity": 0.9, "fold_shadow_intensity": 0.5}' \
  --output result.jpg
```

### `GET /health`

Health check endpoint.

### `GET /`

API info endpoint.

## Bulk Update Feature

Process multiple apparel images with your logo in batch mode using the `bulk_update.py` script.

### Setup

1. Configure environment variables in `.env`:
   ```bash
   LOGO_IMAGE_PATH=./input/logo.png
   MAIN_IMAGES_DIR=./input/main_images
   OUTPUT_DIR=./output
   CONFIG_JSON_PATH=./config.json
   ```

2. Create directory structure:
   ```
   backend/
   ├── input/
   │   ├── logo.png
   │   └── main_images/
   │       ├── tshirt-white.jpg
   │       ├── hoodie-black.jpg
   │       └── ...
   └── output/
   ```

3. Configure `config.json` with settings for each image:
   ```json
   [
     {
       "filename": "tshirt-white.jpg",
       "config": {
         "horizontal": 0.5,
         "vertical": 0.45,
         "scale": 0.3,
         "rotation": 0,
         "opacity": 0.9,
         "fold_shadow_intensity": 0.5
       }
     }
   ]
   ```

### Running Bulk Update

From the root directory:
```bash
npm run bulk
```

Or from the backend directory:
```bash
python3 bulk_update.py
```

The script will process all images in `MAIN_IMAGES_DIR` and save them as `processed_{filename}` in the `OUTPUT_DIR`.

## Features

- **Realistic fold simulation** using luminance-based displacement mapping
- **Alpha channel support** for PNG logos
- **Image transformations** (rotation, scaling, positioning)
- **Blend modes** and opacity control
- **CORS enabled** for frontend integration
- **Batch processing** for multiple images with per-image configuration