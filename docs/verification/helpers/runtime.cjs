const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../../..");
const readSource = (file) => fs.readFileSync(path.join(root, file), "utf8");
const plain = (value) => structuredClone(value);

function memoryStorage(initial = {}) {
  const data = plain(initial);
  return {
    data,
    async get(keys) {
      if (keys == null) return plain(data);
      const names = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      const defaults = typeof keys === "object" && !Array.isArray(keys) ? keys : {};
      return plain(Object.fromEntries(names.filter((key) => Object.hasOwn(data, key) || Object.hasOwn(defaults, key)).map((key) => [
        key, Object.hasOwn(data, key) ? data[key] : defaults[key]
      ])));
    },
    async set(values) { Object.assign(data, plain(values)); },
    async remove(keys) { for (const key of [].concat(keys)) delete data[key]; }
  };
}

function createRuntime({ settings = {}, shared = true } = {}) {
  const local = memoryStorage(settings);
  const session = memoryStorage();
  const timers = new Map();
  const openedTabs = [];
  const logs = [];
  let timerId = 0;
  const context = vm.createContext({
    URL, URLSearchParams, Date,
    crypto: require("node:crypto").webcrypto,
    console: {
      info: (...args) => logs.push(args),
      warn: (...args) => logs.push(args)
    },
    setTimeout(callback, ms) {
      timers.set(++timerId, { callback, ms });
      return timerId;
    },
    clearTimeout(id) { timers.delete(id); },
    chrome: {
      storage: { local, session },
      runtime: { onMessage: { addListener() {} } },
      tabs: {
        async create(properties) {
          openedTabs.push(plain(properties));
          return { id: openedTabs.length };
        },
        async get() { return null; }
      }
    }
  });
  const load = (file) => vm.runInContext(readSource(file), context, { filename: file, timeout: 1000 });
  context.importScripts = (...files) => {
    for (const file of files) load(path.join("src/background", file));
  };
  if (shared) {
    for (const file of ["constants", "logger", "promptBuilder", "transcriptFormat", "storage"]) {
      load(`src/shared/${file}.js`);
    }
  }
  return { context, local, session, timers, openedTabs, logs, load };
}

function exposeProvider(runtime, provider, names, environment = {}) {
  Object.assign(runtime.context, environment);
  const source = readSource(`src/content/${provider}.js`);
  const marker = "  main().catch((error) => {";
  if (source.split(marker).length !== 2) throw new Error(`Cannot isolate ${provider} main()`);
  // Test-only exports and startup suppression, never written into extension source.
  const isolated = source.replace(marker, `  globalThis.__test = { ${names.join(", ")} }; return;\n${marker}`);
  vm.runInContext(isolated, runtime.context, { filename: `${provider}.test-vm.js`, timeout: 1000 });
  return runtime.context.__test;
}

class Button {
  constructor() { this.tagName = "BUTTON"; this.events = []; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 40, height: 40 }; }
  getAttribute(name) { return name === "aria-label" ? "Temporary Chat" : null; }
  hasAttribute() { return false; }
  querySelectorAll() { return []; }
  querySelector() { return null; }
  closest() { return null; }
  matches() { return false; }
  focus() {}
  scrollIntoView() {}
  dispatchEvent(event) { this.events.push(event.type); return true; }
  click() { this.events.push("native-click"); }
}

class TestEvent {
  constructor(type) { this.type = type; }
}

function providerEnvironment(bodyText = "") {
  return {
    HTMLElement: Button, HTMLInputElement: Button, HTMLTextAreaElement: Button,
    PointerEvent: TestEvent, MouseEvent: TestEvent, KeyboardEvent: TestEvent,
    getComputedStyle() { return { display: "block", visibility: "visible" }; },
    location: { search: "", hash: "", href: "https://example.test/" },
    document: {
      querySelector() { return null; }, querySelectorAll() { return []; },
      body: { innerText: bodyText }
    }
  };
}

module.exports = { root, readSource, plain, createRuntime, exposeProvider, Button, providerEnvironment };
