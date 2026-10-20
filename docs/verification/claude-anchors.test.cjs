const assert = require("node:assert/strict");
const { test } = require("node:test");
const path = require("node:path");
const { createRuntime, exposeProvider, providerEnvironment } = require("./helpers/runtime.cjs");

// Fixture = the 2026-10-20 claude.ai capture itself, so the test and the evidence stay linked.
const capture = require(path.join(__dirname, "../ui-dom-captures/claude/new-chat/2026-10-20.json"));

// Minimal element + selector matcher: tag, [attr], [attr='v'], [attr^='v'], [attr*='v' i].
class FakeElement {
  constructor({ tag = "div", attrs = {}, text = "", children = [] } = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.innerText = text;
    this.textContent = text;
    this.children = children;
  }
  getAttribute(name) { return Object.hasOwn(this.attrs, name) ? this.attrs[name] : null; }
  hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
  get disabled() { return this.hasAttribute("disabled"); }
  descendants() { return this.children.flatMap((child) => [child, ...child.descendants()]); }
  querySelectorAll(selector) { return this.descendants().filter((element) => matchesSelector(element, selector)); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10 }; }
}

function matchesSelector(element, selector) {
  const tag = selector.match(/^[a-z]+/i)?.[0];
  if (tag && element.tagName !== tag.toUpperCase()) return false;
  for (const [, name, op, value, flag] of selector.matchAll(/\[([\w-]+)(?:([\^*]?=)'([^']*)'(?:\s+(i))?)?\]/g)) {
    const actual = element.getAttribute(name);
    if (actual === null) return false;
    if (!op) continue;
    const [left, right] = flag ? [actual.toLowerCase(), value.toLowerCase()] : [actual, value];
    if (op === "=" && left !== right) return false;
    if (op === "^=" && !left.startsWith(right)) return false;
    if (op === "*=" && !left.includes(right)) return false;
  }
  return true;
}

const element = (spec) => new FakeElement(spec);
const menuRows = (menu) => menu.rows.map((row) => element({
  attrs: { role: row.role, ...(row.checked ? { "aria-checked": row.checked } : {}), ...(row.popup ? { "aria-haspopup": row.popup } : {}) },
  text: row.text
}));
const pageRoot = (specs) => element({ children: specs.map(element) });

function api(rootElement = pageRoot(capture.newChat)) {
  const h = createRuntime();
  const env = providerEnvironment();
  env.document = rootElement;
  const exposed = exposeProvider(h, "claude", [
    "ANCHORS", "findAnchor", "findAllAnchors", "reportMissing", "pickRow", "readRowName", "rowMatches",
    "selectorShowsModel", "selectorShowsEffort"
  ], env);
  const model = (value) => h.context.YGS.CLAUDE_MODELS.find((item) => item.value === value);
  const effort = (value) => h.context.YGS.CLAUDE_EFFORTS.find((item) => item.value === value);
  return { ...exposed, model, effort, logs: h.logs };
}

test("2026-10-20 capture: composer, send button and model selector resolve by data-testid", () => {
  const a = api();
  assert.equal(a.findAnchor("composer").getAttribute("data-testid"), "chat-input");
  assert.equal(a.findAnchor("sendButton").getAttribute("data-testid"), "chat-input-send");
  assert.equal(a.findAnchor("modelSelector").getAttribute("data-testid"), "model-selector-dropdown");
});

test("incognito anchor exists only on the ?incognito page", () => {
  assert.equal(api().findAnchor("incognitoActive"), null);
  const incognito = api(pageRoot([...capture.newChat, ...capture.incognitoNewChat]));
  assert.equal(incognito.findAnchor("incognitoActive").getAttribute("data-testid"), "incognito-frame");
});

test("later candidates take over when data-testid disappears", () => {
  const stripped = capture.newChat.map((spec) => {
    const { "data-testid": _, ...attrs } = spec.attrs;
    return { ...spec, attrs };
  });
  const a = api(pageRoot(stripped));
  assert.equal(a.findAnchor("composer").getAttribute("data-cds"), "Editor");
  assert.equal(a.findAnchor("sendButton").getAttribute("aria-label"), "메시지 보내기");
  assert.equal(a.findAnchor("modelSelector").getAttribute("data-cds"), "ModelSelector");
});

test("a missing anchor returns null and logs one line naming every candidate tried", () => {
  const a = api(pageRoot([]));
  assert.equal(a.findAnchor("composer"), null);
  a.reportMissing("composer", "Claude composer not found");
  assert.equal(a.logs.length, 1);
  const line = a.logs[0].join(" ");
  for (const selector of a.ANCHORS.composer) assert.ok(line.includes(selector.replace(/'/g, "\\'")) || line.includes(selector), selector);
});

test("each model setting picks exactly its own row in the captured model menu", () => {
  const a = api();
  const rows = menuRows(capture.modelMenu);
  const radios = rows.filter((row) => row.getAttribute("role") === "menuitemradio");
  const expected = { fable: "Fable", opus: "Opus", sonnet: "Sonnet", haiku: "Haiku" };
  for (const [value, name] of Object.entries(expected)) {
    assert.ok(a.readRowName(a.pickRow(radios, a.model(value).matchers)).startsWith(name), value);
  }
  const effortRow = rows.find((row) => row.getAttribute("aria-haspopup") === "menu" && a.readRowName(row).startsWith("노력"));
  assert.ok(effortRow, "노력 submenu trigger present");
});

test("each effort setting picks exactly its own row, ignoring 추천 and usage badges", () => {
  const a = api();
  const radios = menuRows(capture.effortSubmenu);
  const expected = { low: "낮음", medium: "중간", high: "높음", extra: "엑스트라", max: "최대" };
  for (const [value, name] of Object.entries(expected)) {
    const row = a.pickRow(radios, a.effort(value).matchers);
    assert.equal(a.readRowName(row).split(" ")[0], name, value);
  }
});

test("selector label 'Opus 5.5 높음' confirms model and effort", () => {
  const a = api();
  const selector = a.findAnchor("modelSelector");
  assert.equal(a.selectorShowsModel(selector, a.model("opus")), true);
  assert.equal(a.selectorShowsModel(selector, a.model("sonnet")), false);
  assert.equal(a.selectorShowsEffort(selector, a.effort("high")), true);
  assert.equal(a.selectorShowsEffort(selector, a.effort("max")), false);
});

test("compact layout: the 노력 inline group is found by its label and model rows stay first", () => {
  const a = api();
  const groups = capture.compactModelMenu.groups.map((group) => element({
    attrs: { role: "group" },
    text: [group.label, ...group.rows.map((row) => row.text)].join("\n"),
    children: menuRows(group)
  }));
  const menu = element({ attrs: { ...capture.compactModelMenu.attrs }, children: groups });
  const effortGroup = a.findAllAnchors("menuGroup", menu).find((group) => a.rowMatches(group, ["exact:노력", "exact:effort"]));
  assert.ok(effortGroup, "노력 group");
  assert.equal(a.readRowName(a.pickRow(a.findAllAnchors("menuRadio", effortGroup), a.effort("max").matchers)).split(" ")[0], "최대");
  // Sonnet 5.5 in the main list comes before "Sonnet 5" under 더 많은 모델.
  assert.equal(a.readRowName(a.pickRow(a.findAllAnchors("menuRadio", menu), a.model("sonnet").matchers)), "Sonnet 5.5 간단한 작업에 가장 효율적");
});
