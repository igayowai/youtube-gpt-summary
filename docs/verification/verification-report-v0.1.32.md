# Verification Report v0.1.32

Date: 2026-05-08 KST

## Scope

v0.1.32 moves the Options page `Save Settings` action above the contact and disclaimer area.

## Expected Behavior

- `Save Settings` appears after the settings sections.
- The contact line appears below `Save Settings`.
- The collapsed `면책 조항` disclosure appears below the contact line.
- Saving settings behavior is unchanged.

## Static Checks

- `node --check src/options/options.js`
- Manifest version and permission check.

## Manifest / Permission Check

- Manifest version: `0.1.32`
- Permissions: `storage`, `clipboardWrite`
- No `tabs` permission.
- No `<all_urls>` host permission.
