# Build System

## Overview

Helix uses **Vite 5** to build the React frontend into static assets that WordPress enqueues on admin pages. The build output lands in `/build/` and is loaded by [enqueue.php](../enqueue.php).

## Configuration

**File**: [vite.config.mjs](../vite.config.mjs)

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig( {
    plugins: [ react() ],
    build: {
        outDir: 'build',
        emptyOutDir: true,
        rollupOptions: {
            input: 'src/App.jsx',
            output: {
                entryFileNames: 'index.js',
            },
        },
    },
} );
```

### Key Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `plugins` | `@vitejs/plugin-react` | JSX transform, Fast Refresh |
| `outDir` | `build` | Output directory (WordPress expects this) |
| `emptyOutDir` | `true` | Clean build on each run |
| `input` | `src/App.jsx` | Single entry point for the entire React app |
| `entryFileNames` | `index.js` | Fixed filename (enqueued in [enqueue.php](../enqueue.php)) |

## Package Scripts

From [package.json](../package.json):

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `/build/` |
| `npm run lint:js` | Lint JavaScript with `wp-scripts lint-js` |
| `npm run lint:js:fix` | Lint and auto-fix JavaScript |
| `npm run format` | Format code with `wp-scripts format` (Prettier) |
| `npm run lint` | Run JS linting |
| `npm run prebuild` | Lint + format before build |

## Dependencies

### Runtime (bundled)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.0.0 | UI framework |
| `react-dom` | ^18.0.0 | DOM rendering |
| `react-router-dom` | ^6.0.0 | Client-side routing (installed, not yet used) |
| `@mui/material` | ^7.3.1 | Material UI component library |
| `@mui/icons-material` | ^7.3.1 | Material Design icons |
| `@emotion/react` | ^11.14.0 | CSS-in-JS (MUI dependency) |
| `@emotion/styled` | ^11.14.1 | Styled components (MUI dependency) |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.0.0 | Build tool |
| `@vitejs/plugin-react` | ^4.7.0 | React support for Vite |
| `@wordpress/scripts` | ^30.21.0 | WordPress linting & formatting standards |

## Build Output

The Vite build produces:

```
build/
├── index.js              # Main JS bundle (entry point)
└── assets/
    └── index-*.css       # Extracted CSS (hashed filename)
```

### How Assets Are Loaded

[enqueue.php](../enqueue.php) handles loading:

1. **JavaScript**: Enqueues `build/index.js` with handle `helix-app`
2. **CSS**: Uses `glob()` to find the hashed CSS file in `build/assets/` and enqueues it with handle `helix-app-styles`
3. **Data**: Localizes `helixData` object into the page for the React app to consume

## Dev Workflow

1. Run `npm run dev` to start Vite dev server with Hot Module Replacement
2. For WordPress integration during development, you can either:
   - Run `npm run build` after each change and reload the WordPress admin
   - Configure Vite's dev server as a proxy in front of WordPress
   - Use BrowserSync or similar for live reload

## Linting & Formatting

Helix uses WordPress coding standards via `@wordpress/scripts`:

- **ESLint**: WordPress JavaScript coding standards
- **Prettier**: WordPress Prettier config (`.prettierrc.js`)
- **PHPCS**: PHP CodeSniffer config available at `phpcs.xml.dist`

### ESLint Config

**File**: [.eslintrc.js](../.eslintrc.js)

Configured for browser environment with React and WordPress globals.

### Prettier Config

**File**: [.prettierrc.js](../.prettierrc.js)

WordPress-standard formatting rules.

## Current Limitations

1. **Single entry point** — The entire React app builds from `App.jsx`. There is no code splitting or lazy loading of per-page bundles.
2. **No CSS modules** — Styles are plain CSS files imported in components. No CSS Modules, Tailwind, or styled-components.
3. **No environment variable handling** — No `.env` file support configured for differentiating dev/prod API URLs.
4. **No bundle analysis** — No `rollup-plugin-visualizer` or similar tool for analyzing bundle size.
5. **MUI v7 may tree-shake poorly** — The entire MUI library is a dependency even though only icons are used in Dashboard and Posts pages.
6. **No TypeScript** — The project is plain JavaScript (`.jsx`).

## Planned Improvements

- [ ] Code splitting: separate bundles per page (Dashboard, Posts, Settings, Users)
- [ ] Lazy loading with `React.lazy()` + `Suspense`
- [ ] Bundle size analysis and MUI tree-shaking optimization
- [ ] Environment variables for API URL configuration
- [ ] CSS Modules or Tailwind for scoped styling
- [ ] TypeScript migration
