# Core Architecture

## Overview

Helix is a WordPress plugin that completely replaces the default `wp-admin` interface with a React SPA. It uses Vite for the frontend build and WordPress's native REST API + custom endpoints for data communication.

```
┌─────────────────────────────────────────────────┐
│                  Browser                         │
│  ┌───────────────────────────────────────────┐  │
│  │        React SPA (Vite build)             │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │  │
│  │  │Dashboard│ │  Posts   │ │ Settings  │  │  │
│  │  └─────────┘ └──────────┘ └───────────┘  │  │
│  │  ┌─────────┐ ┌──────────┐                │  │
│  │  │  Users  │ │   2FA    │                │  │
│  │  └─────────┘ └──────────┘                │  │
│  └───────────────────────────────────────────┘  │
│         │ fetch()                  ▲             │
└─────────┼─────────────────────────┼─────────────┘
          │                         │
          ▼                         │
┌─────────────────────────────────────────────────┐
│              WordPress Backend                   │
│  ┌───────────────────────────────────────────┐  │
│  │  REST API Endpoints                       │  │
│  │  /wp-json/helix/v1/settings    (custom)   │  │
│  │  /wp-json/wp/v2/posts|users|.. (core)     │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  PHP Admin Layer                          │  │
│  │  init.php         - register admin page   │  │
│  │  disable-wp-admin  - redirect to Helix    │  │
│  │  menu-customization - custom menus        │  │
│  │  rest-routes.php  - REST endpoints        │  │
│  │  settings-api.php - settings config/SOP   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## PHP Backend

### Plugin Bootstrap (`helix.php`)

The main plugin file loads all PHP modules:

```php
require_once __DIR__ . '/admin/init.php';
require_once __DIR__ . '/admin/rest-routes.php';
require_once __DIR__ . '/admin/disable-wp-admin.php';
require_once __DIR__ . '/admin/menu-customization.php';
require_once __DIR__ . '/enqueue.php';
```

### Admin Page Registration (`admin/init.php`)

Registers a top-level admin menu page at `/wp-admin/admin.php?page=helix`. Sets a global `helix_is_current_screen` flag used elsewhere for conditional behavior.

### Admin Redirect (`admin/disable-wp-admin.php`)

Hijacks all standard `wp-admin` traffic and redirects to Helix with these safety guards:
- Skips AJAX requests, REST API calls, and cron jobs
- Preserves critical pages: `admin-ajax.php`, `admin-post.php`, `update.php`, `upgrade.php`, etc.
- Passes the original admin route via `helix_route` query parameter for the React app to restore context
- Respects the `helix_use_default_admin` option for opting back into the original WP admin
- Redirects post-login to Helix via the `login_redirect` filter

### Menu Customization (`admin/menu-customization.php`)

When on a Helix page:
- **Removes** all default WordPress admin menus (Dashboard, Posts, Media, Pages, Comments, Appearance, Plugins, Users, Tools, Settings)
- **Adds** Helix-specific menus: Posts, Users, Settings
- **Adds** a "WordPress Admin" menu item that sets `helix_use_default_admin = true` to switch back to the original admin

### REST API Routes (`admin/rest-routes.php`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/wp-json/helix/v1/settings` | Retrieve all WordPress settings grouped by category |
| `POST` | `/wp-json/helix/v1/settings` | Update multiple settings at once |
| `GET` | `/wp-json/helix/v1/settings/{setting}` | Retrieve a single setting |
| `POST` | `/wp-json/helix/v1/settings/{setting}` | Update a single setting |

All endpoints require `manage_options` capability.

### Settings API (`admin/settings-api.php`)

A comprehensive 900-line settings infrastructure:

- **Settings Configuration** (`helix_get_settings_config()`): Defines ~26 settings across 6 categories (site_information, content_reading, writing_publishing, media_assets, users_membership, helix_specific)
- **Option Mapping** (`helix_get_option_mapping()`): Maps Helix setting keys to WordPress option names (e.g., `siteTitle` → `blogname`)
- **Sanitization**: Type-based (string, email, URL, integer, number, boolean) with enum validation
- **Validation**: REST API schema generation with per-setting args, enums, min/max
- **Special Handlers**: Timezone (handles both city-based and UTC offset formats), Language (auto-installs language packs)

### Asset Enqueuing (`enqueue.php`)

On Helix admin pages, enqueues the Vite-built `build/index.js` and the generated CSS file. Localizes `helixData` into the page:

```js
window.helixData = {
    restUrl:   '/wp-json/helix/v1/',   // Custom Helix REST base
    wpRestUrl: '/wp-json/wp/v2/',      // Core WordPress REST base
    nonce:     '<wp_rest_nonce>',       // REST API nonce
    user:      { ...current_user },     // Current WP user object
    originalRoute: '/wp-admin/...',     // Preserved admin route from redirect
    adminUrl:  'https://.../wp-admin/', // Base admin URL
};
```

## React Frontend

### Mounting Strategy

Rather than a true client-side SPA router, Helix uses **multiple DOM mount points** — one per page. Each WordPress admin page (helix, helix-posts, helix-users, helix-settings) renders its own `<div id="helix-*-root">` container. The React app ([App.jsx](../src/App.jsx)) checks for each container on `DOMContentLoaded` and renders the appropriate component:

| Container ID | Component |
|-------------|-----------|
| `#helix-root` | `<Dashboard />` |
| `#helix-settings-root` | `<Settings />` |
| `#helix-posts-root` | `<Posts />` |
| `#helix-users-root` | `<UsersApp />` (stub) |

### Data Flow

1. PHP exposes `window.helixData` with REST URLs, nonce, and user data
2. React components call WordPress REST API via `fetch()` with the nonce in headers
3. Custom hooks (`useSettings`) manage state, loading, and error states
4. Changes are persisted back through REST endpoints

## Directory Structure

```
helix/
├── helix.php                  # Plugin entry point
├── enqueue.php                # Asset enqueuing + helxData
├── admin/                     # PHP backend
│   ├── init.php               # Admin page registration
│   ├── disable-wp-admin.php   # wp-admin redirect logic
│   ├── menu-customization.php # Menu replacement
│   ├── rest-routes.php        # REST API endpoints
│   └── settings-api.php       # Settings config & utilities
├── src/                       # React frontend
│   ├── App.jsx                # Root app + mount logic
│   ├── components/            # Reusable UI components
│   └── pages/                 # Feature pages
│       ├── Dashboard/
│       ├── Posts/
│       ├── Settings/
│       └── TwoFA/
├── build/                     # Vite build output
├── vite.config.mjs            # Vite configuration
└── package.json               # JS dependencies & scripts
```
