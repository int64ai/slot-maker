
import os
from PIL import Image
import numpy as np

def clean_most_transparent_file(directory):
    """
    Finds all symbol files in a directory, and deletes the one
    with the highest ratio of transparent pixels (likely a dummy).
    """
    print(f"--- Cleaning most transparent file in {directory} ---")
    
    files = []
    for filename in os.listdir(directory):
        if filename.startswith("symbol_") and filename.endswith(".png"):
            filepath = os.path.join(directory, filename)
            try:
                img = Image.open(filepath).convert("RGBA")
                img_array = np.array(img)
                
                # Calculate transparency ratio
                total_pixels = img.width * img.height
                transparent_pixels = np.sum(img_array[:, :, 3] == 0)
                transparency_ratio = transparent_pixels / total_pixels
                
                files.append((filepath, transparency_ratio))
            except OSError:
                continue
    
    if not files:
        print("No symbol files found to clean.")
        return
        
    # Sort files by transparency ratio, most transparent first
    files.sort(key=lambda x: x[1], reverse=True)
    
    # Identify the most transparent file
    target_file_path, ratio = files[0]
    
    print(f"Identified most transparent file: {os.path.basename(target_file_path)} (Transparency: {ratio:.2%})")
    
    try:
        os.remove(target_file_path)
        print(f"Successfully deleted {os.path.basename(target_file_path)}.")
    except OSError as e:
        print(f"Error deleting file: {e}")

if __name__ == "__main__":
    SYMBOLS_DIR = "repo/assets/images/symbols"
    clean_most_transparent_file(SYMBOLS_DIR)
