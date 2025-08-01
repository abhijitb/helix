
# ⚛️ Helix – A Modern WordPress Admin UI

Helix is a fully custom, React-powered replacement for the default WordPress admin (`wp-admin`). Designed for speed, simplicity, and extensibility, Helix provides a clean and intuitive interface for managing your WordPress site.

> Think of it as **your own WordPress control panel**, built for modern needs — with optional 2FA, global settings access, and a modular React interface.

---

## ✨ Features

- 🚀 Full React-based SPA admin interface (built with Vite)
- ⚙️ Modular settings panels (site language, title, etc.)
- 🔐 Optional two-factor authentication (per user)
- 🔁 Full override of `wp-admin` via redirect
- 📡 Custom REST API endpoints for settings and control
- 🧩 Easily extendable with new components and admin pages

---

## 🗂️ Directory Structure

```
helix/
├── helix.php                  # Plugin entry point
├── admin/                     # PHP admin logic
│   ├── init.php               # Registers custom admin page
│   ├── rest-routes.php        # Defines REST API endpoints
│   └── disable-wp-admin.php   # Redirects all wp-admin traffic
├── build/                     # Compiled Vite build (output)
├── src/                       # React source
│   ├── App.jsx                # Root SPA app
│   ├── pages/                 # Modular page views
│   ├── components/            # Reusable UI components
│   └── features/              # Feature modules (e.g. 2FA)
├── enqueue.php                # Enqueues the SPA in WP
├── vite.config.js             # Vite build config
├── package.json               # JS dependencies & scripts
└── README.md                  # You are here!
```

---

## 🚀 Getting Started

### 1. Install & Activate the Plugin

- Download and unzip into `wp-content/plugins/helix`
- Or upload the ZIP via the WordPress admin panel
- Activate the **Helix** plugin

### 2. Build the React App

Helix uses [Vite](https://vitejs.dev/) for fast frontend development and builds.

```bash
# Navigate to the plugin directory
cd wp-content/plugins/helix

# Install dependencies
npm install

# Build the production app
npm run build
```

This will output the React SPA to the `/build` directory, which WordPress loads automatically.

---

## 🧪 Development Mode

To run Vite in development with hot module reload:

```bash
npm run dev
```

> Optional: You can proxy WordPress via Vite or use BrowserSync for live updates.

---

## 🧱 Plugin Hooks & REST API

### Custom Admin Page
The plugin registers a new admin page at:

```
/wp-admin/admin.php?page=helix
```

It becomes the new dashboard and **replaces** `wp-admin`.

### Redirecting wp-admin
All standard `wp-admin` pages (except Helix) redirect to the custom React UI.

### REST API Example
Custom REST route to fetch site settings:

```
GET /wp-json/helix/v1/settings
```

---

## 🔐 Optional 2FA

Helix includes a basic architecture for optional **Two-Factor Authentication (TOTP)**:

- Each user can enable/disable 2FA in their settings.
- Secrets are stored securely in `user_meta`.
- Validation can be added via `wp_login` or custom middleware.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production assets |
| `npm install` | Install dependencies |

---

## 🛠️ To Do / Ideas

- [ ] Post and Page Manager (custom list views)
- [ ] Media Library replacement
- [ ] User & Role Manager
- [ ] Live preview / content sync
- [ ] Theming system (Light/Dark)
- [ ] Accessibility support

---

## 📄 License

MIT License – Customize, extend, and rebrand as you see fit.

---

## ✍️ Author

Built by Acecoder 
Feel free to reach out with contributions or questions!
