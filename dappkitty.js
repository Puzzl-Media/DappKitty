let kittyConfig = null;

/**
 * Default DappKitty config for ease of development.
 * Note: No prod overrides, use productionUrl to disable DappKitty on production.
 */
const defaultDappKittyConfig = {
  envs: {
    dev: {
      window: { API_URL: null },
      theme: { color: 'light' },
      dapp: { logLevel: 'kitty' } // Only direct logKitty calls
    },
    local: {
      window: { API_URL: null },
      theme: { color: 'dark' },
      dapp: { logLevel: 'debug' } // Print everything
    }
  },
  targets: {
    window: window,
    theme: window.DAPP_THEME ?? {},
    dapp: window.DAPP_CONFIG ?? {}
  },
  expandIcon: '&#9660;',
  collapseIcon: '&#9650;',
  productionUrl: '',
};

/**
 * Initialise DappKitty (LogKitty) with config.
 * Only starts LogKitty in 'dev' or 'local' mode, and disables if on productionUrl.
 */

export function initDappKitty(logLevelOrConfig, config) {
  const env = getDappKittyEnv();
  if (env !== 'dev' && env !== 'local') {
    return;
  }

  let logLevelOverride;
  let userConfig = config;

  // Support: initDappKitty('debug') or initDappKitty({ ... })
  if (typeof logLevelOrConfig === 'string') {
    logLevelOverride = logLevelOrConfig;
  } else if (typeof logLevelOrConfig === 'object' && logLevelOrConfig !== null) {
    userConfig = logLevelOrConfig;
  }

  // Merge config sources
  kittyConfig = {
    env,
    logLevel: logLevelOverride
      || (userConfig && userConfig.logLevel)
      || (window.DAPP_CONFIG && window.DAPP_CONFIG.logLevel)
      || (userConfig && userConfig.envs && userConfig.envs[env] && userConfig.envs[env].dapp && userConfig.envs[env].dapp.logLevel)
      || (defaultDappKittyConfig.envs[env] && defaultDappKittyConfig.envs[env].dapp && defaultDappKittyConfig.envs[env].dapp.logLevel)
      || "kitty",
    targets: (userConfig && userConfig.targets) || defaultDappKittyConfig.targets,
    expandIcon: (userConfig && userConfig.expandIcon) || defaultDappKittyConfig.expandIcon,
    collapseIcon: (userConfig && userConfig.collapseIcon) || defaultDappKittyConfig.collapseIcon,
    productionUrl: (userConfig && userConfig.productionUrl) || defaultDappKittyConfig.productionUrl,
    envConfig: (userConfig && userConfig.envs && userConfig.envs[env]) || defaultDappKittyConfig.envs[env]
  };

  // Disable DappKitty if on productionUrl
  if (window.location.origin === kittyConfig.productionUrl) return;
  if (env !== 'dev' && env !== 'local') return;

  injectLogKittyStyles();
  injectLogKittyPanel({ expandIcon: kittyConfig.expandIcon, collapseIcon: kittyConfig.collapseIcon });
  applyDappKittyOverrides(kittyConfig.envConfig, kittyConfig.targets);

  logKittyIntro();

  // Log API_URL if present
  if (kittyConfig.targets.window && kittyConfig.targets.window.API_URL) {
    logKitty(`${env.charAt(0).toUpperCase() + env.slice(1)} mode active: API_URL set to ${kittyConfig.targets.window.API_URL}`);
  }

  patchConsoleForKitty();
  patchFetchForKitty();
  listenForKittyErrors();
  patchFetchForKitty();
}

// View logic: add expand/collapse button and structure for LogKitty
function createLogKittyView(logKittyEl, options = {}) {
  const expandIcon = options.expandIcon !== undefined ? options.expandIcon : defaultDappKittyConfig.expandIcon;
  const collapseIcon = options.collapseIcon !== undefined ? options.collapseIcon : defaultDappKittyConfig.collapseIcon;

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

    // Apply theme class based on config, after adding to DOM
    const theme = (kittyConfig && kittyConfig.targets && kittyConfig.targets.theme && kittyConfig.targets.theme.color)
      ? kittyConfig.targets.theme.color
      : null;
    if (theme === 'light') {
      logKittyEl.classList.add('logKitty-light');
      console.log('Added logKitty-light class:', logKittyEl.className);
    } else {
      logKittyEl.classList.remove('logKitty-light');
      console.log('Removed logKitty-light class:', logKittyEl.className);
    }

    logKitty.error(`Theme: ${theme}`);
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
function applyDappKittyOverrides(envConfig, targets) {
  for (const key in envConfig) {
    if (targets[key]) {
      Object.assign(targets[key], envConfig[key]);
    } else {
      logKitty(`No known target for config key: ${key}`, 'warn');
    }
  }
}

let logKitty = function(message, level = "info") {
    // Always reference the resolved config
  const logLevel = kittyConfig ? kittyConfig.logLevel : "kitty";

  // Only print if allowed by logLevel
  if (logLevel === "info" && level !== "info") return;
  if (logLevel === "kitty" && !logKitty._directCall) return;

  const logKittyEl = document.getElementById('logKitty');
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
  if (logKittyEl) {
    const line = document.createElement("div");
    line.className = cssClass;
    line.textContent = prefix + message;
    logKittyEl.appendChild(line);
    logKittyEl.scrollTop = logKittyEl.scrollHeight;
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
  const catWrapper = document.createElement('div');
  catWrapper.id = 'dappkitty-cat';
  catWrapper.innerHTML = `
<pre>
      /\\_/\\
     ( o.o )
      > ^ <
Log Kitty - Meow
Welcome to Log Kitty. This cat's got your back.

</pre>`;

  logKittyEl.appendChild(catWrapper);
}

/* === LogKitty STYLES: Command Line Developer Log === */
const logKittyStyles = `
/* --- LogKitty: Command Line Developer Log --- */
#logKitty {
  --logkitty-bg: #181c18;
  --logkitty-fg: #b4ed74;
  --logkitty-border: #274c10;
  --logkitty-shadow: #000a;
  --logkitty-error: #ffd900;
  --logkitty-error-bg: #2a1c1c;
  --logkitty-info: #8bc47e;
  --logkitty-warn: #ffe800;
  --logkitty-warn-bg: #2a2a1c;
  --logkitty-debug: #b4ed74;
  --logkitty-timestamp: #6a8f5c;
  --logkitty-toggle-bg: #232823;
  --logkitty-toggle-hover: #2c3c2c;

  display: flex;
  flex-direction: column;
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
  top: 0.3em;
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

/* Light mode */
#logKitty.logKitty-light {
  --logkitty-bg: #f8f8f8;
  --logkitty-fg: #2a3c1c;
  --logkitty-border: #b4ed74;
  --logkitty-shadow: #0002;
  --logkitty-error: #b80000;
  --logkitty-error-bg: #fff3e0;
  --logkitty-info: #2a7c2a;
  --logkitty-warn: #b88600;
  --logkitty-warn-bg: #fffbe0;
  --logkitty-debug: #2a3c1c;
  --logkitty-timestamp: #7a9f6c;
  --logkitty-toggle-bg: #e0e0e0;
  --logkitty-toggle-hover: #d0d0d0;
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