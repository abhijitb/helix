# Posts Management

## Overview

The Posts Management page provides a modern React interface for managing WordPress posts. It is currently at **Phase 1** (Foundation & Core List View) of a 5-phase implementation plan.

**Main File**: [src/pages/Posts/Posts.jsx](../src/pages/Posts/Posts.jsx)
**Implementation Plan**: [src/pages/Posts/Implementation-Phases.md](../src/pages/Posts/Implementation-Phases.md)

## Phase 1 — Implemented ✅

### Core List View

A responsive table displaying posts with these columns:

| Column | Description |
|--------|-------------|
| Checkbox | Selection checkbox (not yet wired to bulk actions) |
| Title | Post title with excerpt (first 100 chars), plus quick action buttons |
| Author | Display name (from `_embedded` data) |
| Categories | Category tags |
| Tags | Tag labels |
| Status | Color-coded status badge (Publish, Draft, Private, Pending, Future) |
| Date | Formatted as `MMM DD, YYYY` |
| Actions | Dropdown menu (⋮) with contextual actions |

### CRUD Operations

| Operation | Status | Notes |
|-----------|--------|-------|
| **View** | ✅ | Opens post link in new tab |
| **Edit** | ✅ | Opens wp-admin editor (`post.php?post={id}&action=edit`) in new tab |
| **Preview** | ✅ | Opens `post.link?preview=true` in new tab |
| **Delete** | ✅ | Confirmation dialog → `DELETE /wp-json/wp/v2/posts/{id}` |
| **Status Change** | ✅ | Publish, Draft, Private, Pending via dropdown or row buttons |
| **Copy Link** | ✅ | Copies post URL to clipboard |
| **Create** | ❌ | "Add New Post" button has no handler |
| **Quick Edit** | ❌ | Dropdown option exists but is a no-op |

### Filtering

| Filter | Type | API Integration |
|--------|------|----------------|
| Search | Text input | `?search=` query param on `/wp/v2/posts` |
| Status | Dropdown (All, Published, Draft, Pending, Private, Scheduled) | `?status=` query param |
| Author | Dropdown (populated from `/wp/v2/users`) | `?author=` query param |
| Date Range | Dropdown (All, Today, Yesterday, This Week, This Month, This Quarter, This Year) | **Client-side only** — date filtering not yet sent to API |

Filtering includes:
- **Apply Filters** button — triggers API call with current filters
- **Clear Filters** button — resets all filters to defaults
- Active filter detection to show/hide Clear button

### Pagination

- "Page X of Y" display
- Previous / Next buttons (disabled at boundaries)
- Range info: "Showing A to B of C posts"
- `X-WP-Total` and `X-WP-TotalPages` headers parsed from API responses

## Component Structure

```
src/pages/Posts/
├── Posts.jsx                 # Main page: state, API calls, handlers
├── components/
│   ├── PostsList.jsx         # Table + pagination UI
│   ├── PostRow.jsx           # Single row: title, excerpt, actions, status
│   └── PostFilters.jsx       # Search input + filter dropdowns
├── utils/
│   └── postsAPI.js           # Centralized API functions
├── Posts.css                 # Page-level styles
└── components/
    ├── PostsList.css
    ├── PostRow.css
    └── PostFilters.css
```

## API Integration

Uses WordPress core REST API (`/wp-json/wp/v2/`):

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/posts` | GET | Fetch posts with pagination & filters |
| `/posts/{id}` | POST | Update post (status changes) |
| `/posts/{id}` | DELETE | Delete a post |
| `/users` | GET | Populate author filter dropdown |
| `/categories` | GET | Fetch categories (fetched but not used in filters) |

The `postsAPI.js` utility also has pre-built functions for `createPost`, `updatePost`, `fetchTags` that are not yet wired to the UI.

## States Covered

- **Loading**: Spinner with "Loading posts..." text
- **Empty**: "No posts found" with suggestion to adjust filters
- **Error**: Error message with retry button
- **Edge cases**: Single-page results, last page deletion triggers refresh

## Phase 2 — Planned (Not Implemented) ❌

- **Bulk operations**: Select-all checkbox, bulk action toolbar (publish, draft, delete, move to trash)
- **Advanced filtering**: Category/tag filters, saved filter presets
- **Quick Edit modal**: Inline editing of title, excerpt, categories
- **Sortable columns**: Click column headers to sort
- **Customizable columns**: Show/hide columns
- **Post thumbnails** in list view

## Phase 3 — Planned ❌

- **Full post editor** with rich text (TinyMCE or similar)
- **Media library integration** — drag & drop uploads, featured image management
- **Category & tag management** UI
- **Custom fields** support
- **Content scheduling** with timezone support
- **Post revisions** browser

## Phase 4 — Planned ❌

- **Editorial calendar** with drag & drop scheduling
- **Collaboration workflow** — review, approval, editorial comments
- **Content analytics** — readability, SEO scoring

## Phase 5 — Planned ❌

- **Virtual scrolling** for large post lists
- **Advanced caching**
- **Drag & drop reordering**
- **WCAG 2.1 AA accessibility**
- **Custom post type support**
- **Plugin extensibility API**
