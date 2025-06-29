
import os
from PIL import Image

def process_symbol_from_path(input_path, output_path):
    """
    Loads an image from a local path, makes its background transparent,
    and saves it to the specified output path.
    """
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        img = Image.open(input_path).convert("RGBA")
    except FileNotFoundError:
        print(f"Error: Image not found at '{input_path}'")
        return

    background_color = img.getpixel((0, 0))

    data = img.getdata()
    newData = []
    for item in data:
        if all(abs(item[k] - background_color[k]) < 30 for k in range(3)):
            newData.append((255, 255, 255, 0))  # Transparent
        else:
            newData.append(item)
    img.putdata(newData)

    img.save(output_path, "PNG")
    print(f"Successfully processed and saved symbol to {output_path}")

if __name__ == "__main__":
    input_dir = "repo/assets/images/symbols/"
    output_dir = "repo/slot-game/public/images/symbols/"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        if filename.endswith(".png") and "dummy" not in filename.lower() and "symbol_09" not in filename:
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            process_symbol_from_path(input_path, output_path)
