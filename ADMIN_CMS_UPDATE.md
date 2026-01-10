# Admin Panel Redesign & Home Page CMS

I have redesigned the Admin Panel layout and implemented a "Content Management System" (CMS) for the Home Page.

## Features Added

### 1. New Admin Sidebar
*   **Vertical Layout**: Navigation is now on the left side.
*   **Collapsible**: Click the arrow button (top right of sidebar) to collapse/expand.
*   **Hover Effects**: When collapsed, tooltips appear on hover.
*   **Responsive Content**: The main page content adjusts its margin automatically.

### 2. Home Page CMS (Edit Home Page)
You can now edit the Home Page content directly from the Admin Panel without touching code!

*   **Location**: Go to Admin Panel -> CMS -> **Edit Home Page**.
*   **Editable Sections**:
    *   **Hero Banners**: Add new slides, change images, titles, subtitles, and prices.
    *   **Services**: Edit the 4 service cards (Icons, Titles, Descriptions, Colors).
*   **How it works**:
    1.  The Admin Panel fetches the current content from MongoDB.
    2.  You make changes in the form.
    3.  Click **Save Changes**.
    4.  The value is saved to MongoDB (`site_content` collection).
    5.  The public Home Page (`/`) automatically fetches and displays this new content.

### 3. Backend Changes
*   **New Endpoint**: `/api/content/home/` (GET/POST).
*   **Storage**: Data is stored in the `site_content` collection in MongoDB.

## Instructions
1.  Log in as Admin.
2.  Check out the new Sidebar layout.
3.  Click "Edit Home Page".
4.  Try changing a Banner Title or Price.
5.  Click Save.
6.  Go to the Home Page (`/`) and refresh to see your changes!
