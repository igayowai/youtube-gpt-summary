# Verification Report v0.1.64

## Scope

This verification covers stale YouTube transcript prefetch cancellation for same-tab watch-page route changes.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.64`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

When a slow aggressive transcript prefetch is running and the same YouTube tab navigates to another video, the old prefetch should be marked stale and exit during its next polling/scroll checkpoint. The new video's prefetch should start under a fresh route epoch instead of waiting for the old video's DOM fallback to finish.
