/**
 * LogKitty: Developer log overlay for DappKitty
 * Exports a LogKitty class for DOM log panel and helpers.
 */
export class LogKitty {
  /**
   * @param {Object} options - { document, theme, expandIcon, collapseIcon }
   */
  constructor({ document, theme = { color: 'puzzl-light' }, expandIcon = '&#9660;', collapseIcon = '&#9650;' } = {}) {
    this.document = document;
    this.theme = theme;
    this.expandIcon = expandIcon;
    this.collapseIcon = collapseIcon;
    this.logKittyEl = null;
    this.init();
    this.injectStyles(LogKitty.getLogKittyStyles);
  }

  /**
   * Static start method for DappKitty integration or direct use.
   * @param {Object} options - { document, config }
   * If only document is provided, just shows the panel.
   * If config is provided, can show intro, theme, etc.
   */
  static start({ document, config } = {}) {
    if (!document) return;
    const theme = config?.theme || { color: 'puzzl-light' };
    const expandIcon = config?.expandIcon || '&#9660;';
    const collapseIcon = config?.collapseIcon || '&#9650;';
    const logKitty = new LogKitty({ document, theme, expandIcon, collapseIcon });
    // If config is provided, show intro
    if (config) {
      logKitty.logIntro(config.env || 'prod', config.logLevel || 'debug', theme.color);
    }
    return logKitty;
  }

  /**
   * Initialize LogKitty panel in the DOM.
   */
  init() {
    if (!this.document.getElementById('logKitty')) {
      const logKittyEl = this.document.createElement('div');
      logKittyEl.id = 'logKitty';
      this.createLogKittyView(logKittyEl);
      if (this.document.body.firstChild) {
        this.document.body.insertBefore(logKittyEl, this.document.body.firstChild);
      } else {
        this.document.body.appendChild(logKittyEl);
      }
      logKittyEl.classList.add(this.theme.color);
      this.logKittyEl = logKittyEl;
    } else {
      this.logKittyEl = this.document.getElementById('logKitty');
    }
  }

  /**
   * Create LogKitty view structure.
   */
  createLogKittyView(logKittyEl) {
    const expandIcon = this.expandIcon;
    const collapseIcon = this.collapseIcon;
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
  injectStyles(getLogKittyStyles) {
    if (!this.document.getElementById('logKitty-styles')) {
      const style = this.document.createElement('style');
      style.id = 'logKitty-styles';
      style.textContent = getLogKittyStyles();
      this.document.head.appendChild(style);
    }
  }

  /**
   * Standalone: get LogKitty CSS styles.
   */
  static getLogKittyStyles() {
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
#logKitty.puzzl-light {
  --logkitty-bg: #fdfdfd;
  --logkitty-fg: #0b1622;
  --logkitty-border: #20C9D2;
  --logkitty-shadow: #0001;
  --logkitty-error: #F26430;
  --logkitty-error-bg: #fff0ea;
  --logkitty-info: #20C9D2;
  --logkitty-info-bg: #e5fafd;
  --logkitty-warn: #FFD464;
  --logkitty-warn-bg: #fffbe6;
  --logkitty-debug: #445f63;
  --logkitty-debug-bg: #eef6f7;
  --logkitty-timestamp: #4caab7;
  --logkitty-toggle-bg: #e0e0e0;
  --logkitty-toggle-hover: #d0d0d0;
}
#logKitty.puzzl-dark {
  --logkitty-bg: #0b1622;
  --logkitty-fg: #e6f7ff;
  --logkitty-border: #20C9D2;
  --logkitty-shadow: #0008;
  --logkitty-error: #F26430;
  --logkitty-error-bg: #3b1d14;
  --logkitty-info: #20C9D2;
  --logkitty-info-bg: #102f32;
  --logkitty-warn: #FFD464;
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

  /**
   * Print an intro message and mascot to LogKitty.
   */
  logIntro(env, logLevel, theme) {
    const logKittyEl = this.logKittyEl;
    if (!logKittyEl) return;
    const contentDiv = logKittyEl.querySelector('.logKitty-content');
    if (!contentDiv) return;
    const catWrapper = this.document.createElement('div');
    catWrapper.id = 'dappkitty-cat';
    catWrapper.innerHTML = `
<pre>
Log Kitty Started!

Environment: ${env}
Log Level: ${logLevel}
Theme: ${theme}

      /\\_/\\
     ( o.o )
      > ^ <
This cat's got your back.
</pre>`;
    contentDiv.appendChild(catWrapper);
  }

  /**
   * Log a message to the LogKitty panel.
   */
  log(message, level = 'debug') {
    const logKittyEl = this.logKittyEl;
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
      const line = this.document.createElement('div');
      line.className = cssClass;
      line.textContent = prefix + message;
      contentDiv.appendChild(line);
      contentDiv.scrollTop = contentDiv.scrollHeight;
    }
  }
}
