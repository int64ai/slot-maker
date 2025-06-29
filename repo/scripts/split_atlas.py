
import os
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, center_of_mass

def process_tile_with_com_centering(tile_img, color_threshold=250):
    """
    Finds the symbol in a tile, and re-centers it based on its center of mass.
    """
    tile_array = np.array(tile_img.convert("RGBA"))
    
    # --- 1. Tolerant Background Removal ---
    rgb = tile_array[:,:,:3]
    is_background = np.all(rgb >= color_threshold, axis=-1)
    tile_array[is_background, 3] = 0

    # --- 2. Find Symbol's Bounding Box and Center of Mass ---
    alpha_channel = tile_array[:, :, 3]
    binary_mask = alpha_channel > 128
    
    if np.sum(binary_mask) == 0: # Tile is empty
        return None

    labeled_array, num_features = label(binary_mask)
    if num_features == 0: return None
        
    objects = find_objects(labeled_array)
    largest_object_slice = max(objects, key=lambda s: (s[0].stop - s[0].start) * (s[1].stop - s[1].start))
    
    # Crop to the symbol's bounding box to calculate its local CoM
    cropped_mask = binary_mask[largest_object_slice]
    com_y_local, com_x_local = center_of_mass(cropped_mask)

    # --- 3. Re-center the Symbol ---
    # Get the original symbol based on the bounding box
    symbol_crop = tile_array[largest_object_slice]
    h, w, _ = symbol_crop.shape

    # Create a new transparent canvas the same size as the original tile
    new_canvas = np.zeros_like(tile_array)
    
    # Calculate where to paste the symbol so its CoM is at the tile's center
    tile_center_x, tile_center_y = tile_array.shape[1] // 2, tile_array.shape[0] // 2
    paste_x = tile_center_x - int(com_x_local)
    paste_y = tile_center_y - int(com_y_local)

    # Paste the symbol
    # Ensure paste coordinates are within bounds
    paste_y_end = min(paste_y + h, new_canvas.shape[0])
    paste_x_end = min(paste_x + w, new_canvas.shape[1])
    crop_h = paste_y_end - paste_y
    crop_w = paste_x_end - paste_x

    new_canvas[paste_y:paste_y_end, paste_x:paste_x_end] = symbol_crop[:crop_h, :crop_w]
    
    return Image.fromarray(new_canvas)


def final_split(input_path, output_dir, rows, cols):
    if not os.path.exists(output_dir): os.makedirs(output_dir)

    try:
        img = Image.open(input_path)
    except FileNotFoundError:
        print(f"Error: Image not found at '{input_path}'")
        return

    width, height = img.size
    tile_width = width // cols
    tile_height = height // rows
    symbol_index = 0

    for i in range(rows):
        for j in range(cols):
            symbol_index += 1
            tile_img = img.crop((j * tile_width, i * tile_height, (j + 1) * tile_width, (i + 1) * tile_height))
            
            centered_img = process_tile_with_com_centering(tile_img)
            
            if centered_img:
                output_path = os.path.join(output_dir, f"symbol_{symbol_index:02d}.png")
                centered_img.save(output_path, "PNG")
                print(f"Saved re-centered symbol to {output_path}")

if __name__ == "__main__":
    INPUT_PATH = "repo/assets/images/atlas_raw.png"
    OUTPUT_DIR = "repo/assets/images/symbols"
    ROWS = 3
    COLS = 3
    
    if os.path.exists(OUTPUT_DIR):
        for f in os.listdir(OUTPUT_DIR):
            if f.startswith("symbol_"):
                os.remove(os.path.join(OUTPUT_DIR, f))

    final_split(INPUT_PATH, OUTPUT_DIR, ROWS, COLS)
    print("Final atlas processing complete.")
