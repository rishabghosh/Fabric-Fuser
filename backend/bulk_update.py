#!/usr/bin/env python3
"""
Bulk Update Script for FabricFuser
Processes multiple images with logo embedding based on JSON configuration
"""

import os
import json
import sys
from pathlib import Path
from dotenv import load_dotenv
from core import process_mockup

def load_config(config_path):
    """Load configuration from JSON file"""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Configuration file not found at {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in configuration file: {e}")
        sys.exit(1)

def get_image_config(filename, config_data):
    """Get configuration for a specific image, or return default config"""
    # Handle array format directly
    if isinstance(config_data, list):
        for image_config in config_data:
            if image_config['filename'] == filename:
                return image_config['config']
    # Handle old object format with 'images' key for backwards compatibility
    elif isinstance(config_data, dict):
        for image_config in config_data.get('images', []):
            if image_config['filename'] == filename:
                return image_config['config']
        if 'default_config' in config_data:
            return config_data['default_config']

    # Return default config if no match found
    return {
        'horizontal': 0.5,
        'vertical': 0.5,
        'scale': 0.3,
        'rotation': 0,
        'opacity': 0.9,
        'fold_shadow_intensity': 0.5
    }

def process_images():
    """Main function to process all images"""
    # Load environment variables
    load_dotenv()

    logo_path = os.getenv('LOGO_IMAGE_PATH', './input/logo.png')
    main_images_dir = os.getenv('MAIN_IMAGES_DIR', './input/main_images')
    output_dir = os.getenv('OUTPUT_DIR', './output')
    config_json_path = os.getenv('CONFIG_JSON_PATH', './config.json')

    # Validate paths
    if not os.path.exists(logo_path):
        print(f"Error: Logo image not found at {logo_path}")
        sys.exit(1)

    if not os.path.exists(main_images_dir):
        print(f"Error: Main images directory not found at {main_images_dir}")
        sys.exit(1)

    if not os.path.exists(config_json_path):
        print(f"Error: Configuration file not found at {config_json_path}")
        sys.exit(1)

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load configuration
    config_data = load_config(config_json_path)

    # Load logo image
    with open(logo_path, 'rb') as f:
        logo_bytes = f.read()

    print(f"Logo loaded from: {logo_path}")
    print(f"Processing images from: {main_images_dir}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)

    # Supported image formats
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}

    # Process all images in the directory
    processed_count = 0
    skipped_count = 0
    error_count = 0

    for filename in os.listdir(main_images_dir):
        file_path = os.path.join(main_images_dir, filename)

        # Skip if not a file
        if not os.path.isfile(file_path):
            continue

        # Skip if not a supported image format
        if Path(filename).suffix.lower() not in image_extensions:
            skipped_count += 1
            continue

        try:
            # Get configuration for this image
            image_config = get_image_config(filename, config_data)

            print(f"Processing: {filename}")
            print(f"  Config: horizontal={image_config.get('horizontal', 0.5)}, vertical={image_config.get('vertical', 0.5)}, "
                  f"scale={image_config.get('scale', 0.3)}, rotation={image_config.get('rotation', 0)}, "
                  f"opacity={image_config.get('opacity', 0.9)}, fold_shadow_intensity={image_config.get('fold_shadow_intensity', 0.5)}")

            # Load main image
            with open(file_path, 'rb') as f:
                main_bytes = f.read()

            # Process the mockup
            print(f"  Processing with config: {image_config}")
            result_bytes = process_mockup(main_bytes, logo_bytes, image_config)

            # Save the result
            output_filename = f"processed_{filename}"
            output_path = os.path.join(output_dir, output_filename)

            with open(output_path, 'wb') as f:
                f.write(result_bytes)

            print(f"  Saved: {output_filename}")
            processed_count += 1

        except Exception as e:
            print(f"  Error processing {filename}: {str(e)}")
            error_count += 1

    # Print summary
    print("-" * 50)
    print(f"Processing complete!")
    print(f"  Processed: {processed_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Errors: {error_count}")
    print(f"  Total files in directory: {len(os.listdir(main_images_dir))}")

if __name__ == "__main__":
    process_images()