# Symbol Art Rules

1.  **Atlas-First Approach:** To ensure thematic and stylistic consistency, all symbols must first be designed within a single, unified "Symbol Atlas" image.

2.  **Solid White Background:** The atlas background must be solid white (`#FFFFFF`). This provides a clean, predictable base for processing.

3.  **No Grid Borders:** The atlas image itself must not contain any visible grid lines or borders between cells. The grid is a conceptual layout for positioning only.

4.  **Hard-Edge Style (No Anti-Aliasing):** All symbols must be rendered with hard, aliased edges. There should be no semi-transparent or "blurry" pixels at the boundaries. A pixel-art or sharp vector style is preferred. This eliminates ambiguity during background removal.

5.  **Full Grid (No Empty Cells):** The atlas must use a full grid (e.g., 3x3, 4x4). If the number of required symbols does not fill the grid, placeholder "dummy" symbols must be created to fill the remaining cells.

6.  **Simple Grid Splitting:** Processing should rely on simple, mechanical grid splitting. The complexity of "intelligent" object detection is to be avoided, as it is less reliable than a clean source image.

7.  **Language Principle:** All text included in symbols must be in English unless specifically requested otherwise.

8.  **Naming Convention:** Final symbol files should be named clearly and consistently (e.g., `symbol_01.png`).

9.  **Source File Management:** The original Symbol Atlas source file (`atlas_raw.png`) must be versioned and stored.