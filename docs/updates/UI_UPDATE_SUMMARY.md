# UI Design Update - Flipkart Style

## Changes Implemented

### 1. 🎨 New Navbar Design
- **Style:** Clean white background (`#ffffff`) with shadow.
- **Logo:** Updated "SJG" logo text with "Explore Plus" subtext in blue/yellow/gray scheme.
- **Search Bar:** Large, centered, pill-shaped input with light blue tint (`#f0f5ff`) and search icon.
- **Actions:**
  - **Login:** White button with blue text for guests, Dropdown menu for users.
  - **Cart:** Icon with "Cart" text and red badge.
  - **Become a Seller:** Added as a nav link.
  - **More:** Added 3-dot menu icon.

### 2. 🛍️ New Category Bar
- **Location:** Directly below the Navbar.
- **Content:** Horizontal scrollable list of categories (Notebooks, Pens, Art, etc.).
- **Design:** Circular/Square product images with text labels below, mimicking the provided reference image.
- **Interaction:** Hover effects for text color.

### 3. 🖼️ Home Page Redesign
- **Background:** Changed to standard e-commerce light gray (`#f1f3f6`).
- **Hero Section:** Replaced the old gradient text-hero with a **Full-Width Banner**.
  - Currently displays a "Stationery Essentials" banner.
  - styled to look like a carousel slide.
- **Layout:** Adjusted padding to account for the new fixed navbar height (64px).

### 4. 🔤 Global Typography
- **Font:** Switched from 'Montserrat' to **'Roboto'** (300/400/500/700 weights) to match the crisp, modern look of major e-commerce platforms.

## Files Created/Modified
- `src/components/Navbar.js` & `.css` (Major Overhaul)
- `src/components/CategoryBar.js` & `.css` (New Component)
- `src/pages/Home.js` & `.css` (Layout & Hero Update)
- `src/App.css` (Global Font & Background)

## How to Test
1. Visit the home page.
2. Observe the new white navbar with the large search bar.
3. Check the category icons row below the navbar.
4. See the new blue banner in the hero position.
5. Verify "Login" button opens the existing Auth modal.
