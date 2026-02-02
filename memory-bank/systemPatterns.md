# System Patterns

## Architecture
The application follows a **Full-Stack JavaScript** architecture.

-   **Frontend:** Vanilla JS Single Page Application (SPA) with Glassmorphism UI.
-   **Backend:** Node.js/Express RESTful API.
-   **Database:** SQLite managed via Sequelize ORM.
-   **Structure:**
    -   `index.html` / `admin.html`: Client-facing and administrative interfaces.
    -   `server.js`: Entry point for the Express backend.
    -   `models/`: Sequelize database models (User, Post, Page, Media).
    -   `routes/`: API endpoint definitions.
    -   `middleware/`: Authentication and security logic.

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
    -   **New:** Theme state is persisted to the backend user profile.
-   **API Integration:**
    -   RESTful endpoints provide JSON data for dynamic rendering.
    -   JWT tokens used for securing administrative routes.
-   **Sync Editor:**
    -   Bidirectional synchronization between Visual (ContentEditable), Markdown (Textarea), and Code (Textarea) views.

## Component Relationships
-   **Navigation & Views:** The navbar buttons correspond 1:1 with `<main>` view containers.
-   **Data & UI:** The `emus` array in `script.js` directly feeds the `emuGrid` element in `index.html`.
