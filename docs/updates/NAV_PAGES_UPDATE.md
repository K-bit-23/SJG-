# Navigation & Pages Update

## Changes Implemented

### 1. 🧭 Navbar Enhancements
- **Home Link:** Added a distinct "Home" link immediately following the "SJG" logo for clearer navigation structure.
- **Track Order:** Added a direct link to the new Order Tracking page in the navbar actions.
- **Cart Interaction:** Changed the Cart from a hover-dropdown to a direct link. Clicking "Cart" now takes you to a dedicated full-page cart view.

### 2. 🆕 New Pages
- **Cart Page (`/cart`):**
  - Displays all items with images, prices, and quantities.
  - Controls to increment/decrement/remove items.
  - Price Summary sidebar (Total, Discount, Delivery).
  - "Place Order" button directing to Checkout.
- **Track Order Page (`/track-order`):**
  - Simple input form to enter an Order ID.
  - Visual timeline display (Placed -> Packed -> Shipped -> Delivered) to simulate tracking status.

### 3. 🛣️ Routing
- Updated `App.js` to include routes for `/cart` and `/track-order`.

## Files Modified
- `src/components/Navbar.js` & `.css`
- `src/App.js`
- Created: `src/pages/Cart.js` & `.css`
- Created: `src/pages/TrackOrder.js` & `.css`

## How to Test
1. Click **Home** in the navbar -> Should go to homepage.
2. Click **Track Order** -> Enter any ID (e.g. `123`) -> See status.
3. Add items to cart -> Click **Cart** in navbar -> See standard Cart page.
