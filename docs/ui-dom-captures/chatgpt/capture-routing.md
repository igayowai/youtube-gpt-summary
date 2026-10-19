# ChatGPT UI DOM Capture Routing

This directory stores reusable ChatGPT visible-UI evidence for the remaining consumer:

- the `youtube_summary_GPT` extension

Route captures by ChatGPT surface before using selector evidence:

- `new-chat/`: normal and Temporary Chat composer UI.
- `gpts/`: custom GPT conversation UI.

Do not merge selector assumptions across these folders. The two surfaces can expose different menu structures and labels at the same time.

Every capture must state its date, visible surface, capture type (`exact outerHTML` or `reduced sketch`), and observation date. A dated capture is evidence for that date only, never proof of what the UI looks like later. Live visible DOM checked at the time of work wins when it conflicts with stored evidence; record that check date with any conclusion.

Keep one project copy of each capture; use links from selector indexes instead of repeating outerHTML.
