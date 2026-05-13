# Helix Documentation

Helix is a fully custom, React-powered replacement for the default WordPress admin (`wp-admin`). Designed for speed, simplicity, and extensibility, it provides a clean and intuitive interface for managing your WordPress site.

## Document Index

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | Core plugin architecture, PHP backend, REST API, and how it all fits together |
| [Dashboard](dashboard.md) | Dashboard page — stats overview, recent content, quick actions |
| [Posts Management](posts-management.md) | Posts list view, filtering, CRUD operations, and future phases |
| [Settings](settings.md) | Settings page — site config, content, writing, media, users, and Helix preferences |
| [Users Management](users-management.md) | Users management (planned, not yet implemented) |
| [Two-Factor Authentication](two-factor-auth.md) | 2FA architecture (planned, stub only) |
| [Component Library](component-library.md) | Reusable React UI components |
| [Build System](build-system.md) | Vite build configuration, scripts, and asset pipeline |
| [Implementation Plan](implementation-plan.md) | Overall project roadmap and status of all features |

## Quick Links

- **Source code**: `/src/` (React) and `/admin/` (PHP)
- **Build output**: `/build/`
- **Plugin entry point**: `helix.php`
- **Package scripts**: See `package.json`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Material UI 7, Emotion |
| Build | Vite 5 |
| Backend | PHP (WordPress plugin API) |
| API | WordPress REST API (custom `helix/v1` + core `wp/v2`) |
| Linting | ESLint, Prettier via `@wordpress/scripts` |
