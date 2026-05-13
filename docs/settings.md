# Settings

## Overview

The Settings page provides a complete React interface for managing all WordPress site configuration. It is the most fully implemented feature of Helix, with 6 tabbed sections covering every standard WordPress settings category plus Helix-specific options.

**Main File**: [src/pages/Settings/Settings.jsx](../src/pages/Settings/Settings.jsx)
**Custom Hook**: [src/pages/Settings/hooks/useSettings.js](../src/pages/Settings/hooks/useSettings.js)
**API Utilities**: [src/pages/Settings/utils/settingsAPI.js](../src/pages/Settings/utils/settingsAPI.js)

## Feature Overview

### Tabbed Interface

Six tabs organize settings into logical groups:

| Tab | Component | Settings Count |
|-----|-----------|----------------|
| **Site Information** | [SiteInformationSettings.jsx](../src/pages/Settings/components/SiteInformationSettings.jsx) | 7 settings |
| **Content & Reading** | [ContentReadingSettings.jsx](../src/pages/Settings/components/ContentReadingSettings.jsx) | 8 settings |
| **Writing & Publishing** | [WritingPublishingSettings.jsx](../src/pages/Settings/components/WritingPublishingSettings.jsx) | 5 settings |
| **Media Assets** | [MediaAssetsSettings.jsx](../src/pages/Settings/components/MediaAssetsSettings.jsx) | 9 settings |
| **Users & Membership** | [UsersMembershipSettings.jsx](../src/pages/Settings/components/UsersMembershipSettings.jsx) | 2 settings |
| **Helix** | [HelixSettings.jsx](../src/pages/Settings/components/HelixSettings.jsx) | 1 setting |

### Tab Switching Protection

When switching tabs with unsaved changes, a `window.confirm` dialog warns the user before discarding edits.

### Settings by Category

#### Site Information
| Setting | Key | Type | WordPress Option |
|---------|-----|------|-----------------|
| Site Title | `siteTitle` | text (required) | `blogname` |
| Tagline | `tagline` | text | `blogdescription` |
| WordPress Address (URL) | `siteUrl` | url | `siteurl` |
| Site Address (URL) | `homeUrl` | url | `home` |
| Admin Email | `adminEmail` | email (required) | `admin_email` |
| Site Language | `language` | select | `WPLANG` |
| Timezone | `timezone` | select | `timezone_string` / `gmt_offset` |

#### Content & Reading
| Setting | Key | Type | Notes |
|---------|-----|------|-------|
| Homepage Displays | `showOnFront` | select | `posts` or `page` |
| Homepage | `pageOnFront` | number | Page ID when `showOnFront = page` |
| Posts Page | `pageForPosts` | number | Page ID for blog posts |
| Posts Per Page | `postsPerPage` | number | Blog page pagination |
| Search Engine Visibility | `blogPublic` | toggle | Discourage indexing |
| Date Format | `dateFormat` | text | Custom date format string |
| Time Format | `timeFormat` | text | Custom time format string |
| Week Starts On | `startOfWeek` | select | 0–6 (Sunday–Saturday) |

#### Writing & Publishing
| Setting | Key | Type |
|---------|-----|------|
| Default Post Category | `defaultCategory` | number |
| Default Post Format | `defaultPostFormat` | select |
| Convert Emoticons | `useSmilies` | toggle |
| Default Comment Status | `defaultCommentStatus` | select (open/closed) |
| Default Ping Status | `defaultPingStatus` | select (open/closed) |

#### Media Assets
| Setting | Key | Type |
|---------|-----|------|
| Site Logo | `siteLogo` | number (attachment ID) |
| Site Icon | `siteIcon` | number (attachment ID) |
| Thumbnail Width | `thumbnailSizeW` | number |
| Thumbnail Height | `thumbnailSizeH` | number |
| Medium Width | `mediumSizeW` | number |
| Medium Height | `mediumSizeH` | number |
| Large Width | `largeSizeW` | number |
| Large Height | `largeSizeH` | number |
| Organize Uploads | `uploadsUseYearmonthFolders` | toggle |

#### Users & Membership
| Setting | Key | Type |
|---------|-----|------|
| Anyone Can Register | `usersCanRegister` | toggle |
| Default Role | `defaultRole` | select (subscriber, contributor, author, editor, administrator) |

#### Helix
| Setting | Key | Type |
|---------|-----|------|
| Use Default WP Admin | `helixUseDefaultAdmin` | toggle |

## State Management

### useSettings Hook

The [useSettings](../src/pages/Settings/hooks/useSettings.js) custom hook encapsulates all settings state:

```js
const {
    settings,           // Flattened key→value map
    loading,            // Initial fetch in progress
    saving,             // Save operation in progress
    error,              // Global error message
    hasUnsavedChanges,  // Dirty state flag
    updateSetting,      // (key, value) → update local state
    saveSettings,       // () → persist to REST API
    resetSettings,      // () → revert all to original
    resetSetting,       // (key) → revert single field
    loadSettings,       // () → reload from server
} = useSettings();
```

### Dirty State Detection

- Tracks original values separately from current values
- Compares all settings after every change
- Handles both plain values and objects with `value`/`options` structure (for select dropdowns)
- Sets `hasUnsavedChanges` flag used by SaveButton and tab-switching guard

### BeforeUnload Protection

If `hasUnsavedChanges` is true, the hook registers a `beforeunload` event listener that triggers the browser's native "Leave site?" dialog.

### Save Flow

1. User modifies settings → local state updates, `hasUnsavedChanges = true`
2. User clicks "Save Changes"
3. Hook diffs current vs original, sends only changed settings via `POST /wp-json/helix/v1/settings`
4. On success: updates original values, shows success notification, scrolls to top
5. On failure: shows error notification with server message
6. Partial failures: some settings succeed, others report errors individually

## REST API Integration

Settings are fetched from and saved to custom Helix REST endpoints:

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Load all | `/wp-json/helix/v1/settings` | GET |
| Save all changes | `/wp-json/helix/v1/settings` | POST |
| Load single | `/wp-json/helix/v1/settings/{key}` | GET |
| Save single | `/wp-json/helix/v1/settings/{key}` | POST |

All requests include `X-WP-Nonce` header for authentication and `credentials: 'include'` for cookie-based auth.

## UI States

- **Loading**: Spinner with "Loading settings..."
- **Idle**: Form fields populated with current values
- **Dirty**: "Reset Changes" button appears, tab switch warns
- **Saving**: Save button shows spinner + "Saving..."
- **Saved**: "✓ All changes saved" indicator
- **Error**: Red notification banner at top
- **Success**: Green notification at top (auto-dismisses after 5s)

## Component Hierarchy

```
Settings.jsx
├── Notification.jsx          # Global error + action notifications
├── SettingsTabs.jsx          # Tab navigation bar
├── SettingsSection.jsx       # Reusable section wrapper
│   ├── SiteInformationSettings.jsx
│   │   ├── TextInput (siteTitle, tagline, siteUrl, homeUrl, adminEmail)
│   │   └── SelectInput (language, timezone)
│   ├── ContentReadingSettings.jsx
│   │   ├── SelectInput (showOnFront, startOfWeek)
│   │   ├── NumberInput (postsPerPage)
│   │   ├── TextInput (dateFormat, timeFormat)
│   │   └── ToggleInput (blogPublic)
│   ├── WritingPublishingSettings.jsx
│   │   ├── NumberInput (defaultCategory)
│   │   ├── SelectInput (defaultPostFormat, defaultCommentStatus, defaultPingStatus)
│   │   └── ToggleInput (useSmilies)
│   ├── MediaAssetsSettings.jsx
│   │   ├── NumberInput (all image sizes)
│   │   └── ToggleInput (uploadsUseYearmonthFolders)
│   ├── UsersMembershipSettings.jsx
│   │   ├── ToggleInput (usersCanRegister)
│   │   └── SelectInput (defaultRole)
│   └── HelixSettings.jsx
│       └── ToggleInput (helixUseDefaultAdmin)
└── SaveButton.jsx            # Save + Reset controls
```

## Known Limitations

1. **Page selectors** (`pageOnFront`, `pageForPosts`) use numeric inputs instead of a page-picker dropdown
2. **Media selectors** (`siteLogo`, `siteIcon`) are numeric attachment ID inputs — no media library browser integration
3. **Default category** is a number input, not a category-picker
4. **Date/Time formats** are free-text inputs with no format preview or common-preset picker
5. **No per-field validation errors** — only global success/failure notifications
