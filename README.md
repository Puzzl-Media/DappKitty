# DappKitty

**DappKitty** is a collection of tools that make dApp development smoother, especially when debugging secure, production-like environments on mobile devices.

When testing with wallets like Phantom, you're often required to serve your app over HTTPS. This can make local debugging a huge pain — especially when you're testing on a physical device and can't see browser console output.

**DappKitty** wraps developer tools into a modular, environment-aware system with a fun personality. You can drop it into any dApp, see what’s happening behind the scenes, and simulate various modes through simple query params — no infrastructure or browser extensions needed.

---

## Quick Start

DappKitty activates only when:

* You're **not on your production domain**, *and*
* You've enabled a dev mode via the URL using the `envkitty` query param

```bash
# Enable dev mode
https://dev.yourapp.com?envkitty=dev

# Enable local mode
https://dev.yourapp.com?envkitty=local
```

Use the optional `productionUrl` config to define what domain DappKitty should **disable itself on**:

```js
initDappKitty({
  productionUrl: 'https://your-production-site.com'
});
```

This means you can ship DappKitty in your production bundle with zero risk — it will silently disable itself in production.

---


## Installation

You can use DappKitty by installing it via npm or by including the source directly in your project.

### Option 1: Install from npm

```bash
npm install dappkitty
```

Then import it into your project:

```js
import { initDappKitty } from 'dappkitty';
```

---

### Option 2: Use from source

Clone or copy the module into your project:

```bash
git clone https://github.com/your-org/dappkitty.git
```

```js
import { initDappKitty } from './path/to/dappkitty.js';
```

---


## Included Modules

### LogKitty

**LogKitty** is a styled developer console overlay that captures and displays logs directly in your browser — perfect for debugging on mobile or in secure production-like environments.

Supports:

* `console` output (`log`, `warn`, `error`, `debug`)
* `logKitty(...)` calls
* `window` events (e.g., load, focus, visibility change)
* `fetch` requests (start + response status)

---

#### Logging Levels

LogKitty’s output is filtered by the active `logLevel` defined in your config:

| `logLevel` | What Gets Logged                                               |
| ---------- | -------------------------------------------------------------- |
| `debug`    | Everything: `logKitty`, `console`, `window`, `fetch`           |
| `info`     | Only info-level calls from `logKitty`, `console`, and `window` |
| `kitty`    | Only explicit `logKitty()` calls with no console noise         |

To set the level, pass it into the `dapp` config block:

```js
initDappKitty({
  envs: {
    dev: {
      dapp: {
        logLevel: 'debug'
      }
    }
  }
});
```

---

#### Manual Logging

You can still log messages manually, with optional severity helpers:

```js
logKitty('Plain message');         // Info
logKitty.warn('Careful now');      // Warn
logKitty.error('Uh oh!');          // Error
logKitty.debug({ key: 'value' });  // Debug
```

---

### WindowKitty

DappKitty also includes a lightweight override engine to simulate different runtime environments without changing your source code.

Using the `envs` config, you can pass through override objects for `window`, `theme`, and `dapp` contexts — and they’ll be automatically applied based on your active mode (`dev`, `local`, or `prod`).

```js
initDappKitty({
  dev: {
    window: { FEATURE_FLAG: true }
  },
  prod: {
    window: { FEATURE_FLAG: false }
  }
});
```

No need to worry about the exact structure. Just define what you want overridden. Most users will be fine using the defaults.

---

## Installation

### Option 1: Install from npm

```bash
npm install dappkitty
```

```js
import { initDappKitty } from 'dappkitty';
```

---

### Option 2: Use from source

```bash
git clone https://github.com/puzzl-media/dappkitty.git
```

```js
import { initDappKitty } from './path/to/dappkitty.js';
```

---

## Usage Examples

### Vanilla JS

```html
<script type="module">
  import { initDappKitty } from './dappkitty.js';
  initDappKitty();
</script>
```

---

### React

```jsx
import { useEffect } from 'react';
import { initDappKitty } from 'dappkitty';

useEffect(() => {
  initDappKitty();
}, []);
```

---

### Vue

```js
// main.js
import { initDappKitty } from 'dappkitty';
initDappKitty();
```

---

### Flutter (via WebView)

```html
<script type="module">
  import { dappKitty } from './assets/dappkitty.js';
  DappKitty();
</script>
```

---

## Initialize with Config

DappKitty supports full environment-based configuration. Here’s a sample setup:

```js
const kittyConfig = {
  dev: {
    window: { FEATURE_FLAG: true },
    theme: { color: 'puzzl-light' },
    dapp: { logLevel: 'kitty' }
  },
  local: {
    window: { FEATURE_FLAG: true },
    theme: { color: 'puzzl-dark' },
    dapp: { logLevel: 'debug' }
  },
  expandIcon: '&#9660;',
  collapseIcon: '&#9650;',
  productionUrl: 'https://your-production.com',
  targets: {
    window: window,
    theme: window.DAPP_THEME ?? {},
    dapp: window.DAPP_CONFIG ?? {}
  }
};

initDappKitty(kittyConfig);
```

This system allows you to simulate runtime environments by switching `?envkitty=dev` or `?envkitty=local` in your browser URL. Most developers can stick with the defaults, but everything is overrideable.
---

## Themes

DappKitty includes built-in support for **light** and **dark** themes, styled with a pixel-inspired palette from [Puzzl’s](https://puzzl.co.za) visual identity.

To switch themes, pass the desired color into your environment config:

```js
theme: { color: 'puzzl-dark' } // or 'puzzl-light'
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

* `WalletKitty` — handle wallet connect/auth
* `ApiKitty` — fetch wrapper with retries + status
* `GameKitty` — telemetry and gameplay utilities
* `ThemeKitty` — override CSS themes dynamically

---

## About

Made by [Puzzl Media](https://puzzl.co.za) — smart tools for weird developers.

---

## License

MIT License &copy; Puzzl Media