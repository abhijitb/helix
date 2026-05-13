# Implementation Plan

## Project Status Overview

Helix is at **version 0.1.0** — a functional MVP with core infrastructure complete, one fully implemented feature (Settings), one partially implemented feature (Posts), and several features in planning/stub state.

## Status Summary

| Feature | Status | Completion |
|---------|--------|------------|
| Core PHP Architecture | ✅ Implemented | 100% |
| Admin Redirect & Menu | ✅ Implemented | 100% |
| REST API (Settings) | ✅ Implemented | 100% |
| Settings Page | ✅ Implemented | 100% |
| Dashboard | ✅ Implemented | 80% |
| Posts Management | 🟡 Phase 1 of 5 | 25% |
| Component Library | ✅ Implemented | 70% |
| Build System | ✅ Implemented | 80% |
| Users Management | ❌ Stub | 5% |
| 2FA | ❌ Stub | 0% |
| Media Library | ❌ Not Started | 0% |
| Page Manager | ❌ Not Started | 0% |

## Priority Roadmap

### Phase A — Complete Current Features (2–3 weeks)

**Goal**: Finish what's already in progress before starting new features.

#### A1. Dashboard Polish
- [ ] Replace hardcoded trend percentages with computed deltas from previous period
- [ ] Fetch live WordPress news from the WordPress.org RSS feed
- [ ] Add error UI with retry button for failed data fetches
- [ ] Add periodic auto-refresh (60s polling)
- [ ] Replace all `wp-admin` links with Helix-native pages once available

#### A2. Posts — Phase 2 (Enhanced List)
- [ ] Wire up the "Add New Post" button to a creation form
- [ ] Implement bulk actions toolbar with select-all checkbox
- [ ] Add category and tag filter dropdowns (API already fetches them)
- [ ] Move date-range filtering from client-side to API query parameters
- [ ] Implement column sorting (click headers to sort by title, date, status)
- [ ] Add post thumbnails column

### Phase B — Missing Core Features (4–6 weeks)

**Goal**: Build features that exist as stubs.

#### B1. Posts — Phase 3 (Editor)
- [ ] Integrate a rich text editor (TinyMCE, Lexical, or TipTap)
- [ ] Build a full post creation/editing page within Helix (no wp-admin redirect)
- [ ] Add featured image selector with media library integration
- [ ] Category/tag assignment UI with autocomplete
- [ ] Content scheduling (future publish date)
- [ ] Draft auto-save

#### B2. Users Management
- [ ] User list with pagination, search, and role filtering
- [ ] Create/Edit user forms
- [ ] Delete user with content reassignment
- [ ] Bulk role changes
- [ ] Role & capability management

#### B3. Media Library
- [ ] Media grid/list view with pagination
- [ ] Drag-and-drop upload
- [ ] Media details panel (metadata, URLs, dimensions)
- [ ] Media search and filtering
- [ ] Bulk delete

### Phase C — Advanced Features (6–8 weeks)

**Goal**: Differentiate Helix with features beyond the default WordPress admin.

#### C1. Two-Factor Authentication
- [ ] PHP: TOTP library integration, secret generation, code validation
- [ ] PHP: REST endpoints for 2FA enable/disable/verify
- [ ] PHP: `wp_login` filter integration
- [ ] React: 2FA setup wizard with QR code
- [ ] Backup codes and recovery flow
- [ ] Rate limiting and brute-force protection

#### C2. Posts — Phase 4 (Collaboration)
- [ ] Editorial calendar view
- [ ] Review and approval workflow
- [ ] Editorial comments on drafts
- [ ] Team assignment and notifications

#### C3. Page Manager
- [ ] Page list view (similar to Posts list)
- [ ] Page hierarchy/tree view
- [ ] Page editor integration
- [ ] Page attributes (parent, template, order)

### Phase D — Polish & Performance (2–3 weeks)

**Goal**: Production readiness.

- [ ] Replace multi-mount-point architecture with proper client-side routing via `react-router-dom`
- [ ] Implement code splitting and lazy loading per page
- [ ] Add light/dark theme toggle with CSS custom properties
- [ ] WCAG 2.1 AA accessibility audit and fixes
- [ ] Keyboard navigation support
- [ ] Error boundaries on all pages
- [ ] Comprehensive test suite (unit + integration)
- [ ] Bundle size optimization (tree-shake MUI, remove unused deps)
- [ ] Virtual scrolling for lists with 100+ items
- [ ] Offline caching with service worker

## Architecture Improvements

These are cross-cutting changes that affect multiple features:

| Improvement | Priority | Effort |
|-------------|----------|--------|
| True SPA routing with `react-router-dom` | High | Medium |
| Code splitting & lazy loading | High | Low |
| Centralized API client (replace inline `fetch` calls) | Medium | Medium |
| Global error boundary | Medium | Low |
| TypeScript migration | Low | High |
| CSS Modules or Tailwind | Low | High |
| End-to-end tests (Playwright/Cypress) | Low | Medium |

## Success Criteria

- **Phase A**: Dashboard is production-quality; Posts has bulk operations and creation
- **Phase B**: Users can manage users, media, and create/edit posts without ever leaving Helix
- **Phase C**: 2FA is production-ready; editorial workflow is functional
- **Phase D**: Helix passes accessibility audit; bundle size is under 200KB gzipped; test coverage > 80%

## Risk Factors

1. **WordPress Core Updates**: The `wp-admin` redirect hijack relies on specific hooks and globals that could change in future WP versions
2. **REST API Rate Limits**: No caching layer exists — repeated API calls could trigger rate limiting on some hosts
3. **MUI Bundle Size**: Material UI v7 adds significant weight; may need to swap for a lighter alternative or tree-shake aggressively
4. **Plugin Conflicts**: Other plugins that modify the admin menu or REST API could conflict with Helix's aggressive menu removal and redirect
5. **Auth Token Expiry**: REST API nonces expire after 24 hours — long-lived admin sessions may need a token refresh mechanism
