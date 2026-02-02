# Tech Context

## Technologies Used
-   **Frontend:** HTML5, CSS3 (SASS), Vanilla JavaScript (ES6+).
-   **Backend:** Node.js, Express.
-   **Database:** SQLite, Sequelize ORM.
-   **Authentication:** JSON Web Tokens (JWT), bcrypt.
-   **Libraries:** `marked.js` (Markdown parsing), `turndown.js` (HTML to Markdown conversion).
-   **Icons:** FontAwesome (via CDN).
-   **Fonts:** Inter (via Google Fonts).

## Development Setup
-   **Node.js / npm:** Backend runtime and package management.
-   **VS Code:** Primary editor.
-   **Postman/Insomnia:** API testing (recommended).

## Technical Constraints
-   **Browser Compatibility:** Requires a modern browser supporting CSS Variables, Grid, and `backdrop-filter`.
-   **Performance:** All assets are loaded upfront. As the project grows, splitting code or assets might be necessary.
-   **State Persistence:** Theme state and CMS content are persisted via the SQLite database.

## Tool Usage Patterns
-   **Styling:** SASS-based organization (`styles/` directory) compiled to `style.css`.
-   **Backend:** RESTful API with structured routes and Sequelize models.
-   **Editor:** Custom multi-tab synchronization logic for content editing.
