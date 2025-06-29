
from PIL import Image
import os

def crop_image(input_path, output_path, crop_width, crop_height):
    """
    Crops the center of an image to the specified dimensions.
    """
    try:
        img = Image.open(input_path)
        img_width, img_height = img.size

        left = (img_width - crop_width) / 2
        top = (img_height - crop_height) / 2
        right = (img_width + crop_width) / 2
        bottom = (img_height + crop_height) / 2

        cropped_img = img.crop((left, top, right, bottom))
        cropped_img.save(output_path, "PNG")
        print(f"Successfully cropped image and saved to {output_path}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Use relative paths from the project root, where the script is run from
    input_image_path = os.path.join("images", "a-sleek-curved-slot-machine-re-2025-06-29T14-01-48-143Z-1.png")
    output_image_path = os.path.join("repo", "slot-game", "public", "images", "reel_background.png")
    
    CROP_WIDTH = 621
    CROP_HEIGHT = 264

    os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
    crop_image(input_image_path, output_image_path, CROP_WIDTH, CROP_HEIGHT)
