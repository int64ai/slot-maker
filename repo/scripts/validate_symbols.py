

import os
from PIL import Image
import numpy as np

def validate_symbols(directory, min_content_threshold=0.01):
    """
    Validates symbols in a directory based on the Transparent Border Principle
    and a minimum content threshold. Deletes invalid files.
    """
    print(f"--- Running Validation in {directory} ---")
    files_to_delete = []

    for filename in os.listdir(directory):
        if not filename.startswith("symbol_") or not filename.endswith(".png"):
            continue

        filepath = os.path.join(directory, filename)
        try:
            img = Image.open(filepath).convert("RGBA")
            img_array = np.array(img)
        except Exception as e:
            print(f"Could not open or process {filename}: {e}")
            continue

        # --- Rule #5: Transparent Border Principle ---
        # Get alpha channel of the border pixels
        border_top = img_array[0, :, 3]
        border_bottom = img_array[-1, :, 3]
        border_left = img_array[:, 0, 3]
        border_right = img_array[:, -1, 3]
        
        # Check if any border pixel is non-transparent (alpha > 0)
        if np.any(border_top > 0) or np.any(border_bottom > 0) or \
           np.any(border_left > 0) or np.any(border_right > 0):
            print(f"FAILED Validation: {filename} has non-transparent pixels on its border. Marked for deletion.")
            files_to_delete.append(filepath)
            continue

        # --- Additional Check: Minimum Content ---
        # Check if the image is mostly empty (likely from an empty grid cell)
        total_pixels = img.width * img.height
        non_transparent_pixels = np.sum(img_array[:, :, 3] > 0)
        content_ratio = non_transparent_pixels / total_pixels
        
        if content_ratio < min_content_threshold:
            print(f"FAILED Validation: {filename} has too little content ({content_ratio:.2%}). Likely noise. Marked for deletion.")
            files_to_delete.append(filepath)
            continue

        print(f"PASSED Validation: {filename}")

    # --- Deletion Phase ---
    if files_to_delete:
        print("\n--- Deleting Invalid Files ---")
        for f in set(files_to_delete): # Use set to avoid deleting twice
            try:
                os.remove(f)
                print(f"Deleted {os.path.basename(f)}")
            except OSError as e:
                print(f"Error deleting file {os.path.basename(f)}: {e}")
    else:
        print("\nAll symbols passed validation.")


if __name__ == "__main__":
    SYMBOLS_DIR = "repo/assets/images/symbols"
    validate_symbols(SYMBOLS_DIR)


