# TeeJutsu Backend Service

This directory contains the Python backend service for the TeeJutsu Mockup Generator. It uses **FastAPI** and **OpenCV** to process images and apply logos with realistic fold/wrinkle simulation.

## Structure

- `main.py`: The API entry point (FastAPI).
- `core.py`: Core image processing logic (OpenCV).
- `requirements.txt`: Python dependencies.

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Start the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### `POST /overlay`

Accepts a main image, a logo image, and configuration parameters to generate a mockup.

**Parameters:**
- `main_image` (File): The background jacket/apparel image.
- `logo_image` (File): The logo/graphic to overlay.
- `config` (String): JSON string containing:
  - `x` (float): Horizontal position (0-1).
  - `y` (float): Vertical position (0-1).
  - `scale` (float): Scale relative to main image width (e.g., 0.3).
  - `rotation` (float): Rotation in degrees.
  - `opacity` (float): Opacity (0-1).
  - `displacementStrength` (float): Intensity of the fold simulation (0-1).

**Example (cURL):**
```bash
curl -X POST "http://localhost:8000/overlay" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "main_image=@jacket.jpg" \
  -F "logo_image=@logo.png" \
  -F "config={\"x\": 0.5, \"y\": 0.5, \"scale\": 0.3, \"rotation\": 0, \"opacity\": 0.9, \"displacementStrength\": 0.5}" \
  --output result.jpg
```
