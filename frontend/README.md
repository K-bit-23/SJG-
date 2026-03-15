# SJG Frontend

A modern React application with separate admin and client interfaces for the SJG e-commerce platform.

## Project Structure

```
frontend/
├── src/                          # Shared components and utilities
│   ├── components/              # Shared UI components
│   │   ├── Navbar.js           # Main navigation
│   │   ├── Footer.js           # Site footer
│   │   ├── AuthModal.js        # Authentication modal
│   │   └── ...
│   ├── context/                # React Context providers
│   │   ├── AuthContext.js      # Authentication state
│   │   ├── CartContext.js      # Shopping cart state
│   │   └── LanguageContext.js  # Language/i18n state
│   ├── App.js                  # Main app component
│   ├── index.js                # App entry point
│   └── firebaseConfig.js       # Firebase configuration
├── client/                      # Client-side application
│   ├── pages/                  # Client page components
│   │   ├── Home.js            # Landing page
│   │   ├── Products.js        # Product catalog
│   │   ├── Cart.js            # Shopping cart
│   │   ├── Checkout.js        # Checkout process
│   │   ├── Profile.js         # User profile
│   │   ├── Orders.js          # Order history
│   │   ├── Settings.js        # User settings
│   │   ├── Wishlist.js        # Wishlist
│   │   ├── Contact.js         # Contact page
│   │   └── PaymentSuccess.js  # Payment confirmation
│   └── components/            # Client-specific components
├── admin/                       # Admin panel application
│   ├── pages/                  # Admin page components
│   │   ├── AdminPanel.js      # Main admin router
│   │   └── AdminDashboard.js  # Admin dashboard
│   └── components/            # Admin-specific components
│       └── AdminLayout.js     # Admin layout wrapper
├── public/                      # Static assets
├── package.json                # Dependencies
└── vite.config.js             # Vite configuration
```

## Features

### Client Features
- **Product Catalog**: Browse and search products
- **Shopping Cart**: Add, remove, and manage cart items
- **User Authentication**: Login/register with Clerk
- **User Profile**: Manage account settings
- **Order Management**: View order history
- **Wishlist**: Save favorite products
- **Checkout Process**: Complete purchase flow
- **Multi-language**: English and Hindi support

### Admin Features
- **Dashboard**: Overview of sales, orders, and users
- **Product Management**: Add, edit, and manage products
- **Order Management**: View and process orders
- **User Management**: Manage user accounts
- **Analytics**: Sales and performance metrics
- **Content Management**: Edit homepage content

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with:
   ```
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
   REACT_APP_FIREBASE_API_KEY=your_firebase_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Routing Structure

### Client Routes
- `/` - Home page
- `/products` - Product catalog
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/profile` - User profile
- `/orders` - Order history
- `/settings` - Account settings
- `/wishlist` - Wishlist
- `/contact` - Contact page
- `/payment-success` - Payment confirmation

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/analytics` - Analytics dashboard
- `/admin/settings` - Admin settings

## Component Architecture

### Shared Components (`src/components/`)
Reusable UI components used across both client and admin interfaces.

### Client Components (`client/components/`)
Components specific to the client-facing application.

### Admin Components (`admin/components/`)
Components specific to the admin panel.

## State Management

- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state
- **LanguageContext**: Language selection state

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Consistent design system

## Development Guidelines

### Adding New Features

1. **Client Features**: Add to `client/pages/` or `client/components/`
2. **Admin Features**: Add to `admin/pages/` or `admin/components/`
3. **Shared Features**: Add to `src/components/` or create new context

### File Naming Convention
- Components: `PascalCase.js`
- Utilities: `camelCase.js`
- Pages: `PascalCase.js`

### Code Organization
- Keep components small and focused
- Use custom hooks for complex logic
- Maintain consistent styling with Tailwind classes

## Deployment

The application is configured for deployment to Firebase Hosting with proper routing and build optimization.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
