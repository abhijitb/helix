# Dashboard

## Overview

The Dashboard is the landing page of Helix, providing an at-a-glance overview of the WordPress site. It replaces the default WordPress admin dashboard with a modern, card-based design.

**File**: [src/pages/Dashboard/Dashboard.jsx](../src/pages/Dashboard/Dashboard.jsx)

## Features

### Statistics Overview

Four stat cards display real-time counts fetched from the WordPress REST API:

| Card | API Source | Icon |
|------|-----------|------|
| Posts | `GET /wp-json/wp/v2/posts` (count via `X-WP-Total` header) | ArticleIcon |
| Pages | `GET /wp-json/wp/v2/pages` (count via `X-WP-Total` header) | DescriptionIcon |
| Comments | `GET /wp-json/wp/v2/comments` (count via `X-WP-Total` header) | CommentIcon |
| Users | `GET /wp-json/wp/v2/users` (count via `X-WP-Total` header) | PeopleIcon |

Each card shows:
- An icon with color-coded styling (blue, green, orange, purple)
- The count number
- A trend indicator (currently hardcoded, not computed from real data)

### Recent Posts Widget

Displays the 5 most recent posts:
- Post title (clickable, links to wp-admin editor)
- Publication date (formatted as `MMM DD, YYYY`)
- Status badge (publish, draft, private, etc.)
- "View All" link to the default wp-admin posts page
- Empty state: prompts to create first post

### Recent Comments Widget

Displays the 5 most recent comments:
- Author name
- Excerpt (first 100 chars, HTML stripped)
- Date
- Status badge
- "View All" link to wp-admin comments page
- Empty state message

### Quick Actions Widget

Four shortcut cards linking to WordPress admin pages:
1. **Write a Post** → `post-new.php`
2. **Create a Page** → `post-new.php?post_type=page`
3. **Upload Media** → `upload.php`
4. **Moderate Comments** → `edit-comments.php`

### WordPress News Widget

A placeholder widget with hardcoded content about WordPress 6.4 "Shirley". The "Read more" link points to `wordpress.org/news`. **Not yet connected to the WordPress news feed.**

## State Management

Uses local `useState` and `useEffect`:

```
[dashboardData] = {
    postsCount, pagesCount, commentsCount, usersCount,
    recentPosts[], recentComments[],
    loading: boolean
}
```

### Loading Behavior

- Shows a spinner with "Loading dashboard..." text while fetching
- Uses `Promise.all` to fetch all four data sources in parallel
- On error, silently sets `loading: false` (no error UI shown)

## Known Limitations

1. **Trend percentages** (+12%, +5%, +28%, +3%) are hardcoded — not derived from real analytics
2. **WordPress News** is hardcoded placeholder text
3. **No error UI** — fetch failures silently show empty dashboard
4. **Links to wp-admin** — Quick Actions and "View All" links go to the original wp-admin, not Helix-managed pages
5. **No refresh mechanism** — data is fetched once on mount, no polling or auto-refresh

## Planned Enhancements

- [ ] Real trend data (compare current count to previous period)
- [ ] Live WordPress news feed via RSS/API
- [ ] Error state with retry button
- [ ] Periodic auto-refresh of dashboard data
- [ ] Replace wp-admin links with Helix-native pages once those features are built
