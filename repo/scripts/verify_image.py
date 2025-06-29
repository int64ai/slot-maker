

import os
from PIL import Image
import numpy as np

def verify_border_transparency(filepath):
    """
    Verifies that the border of a given image is fully transparent.
    """
    try:
        img = Image.open(filepath).convert("RGBA")
        img_array = np.array(img)
    except FileNotFoundError:
        print(f"Verification FAILED: File not found at {filepath}")
        return False

    # Get alpha channel of the border pixels
    border_top = img_array[0, :, 3]
    border_bottom = img_array[-1, :, 3]
    border_left = img_array[:, 0, 3]
    border_right = img_array[:, -1, 3]
    
    # Check if any border pixel is not fully transparent (alpha > 0)
    if np.any(border_top > 0) or np.any(border_bottom > 0) or \
       np.any(border_left > 0) or np.any(border_right > 0):
        print(f"Verification FAILED: {os.path.basename(filepath)} has non-transparent pixels on its border.")
        return False
    else:
        print(f"Verification PASSED: {os.path.basename(filepath)} has a fully transparent border.")
        return True

if __name__ == "__main__":
    TARGET_FILE = "repo/assets/images/symbols/symbol_01.png"
    verify_border_transparency(TARGET_FILE)

