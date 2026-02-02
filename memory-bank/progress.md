# Progress

## Status: Prototype / Alpha

## What Works
-   **Core UI:** Main layout, navigation sidebar/topbar, footer.
-   **Visual Styling:** Glassmorphism, animated background, responsive grid.
-   **Navigation:** Switching between views works seamlessly.
-   **Theme System:** Toggling between Dark and Light modes.
-   **Emulator List:** Dynamic rendering from a basic JS array.
-   **Search:** Modal opens/closes and filters the emulator list (basic implementation).

## What's Left to Build
-   [ ] **Game Library:** Replace placeholder carousel with a full grid/list of games.
-   [ ] **Game Details:** View for individual game details (metadata, screenshots).
-   [ ] **Real Data Source:** Move hardcoded JS arrays to a JSON file or API.
-   [ ] **Persistence:** Save user preferences (theme) to localStorage.
-   [ ] **Tools Section:** Implement the "1-Click BIOS Installer" concept mentioned in the ticker.
-   [ ] **Download Page:** Create a proper download landing page.
-   [ ] **Mobile Optimization:** Further refine hamburger menu or bottom nav for mobile.

## Known Issues
-   Search only filters the hardcoded `emus` list.
-   Theme resets on page reload.
-   Carousel scrollbar styling could be improved on Windows.
