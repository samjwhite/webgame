// Runs the real game code in Node with no browser and no installed packages.
// The page is replaced by small stand-ins; drawing goes to a canvas that only checks the art exists.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function pngSize(file) {
  const data = fs.readFileSync(file);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function fakeElement() {
  const element = {
    hidden: true,
    style: {},
    dataset: {},
    textContent: "",
    children: [],
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
    setAttribute() {},
    setPointerCapture() {},
    append(...items) {
      element.children.push(...items);
    },
    querySelector: () => fakeElement(),
    getContext: () => fakeCanvasContext(),
  };
  return element;
}

// Every canvas call does nothing, except that drawing a missing picture is an error.
function fakeCanvasContext() {
  const proxy = new Proxy(function canvasStub() {}, {
    get(target, key) {
      if (key === "drawImage") {
        return (image) => {
          if (!image || !image.width) throw new Error("Drew a picture that is not loaded");
        };
      }
      return proxy;
    },
    set: () => true,
    apply: () => proxy,
  });
  return proxy;
}

async function startGame({ search = "", width = 375, height = 812 } = {}) {
  const elements = {};
  const storage = {};
  const sandbox = {
    console,
    URLSearchParams,
    setTimeout,
    performance,
    location: { search },
    innerWidth: width,
    innerHeight: height,
    devicePixelRatio: 3,
    addEventListener() {},
    requestAnimationFrame() {},
    localStorage: {
      getItem: (key) => (key in storage ? storage[key] : null),
      setItem: (key, value) => {
        storage[key] = String(value);
      },
      removeItem: (key) => {
        delete storage[key];
      },
    },
    document: {
      title: "",
      documentElement: {},
      body: fakeElement(),
      getElementById: (id) => (elements[id] = elements[id] || fakeElement()),
      createElement: () => fakeElement(),
      querySelectorAll: () => [],
    },
    Image: class {
      set src(address) {
        const file = path.join(ROOT, address.split("?")[0]);
        try {
          Object.assign(this, pngSize(file));
          setImmediate(() => this.onload());
        } catch (error) {
          setImmediate(() => this.onerror(error));
        }
      }
    },
  };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);

  // Load the scripts the page itself lists, in its order, so a new file is picked up by itself.
  const page = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  for (const [, src] of page.matchAll(/<script src="([^"?]+)/g)) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, src), "utf8"), context, { filename: src });
  }
  vm.runInContext(fs.readFileSync(path.join(__dirname, "kit.js"), "utf8"), context, { filename: "tests/kit.js" });

  const inGame = (code, ...args) => {
    const call = `(${code})(...${JSON.stringify(args)})`;
    const result = vm.runInContext(`JSON.stringify(${call} ?? null)`, context);
    return JSON.parse(result);
  };

  for (let i = 0; i < 400 && !inGame("() => mode === 'title' && Boolean(ART.locYard)"); i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  return { inGame, storage, elements, sandbox };
}

module.exports = { startGame, ROOT };
