# System Patterns

## Architecture
The application currently follows a simple **Vanilla JS Single Page Application (SPA)** architecture.

-   **Structure:**
    -   `index.html`: Contains the markup for all views (Home, Emulators, Games, etc.).
    -   `style.css`: Contains all styles, animations, and theme definitions.
    -   `script.js`: Handles logic, event listeners, and data rendering.

## Key Technical Decisions
-   **CSS Variables (Custom Properties):** Used for theming to allow easy switching between Dark and Light modes without duplicate CSS rules.
-   **Class-based State:** UI state (active view, active modal, etc.) is managed by toggling CSS classes (e.g., `.active`).
-   **Client-Side Rendering:** Lists (like Emulators) are generated on the client side from JavaScript arrays.

## Design Patterns
-   **View Switching:**
    -   All views exist in the DOM but are hidden (`display: none`) by default.
    -   The `showView(id)` function handles the logic: remove `.active` from all views, add `.active` to the target view.
    -   Navigation state is updated (highlighting the correct chip).
-   **Modal Pattern:**
    -   The Search modal covers the screen (`inset: 0`, `fixed`).
    -   It listens for clicks outside the content box to close itself.
    -   Keyboard shortcuts (`Cmd+K`, `Escape`) control visibility.
-   **Theme Engine:**
    -   Root variables define colors for `dark` theme by default.
    -   `[data-theme="light"]` selector overrides these variables.
    -   JS toggles the attribute on `document.documentElement`.

## Component Relationships
-   **Navigation & Views:** The navbar buttons correspond 1:1 with `<main>` view containers.
-   **Data & UI:** The `emus` array in `script.js` directly feeds the `emuGrid` element in `index.html`.
