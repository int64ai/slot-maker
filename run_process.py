
import os
from repo.scripts.process_symbol import process_symbol_from_url

# The URL from the last generate_images call
IMAGE_URL = "https://storage.googleapis.com/agent-tools-prod.appspot.com/images/tmp-2068-11111111-1111-1111-1111-111111111111.png"

# Define the output path relative to this script's location
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'repo', 'assets', 'images', 'symbols', 'symbol_7_red.png')

if __name__ == "__main__":
    print(f"Processing image from URL: {IMAGE_URL}")
    process_symbol_from_url(IMAGE_URL, OUTPUT_PATH)
    print(f"Processing complete. Symbol saved to {OUTPUT_PATH}")
