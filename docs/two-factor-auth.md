# Two-Factor Authentication

## Status: ❌ Not Implemented (Stub)

The Two-Factor Authentication feature exists as a placeholder component with no functional implementation. The README describes a planned TOTP-based 2FA architecture.

## Current State

### Component (Stub)

**File**: [src/pages/TwoFA/TwoFA.jsx](../src/pages/TwoFA/TwoFA.jsx)

```jsx
import React from 'react';
export default function TwoFA() {
    return <div>Two-Factor Authentication Setup</div>;
}
```

The component is **not mounted** anywhere in [App.jsx](../src/App.jsx) — there is no container ID check for a 2FA root element, no admin menu page registered for it, and no route defined.

## Planned Architecture (from README)

Per the README, Helix plans to implement:

- **TOTP-based 2FA** (Time-based One-Time Password) per RFC 6238
- **Per-user enable/disable** in user settings
- **Secrets stored in `user_meta`** (WordPress user metadata)
- **Validation at login** via `wp_login` action hook or custom middleware
- **Setup flow** with QR code for authenticator apps

## Implementation Plan

### Phase 1 — Backend Foundation

- [ ] Generate TOTP secrets per user (store in `user_meta`)
- [ ] TOTP code generation & validation library (PHP)
- [ ] REST API endpoints:
  - `GET /helix/v1/users/{id}/2fa` — check 2FA status
  - `POST /helix/v1/users/{id}/2fa/enable` — enable 2FA
  - `POST /helix/v1/users/{id}/2fa/disable` — disable 2FA
  - `POST /helix/v1/users/{id}/2fa/verify` — verify setup code
- [ ] Backup codes generation and storage
- [ ] `wp_login` filter to require 2FA code after password authentication

### Phase 2 — Frontend Setup UI

- [ ] 2FA settings tab in user profile
- [ ] Enable flow: show QR code + manual secret key
- [ ] Verify setup with a test code
- [ ] Disable flow with password confirmation
- [ ] Backup codes display and regeneration
- [ ] Recovery code support

### Phase 3 — Hardening

- [ ] Rate limiting on 2FA code attempts
- [ ] Brute force protection
- [ ] Remember-device option (trusted browser for N days)
- [ ] Admin-forced 2FA for specific roles
- [ ] Email fallback option
- [ ] WebAuthn / U2F support as alternative method

## Dependencies

### PHP
- A TOTP library (e.g., `spomky-labs/otphp` via Composer, or a custom implementation)
- QR code generation library (e.g., `endroid/qr-code`)

### JavaScript
- QR code display component (e.g., `qrcode.react`)
- Existing Helix component library (FormField, TextInput, Notification, SaveButton)

## Security Considerations

- **Secrets must be encrypted at rest** in `user_meta`, not stored in plaintext
- **HTTPS required** — TOTP setup should only be performed over secure connections
- **Backup codes** should be hashed before storage (like passwords)
- **Rate limiting** on verification endpoints to prevent brute-force attacks
- **Session binding** — 2FA verification should be bound to the specific login session
