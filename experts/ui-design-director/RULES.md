# UI Design Director Rules

## 1. Core Principles & Tech Stack

*   **Framework:** The project will be a web-based slot game.
*   **Environment:** The development environment will be Node.js with TypeScript and Vite.
*   **Port:** The application will run on a fixed port: 5000.
*   **Rendering:** The in-game slot machine, including reels and symbols, will be rendered exclusively within an HTML5 Canvas.
*   **Asset Usage:**
    *   All visual elements inside the canvas must be rendered from bitmap image assets (e.g., PNG, JPG).
    *   The use of vector files (.svg) for in-game elements is strictly prohibited.
    *   The use of native Canvas drawing functions for creating shapes (e.g., `fillRect`, `arc`, `lineTo`) is strictly prohibited. All visuals must originate from image assets.

## 2. UI Components (Out-game)

The following UI components are required and will be implemented as standard HTML/CSS elements outside the main game canvas.

*   **Spin Button:** The primary button to start a game round.
*   **Auto-Spin Button:** A button to toggle automatic spinning.
*   **Bet Control Buttons:**
    *   A `+` button to increase the bet amount.
    *   A `-` button to decrease the bet amount.
*   **Bet Display:** A non-interactive area to display the current bet amount.
*   **Credit Display:** A non-interactive area to display the player's total credits.

## 3. In-Game Feedback & Visuals

*   **Win Notification:** Upon a win, the total amount won for that spin must be displayed prominently at the bottom center of the screen.
*   **Canvas Visual Enhancement:**
    *   **Reel Masking:** A visual frame must be drawn over the canvas to mask the reels, ensuring only the active grid (e.g., 5x3) of symbols is visible to the player.
    *   **Reel Depth Effect:** Each reel must have a subtle overlay (e.g., a semi-transparent gradient) to create a sense of curvature and depth, enhancing the spinning illusion.
    *   **Asset Design Principle:** To ensure proper masking and layering, the main slot machine visual is composed of two separate parts:
        1.  `slot_background.png`: A background image.
        2.  `slot_frame_foreground.png`: A foreground frame with a transparent area for the reels.
*   **Frame Scaling (Cover Mode):** The frame and background assets must be rendered to cover the entire canvas area, avoiding unnatural letterboxing or pillarboxing. The image should be scaled to fill the canvas while maintaining its aspect ratio.
*   **Audio Integration:**
    *   Key user actions and game events must have corresponding audio feedback.
    *   Required sounds include: button clicks, reel spin start, individual reel stops, and win notifications.

## 4. Asset Policy
*   If a required visual or audio asset is missing, a new one should be generated.
*   Existing assets must not be replaced without explicit approval.
