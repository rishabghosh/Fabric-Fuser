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
    """Get configuration for a specific image, or return None if not in config"""
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

    # Return None if no match found (file not in config)
    return None

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

    # Load configuration
    config_data = load_config(config_json_path)

    # Load logo image
    with open(logo_path, 'rb') as f:
        logo_bytes = f.read()

    print(f"Logo loaded from: {logo_path}")
    print(f"Processing images from: {main_images_dir}")
    print("Files will be updated in place")
    print("-" * 50)

    # Get list of files to process from config.json
    files_to_process = []
    if isinstance(config_data, list):
        files_to_process = [item['filename'] for item in config_data]
    elif isinstance(config_data, dict):
        files_to_process = [item['filename'] for item in config_data.get('images', [])]

    print(f"Files to process from config.json: {len(files_to_process)}")
    print("-" * 50)

    # Process all images listed in config.json
    processed_count = 0
    skipped_count = 0
    error_count = 0

    for filename in files_to_process:
        file_path = os.path.join(main_images_dir, filename)

        # Skip if file doesn't exist
        if not os.path.isfile(file_path):
            print(f"Skipped: {filename} (file not found in directory)")
            skipped_count += 1
            continue

        try:
            # Get configuration for this image
            image_config = get_image_config(filename, config_data)

            if image_config is None:
                print(f"Skipped: {filename} (not in config)")
                skipped_count += 1
                continue

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

            # Replace the original file with processed result
            with open(file_path, 'wb') as f:
                f.write(result_bytes)

            print(f"  Updated: {filename}")
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