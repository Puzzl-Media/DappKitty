/**
 * DappKitty: Modular, testable dApp dev toolkit
 * Usage: import { DappKitty } from './src/DappKitty.js';
 */

/**
 * Deep merge utility for config objects.
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

/**
 * Get DappKitty environment from URL or injected location.
 */
function getDappKittyEnv(location = window?.location) {
  if (!location) return 'prod';
  const urlParams = new URLSearchParams(location.search || '');
  const envParam = urlParams.get('envkitty');
  if (envParam === 'local') return 'local';
  if (envParam === 'dev') return 'dev';
  return 'prod';
}

/**
 * Main DappKitty class. Accepts config and dependencies for testability.
 */
class DappKitty {
  /**
   * @param {Object} config - User config overrides
   * @param {Window} win - window object (for testing/mocking)
   * @param {Document} doc - document object (for testing/mocking)
   */
  constructor(config = {}, win = window, doc = document) {
    this.window = win;
    this.document = doc;
    this.defaultConfig = {
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
        window: win,
        theme: win.DAPP_THEME ?? {},
        dapp: win.DAPP_CONFIG ?? {}
      }
    };
    this.env = getDappKittyEnv(win?.location);
    this.config = this.resolveConfig(config);
    this.logKitty = this.createLogKitty();
  }

  /**
   * Merge user config with defaults for the current env.
   */
  resolveConfig(overrides = {}) {
    const env = this.env;
    const envOverrides = overrides[env] || overrides;
    let merged = deepMerge(
      structuredClone(this.defaultConfig[env] || {}),
      envOverrides
    );
    merged.expandIcon = this.defaultConfig.expandIcon;
    merged.collapseIcon = this.defaultConfig.collapseIcon;
    merged.productionUrl = this.defaultConfig.productionUrl;
    merged.targets = this.defaultConfig.targets;
    merged.env = env;
    merged.logLevel = merged.dapp.logLevel || 'debug';
    return merged;
  }

  /**
   * Should DappKitty activate in this environment?
   */
  shouldActivate() {
    if (this.window.location.origin === this.config.productionUrl) return false;
    return this.config.env === 'dev' || this.config.env === 'local';
  }

  /**
   * Initialize LogKitty overlay and patch console/fetch if active.
   */
  start() {
    if (!this.shouldActivate()) return;
    this.injectLogKittyStyles();
    this.injectLogKittyPanel();
    this.applyOverrides();
    this.patchConsole();
    this.patchFetch();
    this.listenForErrors();
    this.logKittyIntro();
  }

  /**
   * Apply config overrides to targets.
   */
  applyOverrides() {
    const targets = this.config.targets || {};
    for (const key in targets) {
      if (this.config[key]) {
        Object.assign(targets[key], this.config[key]);
      }
    }
  }

  /**
   * Create a logKitty function for this instance.
   */
  createLogKitty() {
    const self = this;
    function logKitty(message, level = 'debug') {
      const logLevel = self.config.logLevel;
      if (logLevel === 'info' && level !== 'info') return;
      if (logLevel === 'kitty' && !logKitty._directCall) return;
      const logKittyEl = self.document.getElementById('logKitty');
      const contentDiv = logKittyEl ? logKittyEl.querySelector('.logKitty-content') : null;
      let prefix = '';
      let cssClass = 'logKitty-line';
      switch (level) {
        case 'error': prefix = '[ERROR] '; cssClass += ' logKitty-error'; break;
        case 'warn': prefix = '[WARN] '; cssClass += ' logKitty-warn'; break;
        case 'debug': prefix = '[DEBUG] '; cssClass += ' logKitty-debug'; break;
        default: prefix = '[INFO] '; cssClass += ' logKitty-info';
      }
      if (contentDiv) {
        const line = self.document.createElement('div');
        line.className = cssClass;
        line.textContent = prefix + message;
        contentDiv.appendChild(line);
        contentDiv.scrollTop = contentDiv.scrollHeight;
      }
    }
    // Direct call helpers
    function directKitty(fn) {
      return function (...args) {
        logKitty._directCall = true;
        fn.apply(null, args);
        logKitty._directCall = false;
      };
    }
    const wrapped = directKitty(logKitty);
    wrapped.error = directKitty(msg => wrapped(msg, 'error'));
    wrapped.warn = directKitty(msg => wrapped(msg, 'warn'));
    wrapped.info = directKitty(msg => wrapped(msg, 'info'));
    wrapped.debug = directKitty(msg => wrapped(msg, 'debug'));
    return wrapped;
  }

  /**
   * Inject LogKitty panel into the DOM.
   */
  injectLogKittyPanel() {
    if (!this.document.getElementById('logKitty')) {
      const logKittyEl = this.document.createElement('div');
      logKittyEl.id = 'logKitty';
      this.createLogKittyView(logKittyEl);
      if (this.document.body.firstChild) {
        this.document.body.insertBefore(logKittyEl, this.document.body.firstChild);
      } else {
        this.document.body.appendChild(logKittyEl);
      }
      logKittyEl.classList.add(this.config.theme.color);
    }
  }

  /**
   * Create LogKitty view structure.
   */
  createLogKittyView(logKittyEl) {
    const expandIcon = this.config.expandIcon;
    const collapseIcon = this.config.collapseIcon;
    const contentDiv = this.document.createElement('div');
    contentDiv.className = 'logKitty-content';
    logKittyEl.appendChild(contentDiv);
    const toggleBtn = this.document.createElement('button');
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

  /**
   * Inject default styles for LogKitty.
   */
  injectLogKittyStyles() {
    if (!this.document.getElementById('logKitty-styles')) {
      const style = this.document.createElement('style');
      style.id = 'logKitty-styles';
      style.textContent = this.getLogKittyStyles();
      this.document.head.appendChild(style);
    }
  }

  /**
   * Patch console methods to also log to LogKitty.
   */
  patchConsole() {
    const logKitty = this.logKitty;
    ['log', 'error', 'warn', 'debug', 'info'].forEach(method => {
      const original = this.window.console[method];
      this.window.console[method] = function (...args) {
        original.apply(this.window.console, args);
        try {
          const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
          logKitty._directCall = false;
          if (typeof logKitty[method] === 'function') {
            logKitty[method](msg);
          } else {
            logKitty(msg, method);
          }
        } catch (e) {
          original.call(this.window.console, '[logKitty failed]', e);
        }
      };
    });
  }

  /**
   * Patch fetch to log API calls and errors to LogKitty.
   */
  patchFetch() {
    if (!this.window.fetch || this.window.fetch.__kittyPatched) return;
    const logKitty = this.logKitty;
    const originalFetch = this.window.fetch;
    this.window.fetch = function (...args) {
      let method = 'GET';
      let url = '';
      if (typeof args[0] === 'string') {
        url = args[0];
        if (args[1] && args[1].method) method = args[1].method.toUpperCase();
      } else if (args[0] && args[0].url) {
        url = args[0].url;
        if (args[0].method) method = args[0].method.toUpperCase();
      }
      let formattedUrl = url;
      try {
        const parsed = new URL(url, this.window.location.origin);
        formattedUrl = `${parsed.origin}${parsed.pathname}`;
      } catch (e) {}
      logKitty.info(`[fetch] ${method} ${formattedUrl}`);
      return originalFetch.apply(this, args)
        .then(response => {
          let resUrl = response.url;
          try {
            const parsed = new URL(resUrl, this.window.location.origin);
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
    this.window.fetch.__kittyPatched = true;
  }

  /**
   * Listen for uncaught errors and unhandled promise rejections.
   */
  listenForErrors() {
    const logKitty = this.logKitty;
    this.window.addEventListener('error', function(event) {
      logKitty.error(`[window.error] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
    });
    this.window.addEventListener('unhandledrejection', function(event) {
      logKitty.error(`[unhandledrejection] ${event.reason}`);
    });
  }

  /**
   * Print an intro message and mascot to LogKitty.
   */
  logKittyIntro() {
    const logKittyEl = this.document.getElementById('logKitty');
    if (!logKittyEl) return;
    const contentDiv = logKittyEl.querySelector('.logKitty-content');
    if (!contentDiv) return;
    const catWrapper = this.document.createElement('div');
    catWrapper.id = 'dappkitty-cat';
    catWrapper.innerHTML = `
<pre>
Log Kitty Started!

Environment: ${this.config.env}
Log Level: ${this.config.logLevel}
Theme: ${this.config.theme.color}

      /\\_/\\
     ( o.o )
      > ^ <
This cat's got your back.
</pre>`;
    contentDiv.appendChild(catWrapper);
  }

  /**
   * Get LogKitty CSS styles.
   */
  getLogKittyStyles() {
    return `/* --- LogKitty: Command Line Developer Log --- */
#logKitty {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  bottom: 0;
  right: 0;
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
  }
}

export { DappKitty, deepMerge, getDappKittyEnv };
//# sourceMappingURL=dappkitty.esm.js.map
