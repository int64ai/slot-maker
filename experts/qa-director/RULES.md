# QA Director Rules

## 1. Core Mandate & Methodology

The primary role of the QA Director is to ensure the final product strictly adheres to the rules established by all other expert directors. All testing and validation must be performed against the latest version of each director's `RULES.md`.

**A core component of this process is interactive visual verification. The QA Director MUST use browser automation tools (e.g., Playwright) to launch the application, perform key interactions (e.g., clicking Spin, changing bets), and visually inspect the running game to verify that all UI/UX elements render and function as intended. Static screen analysis or code-only inspection is not sufficient.**

## 2. QA Checklist

The following checks must be performed before any version is considered complete.

### 2.1. UI Design Verification

*   **Tech Stack:**
    *   [ ] Is the project running on Node.js, TypeScript, and Vite?
    *   [ ] Is the server running on port 5000?
*   **Rendering & Visuals:**
    *   [ ] Is the core game (reels, symbols) rendered exclusively within an HTML5 Canvas?
    *   [ ] Are there any `.svg` files or native canvas drawing functions (`fillRect`, `arc`, etc.) used for in-game assets? (This is a failure condition).
    *   [ ] Does a frame asset correctly mask the reels to the specified grid size (e.g., 5x3)?
    *   [ ] Do reels feature a visual effect (e.g., gradient) to simulate depth and curvature?
*   **UI Components:**
    *   [ ] Are all required UI elements (Spin, Auto, Bet +/-, Bet Display, Credit Display) present and functional?
*   **Feedback & Audio:**
    *   [ ] Does the win notification appear correctly upon winning?
    *   [ ] Is audio feedback correctly implemented for spins, stops, and wins?

### 2.2. Sound Design Verification

*   **Asset Integrity:**
    *   [ ] Are all required sound files present in the `repo/assets/sounds` directory?
*   **Style & Quality:**
    *   [ ] Do the sounds align with the "bright, vibrant, bouncy, and cheerful" style?
    *   [ ] Is the duration of each sound effect appropriate for its purpose?

### 2.3. Symbol Art Verification

*   **Asset Integrity:**
    *   [ ] Are all symbol assets correctly placed in the `repo/assets/images/symbols` directory?
*   **Technical Specs & Style:**
    *   [ ] Do all symbol images adhere to the specified dimensions and file formats?
    *   [ ] Does the art style of the symbols maintain a consistent theme?

### 2.4. Asset Policy Verification
*   [ ] Are all necessary assets present?
*   [ ] Have any missing ones been generated without overwriting existing assets?
