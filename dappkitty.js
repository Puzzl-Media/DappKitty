/**
 * Default DappKitty config for ease of development.
 * Note: No prod overrides, use productionUrl to disable DappKitty on production.
 */
const kittyConfig = {
  dev: {
    window: { API_URL: null },
    theme: { color: 'puzzl-light' },
    dapp: { logLevel: 'kitty' }
  },
  local: {
    window: { API_URL: null },
    theme: { color: 'puzzl-dark' },
    dapp: { logLevel: 'debug' }
  },
  expandIcon: '&#9660;',
  collapseIcon: '&#9650;',
  productionUrl: '',
  targets: {
    window: window,
    theme: window.DAPP_THEME ?? {},
    dapp: window.DAPP_CONFIG ?? {}
  }
};

let userConfig = {};

/**
 * Initialise DappKitty (LogKitty) with config.
 * Only starts LogKitty in 'dev' or 'local' mode, and disables if on productionUrl.
 */

function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function setUserConfig(overrides = {}) {
  const env = getDappKittyEnv();
  // Start with the static defaults for the current env
  const envOverrides = overrides[env] || overrides;
  userConfig = deepMerge(
    structuredClone(kittyConfig[env] || {}),
    envOverrides
  );
  // Add shared/static props (icons, targets, etc)
  userConfig.expandIcon = kittyConfig.expandIcon;
  userConfig.collapseIcon = kittyConfig.collapseIcon;
  userConfig.productionUrl = kittyConfig.productionUrl;
  userConfig.targets = kittyConfig.targets;
  userConfig.env = env;
  userConfig.logLevel = userConfig.dapp.logLevel || logLevel || 'debug';
}

export function dappKitty(logLevel, config) {
  setUserConfig(config);
  console.log(userConfig);

  // Disable DappKitty if on productionUrl
  if (window.location.origin === userConfig.productionUrl) return;
  if (userConfig.env !== 'dev' && userConfig.env !== 'local') return;

  injectLogKittyStyles();
  injectLogKittyPanel();

  applyDappKittyOverrides();
  patchConsoleForKitty();
  patchFetchForKitty();
  listenForKittyErrors();
  patchFetchForKitty();

  logKittyIntro();
}

// View logic: add expand/collapse button and structure for LogKitty
function createLogKittyView(logKittyEl) {
  const expandIcon = userConfig.expandIcon;
  const collapseIcon = userConfig.collapseIcon;

  // Create the scrollable content area
  const contentDiv = document.createElement('div');
  contentDiv.className = 'logKitty-content';
  logKittyEl.appendChild(contentDiv);

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'logKitty-toggle';
  toggleBtn.type = 'button';
  toggleBtn.innerHTML = expandIcon;
  toggleBtn.title = 'Expand/collapse log';
  toggleBtn.onclick = function () {
    logKittyEl.classList.toggle('collapsed');
    toggleBtn.innerHTML = logKittyEl.classList.contains('collapsed') ? collapseIcon : expandIcon;
  };
  logKittyEl.appendChild(toggleBtn);
}

// Inject #logKitty into the DOM right after <body>
function injectLogKittyPanel(options = {}) {
  if (!document.getElementById('logKitty')) {
    const logKittyEl = document.createElement('div');
    logKittyEl.id = 'logKitty';
    createLogKittyView(logKittyEl, options);

    if (document.body.firstChild) {
      document.body.insertBefore(logKittyEl, document.body.firstChild);
    } else {
      document.body.appendChild(logKittyEl);
    }
    logKittyEl.classList.add(userConfig.theme.color);
  }
}

// Inject default styles for LogKitty
function injectLogKittyStyles() {
  if (!document.getElementById('logKitty-styles')) {
    const style = document.createElement('style');
    style.id = 'logKitty-styles';
    style.textContent = logKittyStyles;
    document.head.appendChild(style);
  }
}

// Determine environment from URL params
function getDappKittyEnv() {
  const urlParams = new URLSearchParams(window.location.search);
  const envParam = urlParams.get('envkitty');
  if (envParam === 'local') return 'local';
  if (envParam === 'dev') return 'dev';
  return 'prod';
}

// Apply overrides to targets using a resolver
function applyDappKittyOverrides() {
  const targets = userConfig.targets || {};
  for (const key in targets) {
    if (userConfig[key]) {
      Object.assign(targets[key], userConfig[key]);
    } else {
      logKitty(`No override found for target: ${key}`, 'debug');
    }
  }
}

let logKitty = function(message, level = "debug") {
    // Always reference the resolved config
  const logLevel = userConfig.logLevel;

  // Only print if allowed by logLevel
  if (logLevel === "info" && level !== "info") return;
  if (logLevel === "kitty" && !logKitty._directCall) return;

  const logKittyEl = document.getElementById('logKitty');
  const contentDiv = logKittyEl ? logKittyEl.querySelector('.logKitty-content') : null;
  let prefix = "";
  let cssClass = "logKitty-line";
  switch (level) {
    case "error":
      prefix = "[ERROR] ";
      cssClass += " logKitty-error";
      break;
    case "warn":
      prefix = "[WARN] ";
      cssClass += " logKitty-warn";
      break;
    case "debug":
      prefix = "[DEBUG] ";
      cssClass += " logKitty-debug";
      break;
    default:
      prefix = "[INFO] ";
      cssClass += " logKitty-info";
  }
  if (contentDiv) {
    const line = document.createElement("div");
    line.className = cssClass;
    line.textContent = prefix + message;
    contentDiv.appendChild(line);
    contentDiv.scrollTop = contentDiv.scrollHeight;
  }
};

// Helper to mark direct logKitty calls
function directKitty(fn) {
  return function (...args) {
    logKitty._directCall = true;
    fn.apply(null, args);
    logKitty._directCall = false;
  };
}

const _logKitty = logKitty;
const wrappedKitty = directKitty(_logKitty);

// Redefine logKitty methods to mark as direct calls
wrappedKitty.error = directKitty(function(message) {
  wrappedKitty(message, "error");
});
wrappedKitty.warn = directKitty(function(message) {
  wrappedKitty(message, "warn");
});
wrappedKitty.info = directKitty(function(message) {
  wrappedKitty(message, "info");
});
wrappedKitty.debug = directKitty(function(message) {
  wrappedKitty(message, "debug");
});

logKitty = wrappedKitty;
window.logKitty = logKitty;

// Patch the console methods to also log to logKitty, and listen for all console messages
function patchConsoleForKitty() {
  ["log", "error", "warn", "debug", "info"].forEach(method => {
    const original = console[method];
    console[method] = function (...args) {
      original.apply(console, args);
      try {
        // Join all arguments into a string, JSON-stringify objects
        const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
        // Use logKitty's matching method if available, otherwise fallback to logKitty
        // Mark as not a direct call so logLevel logic works
        logKitty._directCall = false;
        if (typeof logKitty[method] === "function") {
          logKitty[method](msg);
        } else {
          logKitty(msg, method);
        }
      } catch (e) {
        original.call(console, "[logKitty failed]", e);
      }
    };
  });
}

// Patch fetch to log API calls and errors to LogKitty (only in dev/local and if interceptConsole is true)
function patchFetchForKitty() {
  if (!window.fetch || window.fetch.__kittyPatched) return;
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    let method = "GET";
    let url = "";

    if (typeof args[0] === "string") {
      url = args[0];
      if (args[1] && args[1].method) method = args[1].method.toUpperCase();
    } else if (args[0] && args[0].url) {
      url = args[0].url;
      if (args[0].method) method = args[0].method.toUpperCase();
    }

    let formattedUrl = url;
    try {
      const parsed = new URL(url, window.location.origin);
      formattedUrl = `${parsed.origin}${parsed.pathname}`;
    } catch (e) {}

    logKitty.info(`[fetch] ${method} ${formattedUrl}`);

    return originalFetch.apply(this, args)
      .then(response => {
        let resUrl = response.url;
        try {
          const parsed = new URL(resUrl, window.location.origin);
          resUrl = `${parsed.origin}${parsed.pathname}`;
        } catch (e) {}
        logKitty.debug(`[fetch] Response: ${response.status} ${response.statusText} for ${resUrl}`);
        return response;
      })
      .catch(error => {
        logKitty.error(`[fetch] Error: ${error} for ${method} ${formattedUrl}`);
        throw error;
      });
  };
  window.fetch.__kittyPatched = true;
}

// Listen for uncaught errors and unhandled promise rejections
function listenForKittyErrors() {
  window.addEventListener('error', function(event) {
    logKitty.error(`[window.error] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
  });

  window.addEventListener('unhandledrejection', function(event) {
    logKitty.error(`[unhandledrejection] ${event.reason}`);
  });
}

/**
 * Print an intro message and mascot to LogKitty.
 */
function logKittyIntro() {
  const logKittyEl = document.getElementById('logKitty');
  if (!logKittyEl) return;
  const contentDiv = logKittyEl.querySelector('.logKitty-content');
  if (!contentDiv) return;
  const catWrapper = document.createElement('div');
  catWrapper.id = 'dappkitty-cat';
  catWrapper.innerHTML = `
<pre>
Log Kitty Started!

Environment: ${userConfig.env}
Log Level: ${userConfig.logLevel}
Theme: ${userConfig.theme.color}

      /\\_/\\
     ( o.o )
      > ^ <
This cat's got your back.
</pre>`;
  contentDiv.appendChild(catWrapper);
}

/* === LogKitty STYLES: Command Line Developer Log === */
const logKittyStyles = `
/* --- LogKitty: Command Line Developer Log --- */
#logKitty {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100vw;
  min-height: 2.5em;
  max-height: 40vh;
  background: var(--logkitty-bg);
  color: var(--logkitty-fg);
  font-family: 'Fira Mono', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 1.02em;
  line-height: 1.6;
  border-top: 2px solid var(--logkitty-border);
  box-shadow: 0 -2px 12px var(--logkitty-shadow);
  padding: 1em 1.2em 1em 1.2em;
  margin: 0;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  z-index: 99999;
  position: fixed;
  letter-spacing: 0.03em;
  transition: min-height 0.2s, max-height 0.2s, padding 0.2s, background 0.2s, color 0.2s;
}
.logKitty-content {
  flex: 1 1 auto;
  overflow-y: auto;
  width: 100%;
}
#logKitty.collapsed {
  min-height: 0;
  max-height: 2.5em;
  overflow-y: hidden;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
  padding-left: 1.2em;
  padding-right: 1.2em;
}
#logKitty #logKitty-toggle {
  position: absolute;
  top: 0.5em;
  right: 1.2em;
  background: var(--logkitty-toggle-bg);
  color: var(--logkitty-fg);
  border: none;
  border-radius: 3px;
  font-size: 1.1em;
  cursor: pointer;
  z-index: 100000;
  padding: 0.1em 0.5em;
  transition: background 0.2s;
}
#logKitty #logKitty-toggle:hover {
  background: var(--logkitty-toggle-hover);
}
#logKitty .logKitty-line {
  display: block;
  padding: 0.1em 0;
  border-left: 3px solid #20c964;
  margin-left: 0.2em;
  margin-bottom: 0.1em;
  padding-left: 0.7em;
  font-size: 1em;
  background: transparent;
}
#logKitty .logKitty-error {
  color: var(--logkitty-error);
  background: var(--logkitty-error-bg);
  border-left: 3px solid var(--logkitty-error);
}
#logKitty .logKitty-info {
  color: var(--logkitty-info);
  border-left: 3px solid var(--logkitty-info);
}
#logKitty .logKitty-warn {
  color: var(--logkitty-warn);
  background: var(--logkitty-warn-bg);
  border-left: 3px solid var(--logkitty-warn);
}
#logKitty .logKitty-debug {
  color: var(--logkitty-debug);
  opacity: 0.7;
  border-left: 3px solid var(--logkitty-debug);
}
#logKitty .logKitty-timestamp {
  color: var(--logkitty-timestamp);
  font-size: 0.92em;
  margin-right: 0.7em;
  opacity: 0.7;
}

/* Puzzl Brand Theme (c) 2025 */

/* Light mode */
#logKitty.puzzl-light {
  --logkitty-bg: #fdfdfd;
  --logkitty-fg: #0b1622;
  --logkitty-border: #20C9D2;
  --logkitty-shadow: #0001;
  --logkitty-error: #F26430; /* Puzzl orange */
  --logkitty-error-bg: #fff0ea;
  --logkitty-info: #20C9D2; /* Puzzl teal */
  --logkitty-info-bg: #e5fafd;
  --logkitty-warn: #FFD464; /* Puzzl yellow */
  --logkitty-warn-bg: #fffbe6;
  --logkitty-debug: #445f63;
  --logkitty-debug-bg: #eef6f7;
  --logkitty-timestamp: #4caab7;
  --logkitty-toggle-bg: #e0e0e0;
  --logkitty-toggle-hover: #d0d0d0;
}
/* Dark mode */
#logKitty.puzzl-dark {
  --logkitty-bg: #0b1622;
  --logkitty-fg: #e6f7ff;
  --logkitty-border: #20C9D2;
  --logkitty-shadow: #0008;
  --logkitty-error: #F26430; /* Puzzl orange */
  --logkitty-error-bg: #3b1d14;
  --logkitty-info: #20C9D2; /* Puzzl teal */
  --logkitty-info-bg: #102f32;
  --logkitty-warn: #FFD464; /* Puzzl yellow */
  --logkitty-warn-bg: #3b340e;
  --logkitty-debug: #a6c5cb;
  --logkitty-debug-bg: #1b2b2c;
  --logkitty-timestamp: #88c2cc;
  --logkitty-toggle-bg: #1a1f1f;
  --logkitty-toggle-hover: #2a2f2f;
}

@media (max-width: 700px) {
  #logKitty {
    font-size: 0.93em;
    padding: 0.7em 0.3em 0.7em 0.6em;
    max-height: 40vh;
  }
}
`;
export { logKitty };
