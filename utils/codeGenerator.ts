import { LogoConfig } from '../types';

/**
 * In a production environment with a bundler (like Vite), we would import the file directly:
 * import rawTemplate from './pythontemplate.py?raw';
 * 
 * Since we are in a simulated browser environment, we embed the content of 'utils/pythontemplate.py'
 * here to mock the synchronous file read operation.
 */
const readPythonTemplateFile = (): string => {
return `import cv2
import numpy as np

def overlay_logo(main_img_path, logo_img_path, output_path):
    # 1. Load Images
    main_img = cv2.imread(main_img_path)
    logo_img = cv2.imread(logo_img_path, cv2.IMREAD_UNCHANGED) # Load with Alpha
    
    if main_img is None or logo_img is None:
        print("Error loading images")
        return

    h_main, w_main = main_img.shape[:2]

    # 2. Configuration Parameters
    scale_param = {{SCALE}}
    rotation = {{ROTATION}}
    pos_x_percent = {{POS_X}}
    pos_y_percent = {{POS_Y}}
    opacity = {{OPACITY}}
    disp_strength = {{DISP_STRENGTH}}
    
    # 3. Resize and Rotate Logo
    # Target width relative to main image width
    target_width = int(w_main * scale_param)
    if target_width == 0: return

    aspect_ratio = logo_img.shape[0] / logo_img.shape[1]
    target_height = int(target_width * aspect_ratio)
    
    logo_resized = cv2.resize(logo_img, (target_width, target_height), interpolation=cv2.INTER_AREA)
    
    # Rotate (keeping bounds)
    h_r, w_r = logo_resized.shape[:2]
    center = (w_r // 2, h_r // 2)
    M = cv2.getRotationMatrix2D(center, rotation, 1.0)
    
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int((h_r * sin) + (w_r * cos))
    new_h = int((h_r * cos) + (w_r * sin))
    M[0, 2] += (new_w / 2) - center[0]
    M[1, 2] += (new_h / 2) - center[1]
    
    logo_rotated = cv2.warpAffine(logo_resized, M, (new_w, new_h), 
                                  flags=cv2.INTER_LINEAR, 
                                  borderMode=cv2.BORDER_CONSTANT, 
                                  borderValue=(0,0,0,0))

    # 4. Region of Interest (ROI)
    center_x = int(pos_x_percent * w_main)
    center_y = int(pos_y_percent * h_main)
    
    top_left_x = center_x - (new_w // 2)
    top_left_y = center_y - (new_h // 2)
    
    # Calculate intersection with main image
    start_x = max(0, top_left_x)
    start_y = max(0, top_left_y)
    end_x = min(w_main, top_left_x + new_w)
    end_y = min(h_main, top_left_y + new_h)
    
    if end_x <= start_x or end_y <= start_y:
        print("Logo outside of image bounds")
        return

    # Slices
    logo_start_x = start_x - top_left_x
    logo_start_y = start_y - top_left_y
    logo_end_x = logo_start_x + (end_x - start_x)
    logo_end_y = logo_start_y + (end_y - start_y)
    
    logo_slice = logo_rotated[logo_start_y:logo_end_y, logo_start_x:logo_end_x]
    main_slice = main_img[start_y:end_y, start_x:end_x]

    # 5. Prepare Blending
    # Normalize images to 0-1 float
    main_float = main_slice.astype(float)
    logo_bgr = logo_slice[:, :, :3].astype(float)
    
    # Handle Alpha
    if logo_slice.shape[2] == 4:
        logo_a = logo_slice[:, :, 3].astype(float) / 255.0
    else:
        logo_a = np.ones((logo_slice.shape[0], logo_slice.shape[1]))

    # Apply global opacity
    effective_alpha = logo_a * opacity
    effective_alpha_3c = np.dstack([effective_alpha] * 3)

    # 6. Fold Simulation (Texture Blending)
    final_logo_visual = logo_bgr
    
    if disp_strength > 0:
        # Extract Value (Grayscale) from background
        hsv_bg = cv2.cvtColor(main_slice, cv2.COLOR_BGR2HSV)
        v_bg = hsv_bg[:, :, 2].astype(float) / 255.0
        texture_map = np.dstack([v_bg] * 3)
        
        # Apply texture via multiply only to the logo pixels
        textured_logo = logo_bgr * texture_map
        
        # Lerp based on strength
        final_logo_visual = (1.0 - disp_strength) * logo_bgr + disp_strength * textured_logo

    # 7. Composite
    # Result = (1 - alpha) * BG + alpha * Logo
    blended_slice = (1.0 - effective_alpha_3c) * main_float + effective_alpha_3c * final_logo_visual
    
    # 8. Save
    main_img[start_y:end_y, start_x:end_x] = np.clip(blended_slice, 0, 255).astype(np.uint8)
    cv2.imwrite(output_path, main_img)
    print(f"Saved to {output_path}")

# Run
overlay_logo('{{MAIN_IMAGE}}', '{{LOGO_IMAGE}}', 'output_result.jpg')

##### BATCH_SEPARATOR #####

import cv2
import numpy as np
import json
import os

def process_mockup(main_img_path, logo_img, output_path, config):
    """
    Applies the logo to the main image based on the config dict.
    Config keys: horizontal, vertical, scale, rotation, opacity, fold_shadow_intensity
    """
    # 1. Load Main Image
    main_img = cv2.imread(main_img_path)
    if main_img is None:
        print(f"Error loading {main_img_path}")
        return

    h_main, w_main = main_img.shape[:2]

    # 2. Extract Configuration
    # Defaults provided if keys are missing
    scale_param = config.get('scale', 0.3)
    rotation = config.get('rotation', 0)
    pos_x_percent = config.get('horizontal', 0.5)
    pos_y_percent = config.get('vertical', 0.5)
    opacity = config.get('opacity', 0.9)
    disp_strength = config.get('fold_shadow_intensity', 0.5)

    # 3. Resize and Rotate Logo
    target_width = int(w_main * scale_param)
    if target_width == 0: return

    aspect_ratio = logo_img.shape[0] / logo_img.shape[1]
    target_height = int(target_width * aspect_ratio)
    
    logo_resized = cv2.resize(logo_img, (target_width, target_height), interpolation=cv2.INTER_AREA)
    
    h_r, w_r = logo_resized.shape[:2]
    center = (w_r // 2, h_r // 2)
    M = cv2.getRotationMatrix2D(center, rotation, 1.0)
    
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int((h_r * sin) + (w_r * cos))
    new_h = int((h_r * cos) + (w_r * sin))
    M[0, 2] += (new_w / 2) - center[0]
    M[1, 2] += (new_h / 2) - center[1]
    
    logo_rotated = cv2.warpAffine(logo_resized, M, (new_w, new_h), 
                                  flags=cv2.INTER_LINEAR, 
                                  borderMode=cv2.BORDER_CONSTANT, 
                                  borderValue=(0,0,0,0))

    # 4. Region of Interest
    center_x = int(pos_x_percent * w_main)
    center_y = int(pos_y_percent * h_main)
    
    top_left_x = center_x - (new_w // 2)
    top_left_y = center_y - (new_h // 2)
    
    start_x = max(0, top_left_x)
    start_y = max(0, top_left_y)
    end_x = min(w_main, top_left_x + new_w)
    end_y = min(h_main, top_left_y + new_h)
    
    if end_x <= start_x or end_y <= start_y:
        print(f"Logo outside bounds for {main_img_path}")
        return

    logo_start_x = start_x - top_left_x
    logo_start_y = start_y - top_left_y
    logo_end_x = logo_start_x + (end_x - start_x)
    logo_end_y = logo_start_y + (end_y - start_y)
    
    logo_slice = logo_rotated[logo_start_y:logo_end_y, logo_start_x:logo_end_x]
    main_slice = main_img[start_y:end_y, start_x:end_x]

    # 5. Blending Logic
    main_float = main_slice.astype(float)
    logo_bgr = logo_slice[:, :, :3].astype(float)
    
    if logo_slice.shape[2] == 4:
        logo_a = logo_slice[:, :, 3].astype(float) / 255.0
    else:
        logo_a = np.ones((logo_slice.shape[0], logo_slice.shape[1]))

    effective_alpha = logo_a * opacity
    effective_alpha_3c = np.dstack([effective_alpha] * 3)

    final_logo_visual = logo_bgr
    
    if disp_strength > 0:
        hsv_bg = cv2.cvtColor(main_slice, cv2.COLOR_BGR2HSV)
        v_bg = hsv_bg[:, :, 2].astype(float) / 255.0
        texture_map = np.dstack([v_bg] * 3)
        textured_logo = logo_bgr * texture_map
        final_logo_visual = (1.0 - disp_strength) * logo_bgr + disp_strength * textured_logo

    blended_slice = (1.0 - effective_alpha_3c) * main_float + effective_alpha_3c * final_logo_visual
    main_img[start_y:end_y, start_x:end_x] = np.clip(blended_slice, 0, 255).astype(np.uint8)
    
    cv2.imwrite(output_path, main_img)
    print(f"Processed: {output_path}")

def run_batch_job(logo_path):
    # Load fixed logo once
    logo_img = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
    if logo_img is None:
        print("Error loading logo image")
        return

    # Define your jobs here
    # Example using current settings from the UI
    jobs = [
        {
            "main_image": "jacket_black.jpg",
            "output": "output_black.jpg",
            "config": {
                "horizontal": {{POS_X}},
                "vertical": {{POS_Y}},
                "scale": {{SCALE}},
                "rotation": {{ROTATION}},
                "opacity": {{OPACITY}},
                "fold_shadow_intensity": {{DISP_STRENGTH}}
            }
        },
        {
            "main_image": "jacket_white.jpg",
            "output": "output_white.jpg",
            "config": {
                "horizontal": 0.5,
                "vertical": 0.5,
                "scale": 0.25,
                "rotation": 0,
                "opacity": 0.9,
                "fold_shadow_intensity": 0.3
            }
        }
    ]

    print(f"Starting batch process for {len(jobs)} items...")
    
    for job in jobs:
        process_mockup(job['main_image'], logo_img, job['output'], job['config'])
        
    print("Batch job complete.")

if __name__ == "__main__":
    # Ensure this matches your logo filename
    run_batch_job('{{LOGO_IMAGE}}')
`;
}

export class CodeGenerator {
  private config: LogoConfig;
  private templateContent: string;
  private overlayTemplate: string;
  private batchTemplate: string;

  constructor(config: LogoConfig) {
    this.config = config;
    this.templateContent = readPythonTemplateFile();
    
    // Parse the template file
    const parts = this.templateContent.split('##### BATCH_SEPARATOR #####');
    this.overlayTemplate = parts[0].trim();
    this.batchTemplate = parts.length > 1 ? parts[1].trim() : '';
  }

  public generatePythonCode(
    mainImageName: string = 'jacket.jpg',
    logoImageName: string = 'logo.png'
  ): string {
    return this.overlayTemplate
      .replace('{{SCALE}}', this.config.scale.toFixed(3))
      .replace('{{ROTATION}}', this.config.rotation.toString())
      .replace('{{POS_X}}', this.config.x.toFixed(3))
      .replace('{{POS_Y}}', this.config.y.toFixed(3))
      .replace('{{OPACITY}}', this.config.opacity.toString())
      .replace('{{DISP_STRENGTH}}', this.config.displacementStrength.toFixed(2))
      .replace('{{MAIN_IMAGE}}', mainImageName)
      .replace('{{LOGO_IMAGE}}', logoImageName);
  }

  public generateBatchCode(
    logoImageName: string = 'logo.png'
  ): string {
    if (!this.batchTemplate) return "# Batch template not found in file";

    return this.batchTemplate
      .replace('{{SCALE}}', this.config.scale.toFixed(3))
      .replace('{{ROTATION}}', this.config.rotation.toString())
      .replace('{{POS_X}}', this.config.x.toFixed(3))
      .replace('{{POS_Y}}', this.config.y.toFixed(3))
      .replace('{{OPACITY}}', this.config.opacity.toString())
      .replace('{{DISP_STRENGTH}}', this.config.displacementStrength.toFixed(2))
      .replace('{{LOGO_IMAGE}}', logoImageName);
  }
}
