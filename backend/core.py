import cv2
import numpy as np
from PIL import Image
import io

def process_mockup(main_image_bytes, logo_image_bytes, config):
    """
    Process mockup with realistic fold simulation

    Args:
        main_image_bytes: Binary content of main image
        logo_image_bytes: Binary content of logo image
        config: Dict with keys: x, y, scale, rotation, opacity, displacementStrength

    Returns:
        Processed image as JPEG bytes
    """
    # Load images
    main_arr = np.frombuffer(main_image_bytes, np.uint8)
    main_img = cv2.imdecode(main_arr, cv2.IMREAD_COLOR)

    logo_arr = np.frombuffer(logo_image_bytes, np.uint8)
    logo_img = cv2.imdecode(logo_arr, cv2.IMREAD_UNCHANGED)

    # Get config parameters
    x = config.get('x', 0.5)
    y = config.get('y', 0.5)
    scale = config.get('scale', 0.3)
    rotation = config.get('rotation', 0)
    opacity = config.get('opacity', 0.9)
    displacement_strength = config.get('displacementStrength', 0.5)

    h, w = main_img.shape[:2]

    # Resize logo
    logo_width = int(w * scale)
    logo_height = int(logo_img.shape[0] * (logo_width / logo_img.shape[1]))
    logo_resized = cv2.resize(logo_img, (logo_width, logo_height), interpolation=cv2.INTER_AREA)

    # Rotate logo
    if rotation != 0:
        center = (logo_width // 2, logo_height // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, rotation, 1.0)
        logo_resized = cv2.warpAffine(logo_resized, rotation_matrix, (logo_width, logo_height))

    # Calculate position
    pos_x = int((w * x) - (logo_width / 2))
    pos_y = int((h * y) - (logo_height / 2))

    # Ensure position is within bounds
    pos_x = max(0, min(pos_x, w - logo_width))
    pos_y = max(0, min(pos_y, h - logo_height))

    # Extract region of interest for displacement
    roi = main_img[pos_y:pos_y+logo_height, pos_x:pos_x+logo_width]

    # Create displacement map from luminance
    gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    displacement_map = cv2.GaussianBlur(gray_roi, (15, 15), 0)

    # Apply displacement to logo
    logo_displaced = apply_displacement(logo_resized, displacement_map, displacement_strength)

    # Blend with opacity
    result = main_img.copy()

    if logo_displaced.shape[2] == 4:  # Has alpha channel
        logo_rgb = logo_displaced[:, :, :3]
        logo_alpha = (logo_displaced[:, :, 3] / 255.0) * opacity

        for c in range(3):
            result[pos_y:pos_y+logo_height, pos_x:pos_x+logo_width, c] = \
                result[pos_y:pos_y+logo_height, pos_x:pos_x+logo_width, c] * (1 - logo_alpha) + \
                logo_rgb[:, :, c] * logo_alpha
    else:
        # No alpha channel, use simple blending
        roi = result[pos_y:pos_y+logo_height, pos_x:pos_x+logo_width]
        blended = cv2.addWeighted(roi, 1 - opacity, logo_displaced, opacity, 0)
        result[pos_y:pos_y+logo_height, pos_x:pos_x+logo_width] = blended

    # Encode as JPEG
    _, encoded = cv2.imencode('.jpg', result, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return encoded.tobytes()

def apply_displacement(image, displacement_map, strength):
    """
    Apply displacement mapping for realistic fold effect
    """
    h, w = image.shape[:2]

    # Ensure displacement map matches image size
    if displacement_map.shape[:2] != (h, w):
        displacement_map = cv2.resize(displacement_map, (w, h))

    # Normalize displacement map
    displacement_norm = (displacement_map.astype(float) / 255.0 - 0.5) * 2 * strength * 10

    # Create mesh grid
    x, y = np.meshgrid(np.arange(w), np.arange(h))

    # Apply displacement
    x_displaced = x + displacement_norm
    y_displaced = y + displacement_norm

    # Ensure values are within bounds
    x_displaced = np.clip(x_displaced, 0, w - 1).astype(np.float32)
    y_displaced = np.clip(y_displaced, 0, h - 1).astype(np.float32)

    # Remap image
    displaced = cv2.remap(image, x_displaced, y_displaced, cv2.INTER_LINEAR)

    return displaced