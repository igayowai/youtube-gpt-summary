# UI DOM Captures

Claude: [2026-10-20 claude.ai new chat, model menu and incognito](claude/new-chat/2026-10-20.md) (reduced sketch; JSON copy is the test fixture).

Latest local evidence: [2026-10-19 ChatGPT, Gemini and YouTube observations](live-ui-2026-10-19.md) (reduced sketches; v0.1.103 mismatches listed). Previous: [2026-09-25 ChatGPT picker](chatgpt/new-chat/model-picker-2026-09-25.md).

This folder indexes UI DOM capture assets consumed by YouTube GPT Summary.

ChatGPT captures are maintained in this project's docs/ui-dom-captures/chatgpt/:

- [Shared ChatGPT capture routing](chatgpt/capture-routing.md)
- [Normal and Temporary Chat captures](chatgpt/new-chat/capture-index.md)
- [Custom GPT conversation captures](chatgpt/gpts/capture-index.md)

The extension currently automates the new-chat surface. GPTs captures remain available if GPTs support or diagnostics are needed later. Do not copy shared ChatGPT outerHTML back into this folder; keep only links and project-specific implementation notes.

The dated 2026-05 and 2026-06 ChatGPT files are historical selector evidence. A [2026-09-10 live slider capture](chatgpt/new-chat/chatgpt-reasoning-slider-2026-09-10.md) now records the new-chat UI and a complete five-step sweep. It does not establish GPTs or English-UI compatibility.

Project references and local integration notes:

- [Latest-only GPT consumer update, 2026-09-19](../verification/chatgpt-latest-only-2026-09-19.md): existing new-chat captures reused; old model rows are never selection targets. Latest checked state and effort are still verified; other consumers may continue to use all model evidence.

- [2026-09-19 live revalidation](../verification/live-revalidation-2026-09-19.md): GPT 15-state browser sweep, new GPT-5.5 label mismatch, Gemini menu changes, YouTube transcript loading failure.
- [2026-09-19 shared GPT capture](chatgpt/new-chat/model-picker-2026-09-19.md)
- [2026-09-19 Gemini and YouTube reduced captures](live-ui-2026-09-19.md)
- [GPT model/effort split consumer checkpoint, 2026-09-10](../verification/chatgpt-settings-split-2026-09-10.md): separate model-radio and effort-slider phases; checked state, active panels and final readback required. Pointer-first menu opening has a single Ctrl+Shift+M fallback with owned-menu confirmation. One real Latest/extra-high summary completed after Reload; pointer opening succeeded, leaving synthetic shortcut coverage unverified. No duplicate/new outerHTML.
- [GPT slider runtime patch and actual submission, 2026-09-10](../verification/chatgpt-slider-live-patch-2026-09-10.md)
- [ChatGPT model-version and reasoning display matrix, 2026-09-10](chatgpt/new-chat/model-picker-2026-09-10/README.md)
- [Model-picker integration test notes, 2026-09-10](../verification/chatgpt-model-picker-test-2026-09-10.md)
- [ChatGPT live test and slider incompatibility, 2026-09-10](../verification/chatgpt-live-test-2026-09-10.md)
- [ChatGPT English reasoning and Temporary Chat integration note, 2026-06-14](chatgpt-english-ui-2026-06-14.md)
- [ChatGPT reasoning menu integration note, 2026-06-01](chatgpt-reasoning-menu-2026-06-01.md)
- [Gemini Temporary Chat button, 2026-06-01](gemini-temporary-chat-button-2026-06-01.md)
- [Gemini model and thinking menu, 2026-05-31](gemini-model-thinking-menu-2026-05-31.md)
