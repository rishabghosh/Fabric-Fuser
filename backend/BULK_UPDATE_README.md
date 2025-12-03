# Bulk Update Script

This script allows you to process multiple images with logo embedding in a single batch operation. Each image can have its own custom configuration for logo positioning, size, rotation, and other parameters.

## Setup

### 1. Install Dependencies

First, make sure all required packages are installed:

```bash
cd backend
python3 -m pip install -r requirements.txt
```

### 2. Create Configuration Files

#### Create `.env` file

Copy the example file and configure your paths:

```bash
cp .env.example .env
```

Edit `.env` and set your paths:

```env
LOGO_IMAGE_PATH=./input/logo.png
MAIN_IMAGES_DIR=./input/main_images
OUTPUT_DIR=./output
CONFIG_JSON_PATH=./config.json
```

#### Create `config.json` file

Copy the example configuration:

```bash
cp config.json.example config.json
```

Edit `config.json` to set custom configurations for each image:

```json
{
  "images": [
    {
      "filename": "tshirt-white.jpg",
      "config": {
        "x": 0.5,
        "y": 0.45,
        "scale": 0.3,
        "rotation": 0,
        "opacity": 0.9,
        "displacementStrength": 0.5
      }
    }
  ],
  "default_config": {
    "x": 0.5,
    "y": 0.5,
    "scale": 0.3,
    "rotation": 0,
    "opacity": 0.9,
    "displacementStrength": 0.5
  }
}
```

**Configuration Parameters:**
- `x`: Horizontal position (0.0 = left, 1.0 = right, 0.5 = center)
- `y`: Vertical position (0.0 = top, 1.0 = bottom, 0.5 = center)
- `scale`: Logo size relative to image width (0.3 = 30% of width)
- `rotation`: Rotation angle in degrees (positive = clockwise)
- `opacity`: Logo transparency (0.0 = transparent, 1.0 = opaque)
- `displacementStrength`: Fold effect intensity (0.0 = none, 1.0 = maximum)

### 3. Prepare Your Images

Create the input directory structure:

```bash
mkdir -p input/main_images
mkdir -p output
```

Place your files:
- Put your logo in `input/logo.png`
- Put all your main images (t-shirts, mockups, etc.) in `input/main_images/`

Supported formats: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, `.webp`

## Usage

Run the bulk update script:

```bash
python3 bulk_update.py
```

The script will:
1. Read the logo from the path specified in `.env`
2. Process each image in the main images directory
3. Apply the specific configuration for each image (from `config.json`)
4. Use default configuration for images not listed in `config.json`
5. Save processed images to the output directory with `processed_` prefix

## Example Output

```
Logo loaded from: ./input/logo.png
Processing images from: ./input/main_images
Output directory: ./output
--------------------------------------------------
Processing: tshirt-white.jpg
  Config: x=0.5, y=0.45, scale=0.3, rotation=0
  Saved: processed_tshirt-white.jpg
Processing: tshirt-black.jpg
  Config: x=0.5, y=0.48, scale=0.35, rotation=-5
  Saved: processed_tshirt-black.jpg
--------------------------------------------------
Processing complete!
  Processed: 2
  Skipped: 0
  Errors: 0
  Total files in directory: 2
```

## Tips

- Add specific configurations in `config.json` only for images that need custom positioning
- Images not listed will use the `default_config`
- The script will skip non-image files automatically
- All processed images are saved with the `processed_` prefix to avoid overwriting originals
- You can run the script multiple times - it will overwrite previous processed files

## Troubleshooting

**Error: Logo image not found**
- Check the `LOGO_IMAGE_PATH` in your `.env` file
- Ensure the file exists at the specified location

**Error: Main images directory not found**
- Check the `MAIN_IMAGES_DIR` in your `.env` file
- Create the directory if it doesn't exist

**Error: Configuration file not found**
- Check the `CONFIG_JSON_PATH` in your `.env` file
- Copy `config.json.example` to `config.json`

**Image processing errors**
- Check that your images are valid and not corrupted
- Ensure images are in a supported format
- Check that the logo image has a transparent background (PNG with alpha channel) for best results