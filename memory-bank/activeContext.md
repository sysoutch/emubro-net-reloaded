# Active Context

## Current Work Focus
The project is currently in a prototype/frontend implementation phase. The basic structure (HTML/CSS/JS) is in place, demonstrating the visual style and navigation logic.

## Recent Changes
-   Initial setup of `index.html`, `style.css`, and `script.js`.
-   Implementation of the "Glassmorphism" UI theme.
-   Basic SPA navigation logic (showing/hiding sections).
-   Dynamic emulator list rendering via JavaScript.
-   Search modal functionality.
-   **v2.0 Beta Update:** Ticker announcement of Cloud Saves and 1-Click BIOS Installer (UI placeholders/announcements).
-   **Advanced Blog Editor:** Implemented a multi-tab (Visual, Markdown, Code) blog post editor in the admin panel with real-time bidirectional sync using `marked.js` and `turndown.js`.

## Next Steps
-   Refine the "Games" view (currently just a placeholder with a carousel).
-   Expand the "Emulators" data and display.
-   Implement actual functionality for the "Download" and "Tools" sections (currently placeholders).
-   Improve responsiveness and mobile layout.
-   Consider moving to a framework if complexity grows (currently vanilla JS).
-   Implement backend image handling for blog posts (currently using URL prompts for visual editor).

## Active Decisions
-   **Vanilla Stack:** Currently using plain HTML/CSS/JS to keep dependencies low and performance high for the prototype.
-   **CSS Variables:** Extensive use of CSS variables for theming (Dark/Light mode).
-   **Single Page Approach:** All content is in `index.html` and hidden/shown via JS to simulate an app experience.

## Important Patterns
-   **View Management:** `showView(id)` function toggles visibility of `<main>` elements with the class `view`.
-   **Dynamic Content:** Data is stored in JS arrays (e.g., `emus`) and rendered via `.map()` and `innerHTML`.
-   **Theme Engine:** Uses `data-theme` attribute on `<html>` and CSS variables.
