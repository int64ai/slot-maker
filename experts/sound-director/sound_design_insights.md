# Slot Sound Design Insights

This document summarizes key insights and knowledge gathered for the role of the Sound Director. It serves as a foundational knowledge base for creating compelling soundscapes for slot games.

## 1. The Psychology of Slot Sounds

The primary function of slot sounds is not just auditory feedback, but psychological engagement. Each sound is a tool to shape the player's emotional journey.

*   **Anticipation:** The reel spin sound is crucial for building excitement for the potential outcome. A well-designed spin sound can make the gameplay feel faster and more engaging.
*   **Tension:** The staggered sound of each reel stopping creates a dramatic pause, heightening suspense just before the result is revealed.
*   **Reward & Reinforcement:** Win sounds provide immediate positive reinforcement. The grandeur of the sound should directly correlate with the size of the win, creating a clear hierarchy of rewards. The sound of cascading coins is a classic, powerful auditory symbol of winning.
*   **Minimizing Negativity:** The absence of a sound, or a very subtle, non-intrusive sound on a loss, is a deliberate choice to avoid negative feelings and encourage the player to continue.

## 2. Key Sound Categories & Characteristics

Based on analysis, slot sounds can be categorized as follows:

| Category      | Sound Name          | Core Characteristics                                                                                             | Style Direction                               |
|---------------|---------------------|------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| **Initiation**| `sfx_reel_spin`     | Loopable, rhythmic, builds excitement.                                                                           | Magical, sparkling, positive, not overly mechanical. |
| **Climax**    | `sfx_reel_stop`     | Short, distinct, percussive. Creates a sequence of tension.                                                      | Soft but clear 'pop' or 'boop' sounds.        |
| **Outcome**   | `sfx_win_small`     | Very short (<1s), satisfying, clear.                                                                             | Ascending notes, simple chime, xylophone melody. |
|               | `sfx_win_medium`    | More elaborate than a small win (<2s), celebratory.                                                              | Short fanfare, cascading coins.               |
|               | `sfx_win_jackpot`   | The apex of the soundscape (<5s). Loud, spectacular, multi-layered.                                              | Grand orchestral hits, continuous bells, magic. |
| **Interface** | `sfx_button_click`  | Crisp, clean, provides instant feedback.                                                                         | Digital, non-intrusive click.                 |
| **Events**    | `sfx_bonus_trigger` | Attention-grabbing, signals a shift in gameplay.                                                                 | Upbeat melody, distinct from win sounds.      |

## 3. Learnings from Feedback

*   **Initial Failure:** Early sound generations were "too long and too mechanical."
*   **Correction:** The core style direction was shifted from "classic mechanical" to **"bright, vibrant, and festive (carnival-like)"**. This is a crucial guideline for all future sound generation.
*   **Duration is Key:** Sounds that are too long, even by a few seconds, can make the game feel sluggish and "정신없다 (chaotic/distracting)". Brevity is essential for a tight, satisfying game feel.
*   **Prompting Limitations:** Text-based prompts for sound generation may not perfectly control all parameters like duration. The description of the *style* and *instrumentation* is more reliable.

This document should be updated as more knowledge and feedback are gathered.
