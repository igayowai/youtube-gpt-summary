# ChatGPT Model Picker Follow-Up: 2026-09-10

- Result: all 15 visible model/effort combinations verified through actual Chrome UI interaction.
- Scope: user-requested model-menu testing after the earlier GPT summary reproduction. No prompt sent in this follow-up.
- Initial selection was Latest (최신) + High. Final selection restored and verified; composer empty and Temporary Chat active.
- Runtime files, extension settings, version, ZIPs, and Gemini were not changed.

## Evidence

The canonical [comparison matrix and exact outerHTML](C:/Users/USER/Documents/Claude/youtube_summary_GPT/docs/ui-dom-captures/chatgpt/new-chat/model-picker-2026-09-10/README.md) contains 42 fragments: 15 open effort menus, 15 closed composer pills, and 12 navigation/reset/restoration captures.

- Latest values 0..3 display effort only; latest Pro displays 6 Pro.
- GPT-5.6 Sol and GPT-5.5 display their version prefix at every effort.
- Each visible model choice exposes five efforts in this session.
- The successful reset test changed 5.6 중간 to latest-model 중간, preserving effort.
- Two 5.5 locator clicks and the first two reset activation attempts did not visibly change the selected state. Keyboard selection resolved 5.5; a fresh DOM-node click resolved reset. Do not classify these as model unavailability or a proven framework defect.

## Integration Implications

Model choice and reasoning effort are separate UI dimensions. Future extension fixes should distinguish them when interpreting the composer label and verify post-selection state. This test does not authorize adding a model-family setting or migrating legacy pro-basic/pro-extended preferences.

The earlier Extra High selection failure remains unfixed; this follow-up is diagnostic evidence, not a runtime fix or end-to-end regression pass. No additional response generation, English locale, GPTs, reload persistence, or Gemini test occurred.

Validation: recorded selected model radios, numeric slider values, accessibility announcements, closed composer labels, and restored state. Saved exact fragments were compared against the in-memory live captures. Existing runtime test results were not rerun or relabeled.
