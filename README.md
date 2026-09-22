# React Frontend Application

A modern React application built with Webpack 5, Redux Toolkit, Material UI, and Tailwind CSS.

## Prerequisites

- Node.js >= 16.x
- npm >= 8.x or yarn >= 1.22

## Installation

Clone the repository and install dependencies:

```bash
npm install
# or
yarn install
```

## Environment Variables

Create environment files in the `env/` directory:

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.beta` - Beta environment

Available environment variables:

| Variable | Description |
|----------|-------------|
| `REACT_APP_BASE_URL` | Base API URL |
| `WEB_SOCKET_URL` | WebSocket URL |
| `MUI_PRO_KEY` | Material UI Pro License Key |

## Development

Start development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Deploy to Replit

This repository includes a `.replit` workflow that builds the production bundle
and serves it through `server.js`. Replit provides the listening port through the
`PORT` environment variable, which the server uses automatically.

Before running the app, add this Replit Secret:

```env
REACT_APP_BASE_URL=https://your-backend-domain.example/api/v1
```

The value must be the public URL of the Go API. Do not use `localhost` for a
deployed frontend. The backend must also allow the deployed Replit origin in its
CORS configuration.

Replit will run:

```bash
npm run build:prod && npm run serve
```

For a local production check:

```bash
npm run build:prod
PORT=5000 npm run serve
```

## Build

### Development Build

```bash
npm run build:dev
```

Creates an unminified build in the `dist/` directory.

### Production Build

```bash
npm run build:prod
```

Creates an optimized, minified build in the `dist/` directory.

## Folder Structure

```
project-root/
├── config/                    # Webpack configuration files
│   ├── webpack.development.config.js
│   ├── webpack.production.config.js
│   ├── webpack.loaders.js
│   └── webpack.plugins.js
├── env/                       # Environment files
│   ├── .env.development
│   ├── .env.production
│   └── .env.beta
├── public/                    # Static assets
│   ├── assets/
│   ├── fonts/
│   └── images/
├── src/
│   ├── constant/              # Application constants
│   └── web/
│       ├── index.html         # HTML template
│       ├── commonFunctions/   # Utility functions
│       ├── commonTimeConverter/  # Time conversion utilities
│       ├── commonchartcolor/ # Chart color constants
│       ├── javascripts/
│       │   ├── index/         # Application entry point
│       │   ├── apiCalls/      # API configuration and methods
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── redux/         # Redux store configuration
│       │   └── styles/        # Global styles
│       ├── styles/            # Additional styles
│       └── stylesheets/       # Additional stylesheets
├── babel.config.js            # Babel configuration
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── package.json
└── README.md
```

## Linting

Run ESLint:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

Run Stylelint:

```bash
npm run stylelint
```

## How to Add a New Page

### 1. Create the page component

```jsx
// src/web/javascripts/pages/app/newPage/index.js
import React from 'react';
import { Box } from '@mui/material';

const NewPage = () => {
  return (
    <Box className="new-page">
      <h1>New Page</h1>
    </Box>
  );
};

export default NewPage;
```

### 2. Add route to App.jsx

``` jsx
// Import with lazy loading
const NewPage = lazy(() => import('./pages/app/newPage'));

// Add route in the Routes component
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### 3. Use the page wrapper for authenticated pages

## How to Add a New API Module

### 1. Create API file

```js
// src/web/javascripts/apiCalls/newModuleApi.js
import apiClient from './apiClient';
import API_URLS from './api-urls';

export const newModuleApi = {
  getItem: async (id) => {
    const response = await apiClient.get(`${API_URLS.NEW_MODULE}/${id}`);
    return response.data;
  },
  
  createItem: async (data) => {
    const response = await apiClient.post(API_URLS.NEW_MODULE, data);
    return response.data;
  },
};

export default newModuleApi;
```

### 2. Add endpoint URLs

``` js
// src/web/javascripts/apiCalls/api-urls.js
export const API_URLS = {
  // ... existing URLs
  NEW_MODULE: '/new-module',
};
```

### 3. Export from index

```js
// src/web/javascripts/apiCalls/index.js
export { default as newModuleApi } from './newModuleApi';
```

## How to Add a Redux Action and Reducer

### 1. Define action type

```js
// src/web/javascripts/redux/constants/commonData.js
export const SET_NEW_DATA = 'commonData/SET_NEW_DATA';
```

### 2. Create action

```js
// src/web/javascripts/redux/actions/commonData.js
export const setNewData = (data) => ({
  type: SET_NEW_DATA,
  payload: data,
});
```

### 3. Add to reducer

``` js
// src/web/javascripts/redux/reducers/commonDataReducer.js
// Add to initial state
const initialState = {
  // ... existing state
  newData: null,
};

// Add case in the reducer switch
case SET_NEW_DATA:
  return {
    ...state,
    newData: action.payload,
  };
```

## Tech Stack

- **React 18** - UI library
- **React Router DOM v6** - Routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Material UI v5** - UI components
- **Bootstrap 5** - CSS framework
- **Tailwind CSS v3** - Utility-first CSS
- **Webpack 5** - Module bundler
- **Babel** - JavaScript compiler
- **ESLint** - JavaScript linter
- **Stylelint** - CSS/SCSS linter
- **PostCSS** - CSS transformations
- **Sass** - CSS preprocessor

## License

MIT
