
import os
from repo.scripts.split_atlas import split_image_from_url

# The URL from the last generate_images call
IMAGE_URL = "https://storage.googleapis.com/agent-tools-prod.appspot.com/images/tmp-2068-0514043a-7348-4e1a-925a-212222222222.png"
ROWS = 4
COLS = 2

# Define the output directory relative to this script's location
# This assumes run_split.py is in the root of the project
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'repo', 'assets', 'images', 'symbols')


if __name__ == "__main__":
    print(f"Processing image from URL: {IMAGE_URL}")
    split_image_from_url(IMAGE_URL, OUTPUT_DIR, ROWS, COLS)
    print("Processing complete.")
