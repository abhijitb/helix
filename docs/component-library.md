# Component Library

## Overview

Helix includes a set of reusable React components for building admin interface forms. These components follow a consistent pattern: each wraps a [FormField](file:///Users/abhijit.bhatnagar/Sites/helix/src/components/FormField.jsx) for label, description, and error display, and exposes a minimal API of props.

All components are located in [src/components/](../src/components/).

## Components

### FormField

**File**: [FormField.jsx](../src/components/FormField.jsx)

A layout wrapper that provides consistent labeling and error display for form inputs.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Field label (displayed above input) |
| `description` | string | Help text (displayed below label) |
| `error` | string | Error message (displayed in red below input) |
| `required` | bool | Shows a red asterisk next to label |
| `children` | node | The input element(s) to wrap |
| `className` | string | Additional CSS class |

### TextInput

**File**: [TextInput.jsx](../src/components/TextInput.jsx)

Standard text input with optional type specialization (text, email, url, password).

**Props** (extends FormField props):
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'text'` | HTML input type |
| `value` | any | — | Current value |
| `onChange` | fn | — | `(value) => void` callback |
| `placeholder` | string | — | Placeholder text |
| `disabled` | bool | `false` | Disable input |
| `required` | bool | `false` | Mark as required |
| `error` | string | `null` | Error message |

### SelectInput

**File**: [SelectInput.jsx](../src/components/SelectInput.jsx)

Dropdown select input for choosing from predefined options.

**Props** (extends FormField props):
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | any | — | Current selected value |
| `options` | array | `[]` | Array of `{ value, label }` objects |
| `onChange` | fn | — | `(value) => void` callback |
| `placeholder` | string | — | Default empty option text |
| `disabled` | bool | `false` | Disable select |
| `required` | bool | `false` | Mark as required |
| `error` | string | `null` | Error message |

**Options Format**:
```js
[
    { value: 'option_value', label: 'Display Label' },
    // or plain values:
    'option_value',
]
```

### NumberInput

**File**: [NumberInput.jsx](../src/components/NumberInput.jsx)

Numeric input with optional min/max/step constraints.

**Props** (extends FormField props):
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number/string | — | Current value |
| `onChange` | fn | — | `(value) => void` — empty string → `''`, otherwise `Number` |
| `min` | number | `null` | Minimum value |
| `max` | number | `null` | Maximum value |
| `step` | number | `1` | Increment step |
| `disabled` | bool | `false` | Disable input |
| `required` | bool | `false` | Mark as required |
| `error` | string | `null` | Error message |

### ToggleInput

**File**: [ToggleInput.jsx](../src/components/ToggleInput.jsx)

Checkbox-styled toggle switch for boolean values.

**Props** (extends FormField props):
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | bool | — | Current toggle state |
| `onChange` | fn | — | `(bool) => void` callback |
| `disabled` | bool | `false` | Disable toggle |
| `required` | bool | `false` | Mark as required |

### Notification

**File**: [Notification.jsx](../src/components/Notification.jsx)

Floating notification banner for success, error, warning, and info messages.

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'info'` | One of `'success'`, `'error'`, `'warning'`, `'info'` |
| `message` | string | — | Notification text |
| `onClose` | fn | — | Callback when notification is dismissed |
| `autoClose` | bool | `true` | Auto-dismiss after `duration` |
| `duration` | number | `5000` | Auto-dismiss delay in ms |

**Icons by type**: ✅ success, ❌ error, ⚠️ warning, ℹ️ info

### SaveButton

**File**: [SaveButton.jsx](../src/components/SaveButton.jsx)

Save and reset button group for form pages.

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | fn | — | Save callback |
| `onReset` | fn | — | Reset callback (shown only when dirty) |
| `saving` | bool | `false` | Shows spinner + "Saving..." when true |
| `hasUnsavedChanges` | bool | `false` | Enables save button and shows reset button |
| `disabled` | bool | `false` | Force-disable save button |

**States**:
- **Idle (saved)**: Grayed-out "Save Changes" + "✓ All changes saved"
- **Dirty**: Enabled "Save Changes" + "Reset Changes" button
- **Saving**: Disabled button with spinner + "Saving..."
- **Disabled**: Grayed-out button (no interaction)

## Usage Pattern

Components follow a consistent pattern used throughout the Settings page:

```jsx
<TextInput
    label="Site Title"
    description="In a few words, explain what this site is about."
    value={settings.siteTitle}
    onChange={(value) => updateSetting('siteTitle', value)}
    placeholder="My Awesome Site"
    required
/>
```

All input components:
1. Accept `label`, `description`, `error`, `required` (from FormField)
2. Accept `value` and `onChange` for controlled component pattern
3. Wrap their native input in `<FormField>` for consistent layout
4. Use BEM-style CSS class naming (e.g., `helix-text-input`, `helix-select-input`)

## Missing Components

The following form components would be useful but are not yet built:

- [ ] **RichTextEditor** — WYSIWYG editor wrapper (for post content)
- [ ] **MediaPicker** — WordPress media library browser/uploader
- [ ] **PagePicker** — Dropdown of WordPress pages (for homepage/posts page selection)
- [ ] **CategoryPicker** — Category multi-select
- [ ] **ColorPicker** — Color input with preview
- [ ] **DateTimePicker** — Date + time selector
- [ ] **TagInput** — Tag/taxonomy multi-select with autocomplete
- [ ] **FileUpload** — Drag-and-drop file uploader
