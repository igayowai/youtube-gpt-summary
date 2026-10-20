# ChatGPT Settings Split: Approval Proposal

Status update, 2026-09-10: user approved with `진행`; implementation and local checks complete, real loaded-extension checks pending Reload. See the [implementation checkpoint](chatgpt-settings-split-2026-09-10.md). The original proposal and gate evidence below are preserved as history; this document is not a standing rule.

## MVP / Understanding Report

- User problem / task goal: distinguish model family from reasoning effort in extension settings; replace obsolete Pro variants with one Pro.
- Main validation target: saved model and effort both reach the actual ChatGPT UI before the existing summary send.
- MVP actions: select model; select effort; save; run the existing YouTube GPT summary action; inspect the selected UI values/result.
- Models: Latest (default), GPT-5.6 Sol, GPT-5.5, based on the canonical same-day visible-menu capture. Latest means actively select the Latest radio, not preserve an arbitrary previous model.
- Efforts: No selection (preserve current effort), Instant, Medium, High, Extra High, Pro. Preserve existing non-Pro effort preferences. No selection remains the effort default; user requested changing only the model default.
- Storage proposal: add unambiguous model-family and reasoning-effort keys. Read old chatgptModel as legacy effort only when the new effort key is absent. Interpret old Pro Basic/Extended as the single new Pro, per the requested UI consolidation; preserve the old stored field instead of overwriting/deleting it.
- Runtime: model selection and checked-radio verification first, effort selection second, then recheck both. Missing/unavailable choice or ambiguous UI stops injection/send, without silently substituting another model.
- Minimum change set: Options HTML/JS, shared constants/normalization/pending request, YouTube/background request plumbing, ChatGPT menu selection, focused tests and consumer notes. No new dependency, permission, service or runtime.
- Completion criteria: local regressions including old/new settings, pending payload and Pro; settings save/reopen UI check; actual three-model selection and five-effort readbacks on the empty test surface; one public-video summary submission. Actual browser tests require the reloaded extension. Restore test-only preferences after verification.
- Rollback / recovery: preserve pre-edit dirty source files before patching. Keep legacy stored effort unchanged, use additive new keys, and leave unrelated settings intact. Reverting this patch to those copies makes old code consume its original field again; new keys are ignored by old code. Do not reset extension storage or uninstall it.
- Non-goals / Must not include now: Gemini, GPTs, background model discovery, automatic model-list storage, unknown models, backend/API overrides, full transcript/result archiving, unrelated TODO repairs, ZIP.
- Assumptions / unknowns: initial dropdown is a patch-maintained list of observed models, not a continuously scraping discovery service. Availability is revalidated at use time. Future UI or account differences can make an observed choice unavailable.
- Deferred: automatic model discovery and release packaging; no implicit approval.
- User approval needed: YES, for this specific settings/storage/runtime change set and bounded UI verification. No implementation until approval after this report.

## Existing-Tool Gate

User problem / task goal: the same settings-to-ChatGPT model/effort flow, not replacement of the extension or a new automation product.

Discovery coverage:
- User wording: `ChatGPT 확장프로그램 모델 선택 추론 강도 설정 분리`.
- Local synonyms: `ChatGPT 모델 자동 선택 드롭다운 크롬 확장`.
- Implementation types: `ChatGPT model selector extension GitHub reasoning effort`.
- Platform/primitives: `ChatGPT model selection extension chrome.storage options JavaScript select migration`.
- Source qualifiers: `Chrome extension options storage migration official docs GitHub`.
- Counterevidence: `ChatGPT model selector extension security issue deprecated`.
- Follow-ups: `ChatGPT Tuner extension GitHub model selector source`; `ChatGPT Tuner extension model selector broken security`; `"ChatGPT Tuner" "slider" "reasoning"`; `"ChatGPT" "data-model-reasoning-effort-slider" extension`; `"chatgpt-model-switcher" "latest" "GPT-5.6"`; `"codex-chatgpt-web" "Chrome extension" "options" model`.
- Opened/read 19 distinct relevant local documents, source examples and product documents below. Six source families; more than three independent authors/repositories/domains. Duplicate URLs/language variants and search snippets are not counted. Unrelated database tuners, research papers, general AI products, and duplicate store-promotion posts excluded at discovery. One options-page fetch timed out and is not counted.
- Saturation: later product/version and platform queries stayed within the same recurring patterns: native extension storage, userscript UI interaction, independent browser orchestration, or unrelated API clients. The additional control repository is another standalone browser-orchestration pattern, not a drop-in extension settings implementation. No materially different pattern meets this project's full flow without adaptation.

Evidence ledger (paths are authoritative local sources; web sources were read, not installed):
1. [storage.js](../../src/shared/storage.js#L15) — project evidence: normalization, legacy Pro aliases, get/save wrappers.
2. [constants.js](../../src/shared/constants.js#L219) — project evidence: current effort-only list and obsolete Pro variants.
3. [options.js](../../src/options/options.js#L21) — project evidence: existing select renderer and save/load fields.
4. [options.html](../../src/options/options.html#L50) — project evidence: one GPT reasoning select.
5. [Canonical matrix](../ui-dom-captures/chatgpt/new-chat/model-picker-2026-09-10/README.md) — project evidence: three observed radios, five positions and actual labels.
6. [Chrome storage](https://developer.chrome.com/docs/extensions/reference/api/storage) — official product/service docs: asynchronous local get/set; existing extension contexts supported.
7. [OpenAI terms](https://openai.com/policies/terms-of-use/) — official product/service docs: automated extraction and restriction-bypass cautions.
8. [extend-chrome/storage](https://github.com/extend-chrome/storage) — source repo/mature OSS: Promise/bucket wrapper and composed setters; no ChatGPT-specific selection or legacy mapping.
9. [pi-model-selector-x](https://github.com/Dwsy/pi-model-selector-x) — source repo/mature OSS: pi model metadata UI, not a Chrome content-script consumer.
10. [dsh-reasoning-effort](https://github.com/byxumi/dsh-reasoning-effort) — source repo/mature OSS: DSH plugin/provider effort control; different host.
11. [VS Code model docs](https://github.com/microsoft/vscode-docs/blob/main/docs/agent-customization/language-models.md) — source repo/mature OSS: provider/API model configuration, different execution surface.
12. [codex-chatgpt-control](https://github.com/adamallcock/codex-chatgpt-control/blob/main/README.md) — source repo/mature OSS: signed-in browser orchestration; additional setup rather than extension-internal settings.
13. [SpaceSaver selector](https://gist.github.com/SpaceSaver/2be3bb2359040c7ac5fe9c6538864d42) — community example/blog/forum/gist: fetch-body model override and page storage; excluded, different trust/transport behavior.
14. [ChatGPT multiple models](https://greasyfork.org/en/scripts/547325-chatgpt%E5%A4%9A%E6%A8%A1%E5%9E%8B%E9%80%89%E6%8B%A9/code) — community example/blog/forum/gist: old model-switcher dropdown and hardcoded legacy identifiers; not current observed surface.
15. [ChatGPT Model Switcher](https://greasyfork.org/ug/scripts/586428-chatgpt-model-switcher/code) — community example/blog/forum/gist: visible Power menu item, pointer/key sequences and slider readback; locale assumptions and limited effort route need adaptation.
16. [Read Aloud Speedster](https://greasyfork.org/el/scripts/530118-read-aloud-speedster/code) — community example/blog/forum/gist: endpoint tick selection amid unrelated features; not model/effort settings separation.
17. [Quick Model Intelligence Switcher](https://greasyfork.org/pt-BR/scripts/586682-chatgpt-quick-model-itelligence-switcher/code) — community example/blog/forum/gist: separate page widget, English labels, own storage and GPL code; not copied.
18. [ChatGPT Tuner listing](https://chromewebstore.google.com/detail/chatgpt-tuner-your-chatgp/mamodndnicbkfhlabelngeongpadagaf?hl=en-US) — package registry/release record: separate extension, 0.0.5 dated July 2025, no proof of current captured slider compatibility.
19. [Popover failure issue](https://github.com/miuuyy/codex-chatgpt-web/issues/268) — issue/discussion: owned popover/slider versus radio distinction and fail-closed activation evidence.

Source-family distribution: project evidence 5; official product/service docs 2; source repo/mature OSS 5; community example/blog/forum/gist 5; package registry/release record 1; issue/discussion 1. Total 19, six distinct families. Family label denotes evidence type, not an endorsement of every repository's maturity.

Validation pass / Existing candidates considered:
- Existing native storage/select helpers: suitable MV3 primitives, no new installation/permission; safe local rollback. They do not supply new task-specific model selection/mapping. BUILD_MINIMAL candidate within this repository.
- extend-chrome/storage: native Chrome wrapper is documented; recent maintenance not independently established. Extra package/bucket semantics add maintenance without providing the requested target behavior. Avoid adoption; no installation or data changes performed.
- UI userscripts/Tuner: authors' code/store descriptions confirm different UI assumptions or independent widgets. Current account compatibility and broader safety are unverified; extra installation and rollback burden. Prior-art evidence only, not adopted.
- API/DSH/pi/VS Code/browser-orchestration alternatives: different execution environment and setup; do not fulfill the existing extension's Options-to-pending-to-content-script contract. Excluded, not installed.
- Backend override: source changes conversation transport rather than selecting the available UI. Excluded without executing, reading authentication state or creating that trust boundary.

Baseline vs discovered examples: baseline is two native selects, additive compatible settings, model-first then effort with selected-state readback. Discovery corroborates pointer/key/readback as a pattern but supplies no drop-in implementation of this project's settings/pending contract. Reusing current tested helpers is narrower than adding a userscript host, API client or browser service.

Evidence limits: external candidates were inspected, not executed or fully security-audited. One Chrome options-page fetch timed out; local Options implementation and storage API documentation were available. Same-day canonical UI evidence is account/surface-specific, not universal availability proof.

Policy / terms warning: OpenAI terms restrict automated extraction and bypass of protections. No legal-compliance conclusion made. This proposal is not a crawler, output exporter or backend override; no new result extraction, login-state access or restriction bypass proposed. Terms warning kept separate from technical suitability. robots.txt was not assessed as this is not a crawling proposal.

Safety / rollback impact: do not change authentication, permissions or unrelated settings. Persist new preferences only through the existing explicit Save flow. Preserve legacy field so rolling source back keeps prior preferences. Missing choices stop before sending; user may select Latest or an available effort and retry.

Storage / overwrite test: create-new model/effort keys, subsequently overwrite only those preferences on explicit Save; read-time compatibility mapping does not rewrite/delete the original chatgptModel field. Existing project files receive scoped edits after pre-edit copies are created. No real browser storage read/write in this proposal phase. Test mapping first with dummy objects, including null/unknown/new-key precedence and failed saves.

Approval impact: this is a read-only investigation and proposed change; runtime/settings implementation and bounded browser verification need the user's follow-up approval.

Decision boundary test: new target-specific model-radio selection, Pro normalization and model/effort request mapping are custom core behavior. Native Chrome APIs are primitives, not a ready-made solution; classification is not WRAP_EXISTING.

Wrapper safety test: N/A; not proposing an orchestration-only wrapper around an existing complete implementation.

Direct implementation test:
1. Existing helpers lack separate model state and selection; external candidates do not match the pending-request contract or current verified surface without adaptation.
2. Without this change, users cannot choose model and effort independently, or select the current single Pro through Options.
3. One existing settings-to-summary flow across existing modules; no new subsystem/dependency/permission.
4. Preserve legacy settings and pre-edit source; fail closed on selection errors; restore files and reload for rollback.
5. Dummy-state regressions, request plumbing tests, settings save/reopen check and bounded real UI verification.
6. User explanation: choose a model and reasoning level, save, then summarize as before.
7. Yes; omitting the split leaves the explicitly requested independent selection unavailable.

Scope-review route needed: NO. This is the newly requested scope, with additive reversible settings and no auth-state handling or extra system. Excluded backend/service alternatives are not proposed for implementation.

Decision readiness checklist: query family coverage PASS; body/code inspection count PASS (19); evidence ledger consistency PASS; source-family distribution consistency PASS; source diversity PASS; baseline comparison PASS; validation/counterevidence PASS; policy-warning separation PASS; storage/rollback consistency PASS; decision-boundary classification PASS; saturation PASS (no materially different drop-in pattern in follow-ups).

Reason: preserve this extension's verified flow and storage primitives; implement only the missing model/effort contract and visible selection logic.

Tentative decision: BUILD_MINIMAL, pending user approval for implementation.

Decision: BUILD_MINIMAL
