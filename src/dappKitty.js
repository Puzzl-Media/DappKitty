/**
 * DappKitty: Modular, testable dApp dev toolkit
 * Usage: import { DappKitty } from './src/DappKitty.js';
 */

/**
 */

import { LogKitty } from './LogKitty.js';

/**
 * Get DappKitty environment from URL or injected location.
 */
export function getDappKittyEnv(location = window?.location) {
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
export class DappKitty {
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
    this.config = this.resolveConfig(config, this.env);
    this.applyOverrides();
  }

  /**
   * Merge user config with defaults for the current env.
   */
  resolveConfig(userConfig = {}, env = this.env) {
    // Root-only keys: never overridden by env
    const rootOnlyKeys = ['expandIcon', 'collapseIcon', 'productionUrl', 'targets'];
    // Start with a shallow copy of defaultConfig (root only, not env)
    const config = { ...this.defaultConfig };
    delete config.dev;
    delete config.local;
    delete config.prod;

    // Flatten env defaults into config if present
    if (this.defaultConfig[env]) {
      for (const k in this.defaultConfig[env]) {
        if (!rootOnlyKeys.includes(k)) config[k] = this.defaultConfig[env][k];
      }
    }

    // Flatten userConfig root keys
    for (const k in userConfig) {
      if (!['dev', 'local', 'prod'].includes(k) && k in config) {
        config[k] = userConfig[k];
      }
    }

    // Flatten userConfig env keys (if present)
    if (userConfig[env]) {
      for (const k in userConfig[env]) {
        if (!rootOnlyKeys.includes(k) && k in config) {
          config[k] = userConfig[env][k];
        }
      }
    }

    // logLevel precedence: env override > root override > env default > root default > fallback
    config.logLevel =
      (userConfig[env] && typeof userConfig[env].logLevel !== 'undefined') ? userConfig[env].logLevel :
      (typeof userConfig.logLevel !== 'undefined') ? userConfig.logLevel :
      (this.defaultConfig[env] && typeof this.defaultConfig[env].logLevel !== 'undefined') ? this.defaultConfig[env].logLevel :
      (typeof this.defaultConfig.logLevel !== 'undefined') ? this.defaultConfig.logLevel :
      (userConfig[env] && userConfig[env].dapp && userConfig[env].dapp.logLevel) ? userConfig[env].dapp.logLevel :
      (this.defaultConfig[env] && this.defaultConfig[env].dapp && this.defaultConfig[env].dapp.logLevel) ? this.defaultConfig[env].dapp.logLevel :
      'debug';

    // env
    config.env = env;

    return config;
  }

  /**
   * Should DappKitty activate in this environment?
   */
  shouldActivate() {
    if (this.window.location.origin === this.config.productionUrl) return false;
    return this.config.env === 'dev' || this.config.env === 'local';
  }

  /**
   * Start DappKitty and plug in LogKitty if present.
   */
  start() {
    if (!this.shouldActivate()) return;
    this.applyOverrides();
    // Plug in LogKitty (if present)
    LogKitty.start({
      document: this.document,
      config: this.config
    });
  }

  /**
   * Apply config overrides to targets.
   */
  applyOverrides() {
    const targets = this.config.targets || {};
    // Flat config: assign only top-level keys
    if (this.config.window && targets.window) {
      Object.assign(targets.window, this.config.window);
    }
    if (this.config.theme && targets.theme) {
      Object.assign(targets.theme, this.config.theme);
    }
    if (this.config.dapp && targets.dapp) {
      Object.assign(targets.dapp, this.config.dapp);
    }
  }

  // ...existing code...
}