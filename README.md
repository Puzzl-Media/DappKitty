

# DappKitty

![npm version](https://img.shields.io/npm/v/dappkitty.svg)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/dappkitty)
![coverage](https://img.shields.io/badge/coverage-unknown-lightgrey?style=flat)

<!--
To enable a real coverage badge, use a service like Coveralls or Codecov and replace the badge URL above. See the Testing section below.
-->

**DappKitty** is a lightweight toolkit for smoother dApp development, especially when debugging secure, production-like environments on mobile devices.

When testing with wallets like Phantom, you are often required to serve your app over HTTPS. This can make local debugging a huge pain, especially when you are testing on a physical device and cannot see browser console output.

DappKitty wraps developer tools into a modular, environment-aware system with a fun personality. Drop it into any dApp, see what is happening behind the scenes, and simulate various modes through simple query params. No infrastructure or browser extensions needed.

---

## Features

| Feature         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| LogKitty        | In-browser log overlay for console, events, and fetch requests              |
| WindowKitty     | Simulate different runtime environments with config overrides                |
| Theme Support   | Pixel-inspired light and dark themes                                        |
| Environment-Aware | Activates only in dev/local, disables itself in production                |
| Zero Config     | Sensible defaults, but everything is overrideable                           |

---


## Quick Start

DappKitty activates only when:

* You are **not on your production domain**, and
* You have enabled a dev mode via the URL using the `envkitty` query param

```bash
# Enable dev mode
https://dev.yourapp.com?envkitty=dev

# Enable local mode
https://dev.yourapp.com?envkitty=local
```

Use the optional `productionUrl` config to define what domain DappKitty should disable itself on:

```js
import { dappKitty } from 'dappkitty';
dappKitty('debug', {
  productionUrl: 'https://your-production-site.com'
});
```

You can ship DappKitty in your production bundle with zero risk, as it will silently disable itself in production.

> **Warning:**
> If you do **not** set the `productionUrl` in your config, DappKitty and LogKitty may boot up on your production site! Always set `productionUrl` to your real production domain to ensure DappKitty disables itself in production.

---

## Installation & Bundles

DappKitty ships with two minified module formats:

| File                   | Module Type | Usage Example                                 |
|------------------------|-------------|-----------------------------------------------|
| `dappKitty.min.js`     | ESM (default) | `import { dappKitty } from './dappKitty.min.js'` |
| `dappKitty.umd.min.js` | UMD         | `<script src="dappKitty.umd.min.js"></script>`   |

- **ESM** is the default and recommended for modern apps and frameworks. Use it with `import` in your JS/TS code.
- **UMD** is for legacy or direct `<script>` usage, and exposes `window.dappKitty` globally.

Both files are minified for production use.




## Included Modules & Support

DappKitty is modular. Each feature is implemented as a module, and you can use them together or independently:

### LogKitty (core, fully supported)

**LogKitty** is an in-browser log overlay that captures console output, fetch requests, and custom logs. It helps you debug on real devices where the browser console is not available.

- See all logs, warnings, errors, and fetches in a floating panel.
- Filter output by log level (`debug`, `info`, `kitty`).
- Use `logKitty()` for manual logging, or let it capture `console.log`, `console.error`, etc.

**Logging Levels:**

LogKitty output is filtered by the active `logLevel` defined in your config. You can set a global log level, and also override it for specific environments:

| `logLevel` | What Gets Logged                                               |
| ---------- | -------------------------------------------------------------- |
| `debug`    | Everything: `logKitty`, `console`, `window`, `fetch`           |
| `info`     | Only info-level calls from `logKitty`, `console`, and `window` |
| `kitty`    | Only explicit `logKitty()` calls with no console noise         |

**Usage Examples:**

```js
// Set global logLevel to info (all environments)
dappKitty('info');

// Set global logLevel to info, but dev mode runs in debug
dappKitty('info', { dev: { logLevel: 'debug' } });
```

If you pass a string as the first argument, it sets the global logLevel. You can then override per-environment logLevel in the config object.

**Manual Logging:**

You can log messages manually, with optional severity helpers:

```js
logKitty('Plain message');         // Info
logKitty.warn('Careful now');      // Warn
logKitty.error('Uh oh!');          // Error
logKitty.debug({ key: 'value' });  // Debug
```

---

### WindowKitty (core, fully supported)

**WindowKitty** lets you simulate different runtime environments with config overrides. Use the config to override `window`, `theme`, and `dapp` contexts for each environment.

```js
prod: {
  window: { FEATURE_FLAG: false }
}
```

Just define what you want overridden. Most users will be fine using the defaults.

---

### Roadmap Modules (planned)

- WalletKitty: handle wallet connect/auth
- ApiKitty: fetch wrapper with retries and status
- GameKitty: telemetry and gameplay utilities

---

## Framework Usage Examples

### Vanilla JS

```html
<script type="module">
  import { dappKitty } from './dappkitty.js';
  dappKitty('debug');
</script>
```

### React

```jsx
import { useEffect } from 'react';
import { dappKitty } from 'dappkitty';

useEffect(() => {
  dappKitty('debug');
}, []);
```

### Vue

```js
// main.js
import { dappKitty } from 'dappkitty';
dappKitty('debug');
```

### Flutter (via WebView)

```html
<script type="module">
  import { dappKitty } from './assets/dappkitty.js';
  dappKitty('debug');
</script>
```

---

## Custom Styling for LogKitty

You can override all the default styles using CSS. Here are the targets:

| Selector              | Description                  |
| --------------------- | ---------------------------- |
| `#logKitty`           | Main log panel container     |
| `.logKitty-line`      | Each individual log line     |
| `.logKitty-error`     | For `console.error()` output |
| `.logKitty-info`      | For `console.log()` output   |
| `.logKitty-warn`      | For `console.warn()` output  |
| `.logKitty-debug`     | For `console.debug()` output |
| `.logKitty-timestamp` | (Optional) Timestamp spans   |
| `#logKitty-toggle`    | Expand/collapse button       |

#### Example

```css
#logKitty {
  background: #111;
  font-size: 0.9em;
}

.logKitty-error {
  color: #f33;
  background: #200;
}
```

---


## Roadmap

* `WalletKitty`: handle wallet connect/auth
* `ApiKitty`: fetch wrapper with retries and status
* `GameKitty`: telemetry and gameplay utilities
* `ThemeKitty`: override CSS themes dynamically

---



## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, improvements, or new features.

**Development setup:**

```bash
git clone https://github.com/puzzl-media/dappkitty.git
cd dappkitty
npm install
```

**Preview app:**

You can test changes in `/preview/index.html` for live browser feedback.

---


## Testing

DappKitty uses [Jest](https://jestjs.io/) for unit tests. All tests are located in the `tests/` directory.

**Run all tests:**
```bash
NODE_OPTIONS=--experimental-vm-modules npm test
```

**Run a specific test file:**
```bash
```

**Check test coverage (ESM-compatible):**
```bash
NODE_OPTIONS=--experimental-vm-modules npm test -- --coverage
```

> **Note:** Some UI/DOM features are not fully covered due to jsdom limitations. See skipped tests for details. For ESM import errors with coverage, see [Jest ESM docs](https://jestjs.io/docs/ecmascript-modules) or try [c8](https://www.npmjs.com/package/c8).

**Coverage badge:**
To display a live coverage badge, use a service like [Coveralls](https://coveralls.io/) or [Codecov](https://about.codecov.io/). Sign up, connect your repo, and replace the badge URL at the top of this README with the one provided by your coverage service.

---

## About

Made by [Puzzl Media](https://puzzl.co.za), smart tools for weird developers.

---

## License

MIT License &copy; Puzzl Media