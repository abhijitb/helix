# Users Management

## Status: ❌ Not Implemented (Stub)

The Users Management page exists as a placeholder component and a registered admin menu page, but contains no functional implementation.

## Current State

### Component (Stub)

**File**: [src/App.jsx](../src/App.jsx), lines 18–25

```jsx
function UsersApp() {
    return (
        <div className="helix-page">
            <h1>Users Management</h1>
            <p>Users management interface will be implemented here.</p>
        </div>
    );
}
```

### Mount Point

The component mounts at `#helix-users-root` container on the `helix-users` admin page. The container is rendered by `helix_users_callback()` in [admin/menu-customization.php](../admin/menu-customization.php).

### Admin Menu

A "Users" menu item is registered at position 4 in the Helix admin menu (between Posts and Settings), accessible to users with `list_users` capability.

## Planned Features

The following features are needed to complete the Users Management page:

### Phase 1 — Foundation

- [ ] **User list table** with columns: avatar, username, name, email, role, posts count
- [ ] **Pagination** for large user bases
- [ ] **Search & filtering** by username, email, role
- [ ] **Sortable columns**

### Phase 2 — CRUD Operations

- [ ] **View user details** (profile information, metadata)
- [ ] **Edit user** — name, email, role, password reset
- [ ] **Create new user** form with role assignment and notification email
- [ ] **Delete user** with content reassignment option
- [ ] **Bulk actions** — change role, delete, send email

### Phase 3 — Advanced Features

- [ ] **Role management** — create/edit/delete custom roles and capabilities
- [ ] **User activity log**
- [ ] **Last login tracking**
- [ ] **User export** (CSV)
- [ ] **User import**

## API Integration

The WordPress REST API already provides user endpoints that the UI would consume:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wp-json/wp/v2/users` | GET | List users (with pagination, search, role filters) |
| `/wp-json/wp/v2/users/{id}` | GET | Get single user |
| `/wp-json/wp/v2/users` | POST | Create user |
| `/wp-json/wp/v2/users/{id}` | POST/PUT | Update user |
| `/wp-json/wp/v2/users/{id}` | DELETE | Delete user |
| `/wp-json/wp/v2/users/me` | GET | Current user profile |

## Dependencies

- WordPress REST API (already available)
- Existing Helix component library (FormField, TextInput, SelectInput, ToggleInput, Notification, SaveButton)
- `react-router-dom` (already installed as a dependency)
