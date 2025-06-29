
from PIL import Image
import os

def process_image(input_path, output_path):
    """
    Processes an image to make specified rectangular areas transparent.
    """
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGBA to ensure it has an alpha channel for transparency
        img = img.convert("RGBA")
        
        # Get pixel data
        pixels = img.load()

        # Define the reel areas to be cleared (x, y, width, height)
        # Based on user's input and calculated spacing
        reels = [
            (189, 315, 117, 264),  # Reel 1
            (315, 315, 117, 264),  # Reel 2
            (441, 315, 117, 264),  # Reel 3
            (567, 315, 117, 264),  # Reel 4
            (693, 315, 117, 264)   # Reel 5
        ]

        # Set the pixels in the defined areas to be fully transparent
        for reel_x, reel_y, reel_w, reel_h in reels:
            for y in range(reel_y, reel_y + reel_h):
                for x in range(reel_x, reel_x + reel_w):
                    if 0 <= x < img.width and 0 <= y < img.height:
                        pixels[x, y] = (0, 0, 0, 0) # Set transparent

        # Save the processed image
        img.save(output_path, "PNG")
        print(f"Successfully processed image and saved to {output_path}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Define project structure paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_image_path = os.path.join(base_dir, "slot-game", "public", "images", "slot_frame.png")
    output_image_path = os.path.join(base_dir, "slot-game", "public", "images", "slot_frame_processed.png")
    
    # Create public/images directory if it doesn't exist
    os.makedirs(os.path.dirname(output_image_path), exist_ok=True)

    process_image(input_image_path, output_image_path)
