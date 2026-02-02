# Tech Context

## Technologies Used
-   **HTML5:** Semantic markup structure.
-   **CSS3:** Styling, Flexbox, Grid, CSS Variables, Keyframe Animations, Backdrop Filter (Glassmorphism).
-   **JavaScript (ES6+):** DOM manipulation, event handling, template literals.
-   **Google Fonts:** "Inter" font family.

## Development Setup
-   **No Build Step:** Currently, the project requires no build tools (Webpack, Vite, etc.). It can be served directly by any static file server.
-   **Files:**
    -   `index.html`
    -   `style.css`
    -   `script.js`

## Technical Constraints
-   **Browser Compatibility:** Requires a modern browser supporting CSS Variables, Grid, and `backdrop-filter`.
-   **Performance:** All assets are loaded upfront. As the project grows, splitting code or assets might be necessary.
-   **State Persistence:** Currently no persistence (theme resets on reload, no user data saved).

## Tool Usage Patterns
-   **Styling:** Pure CSS with specific organization (Variables -> Reset -> Layout -> Components -> Responsive).
-   **Logic:** Functional JS, keeping global scope pollution minimal (though variables are currently global for simplicity in prototype).
