
import os

def clean_smallest_file(directory):
    """
    Finds all symbol files in a directory, and deletes the one with the smallest file size.
    """
    print(f"--- Cleaning smallest file in {directory} ---")
    
    files = []
    for filename in os.listdir(directory):
        if filename.startswith("symbol_") and filename.endswith(".png"):
            filepath = os.path.join(directory, filename)
            try:
                files.append((filepath, os.path.getsize(filepath)))
            except OSError:
                continue
    
    if not files:
        print("No symbol files found to clean.")
        return
        
    # Sort files by size, smallest first
    files.sort(key=lambda x: x[1])
    
    # Identify the smallest file
    smallest_file_path, smallest_size = files[0]
    
    print(f"Identified smallest file: {os.path.basename(smallest_file_path)} (Size: {smallest_size} bytes)")
    
    try:
        os.remove(smallest_file_path)
        print(f"Successfully deleted {os.path.basename(smallest_file_path)}.")
    except OSError as e:
        print(f"Error deleting file: {e}")

if __name__ == "__main__":
    SYMBOLS_DIR = "repo/assets/images/symbols"
    clean_smallest_file(SYMBOLS_DIR)
