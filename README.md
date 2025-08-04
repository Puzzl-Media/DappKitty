

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

DappKitty only activates when:

* You are **not on your production domain** (see `productionUrl` below), and
* You have enabled a dev mode via the URL using the `kittyenv` query param (`dev` or `local`)
* The resolved `logLevel` is not `'off'` (see below for precedence)

```bash
# Enable dev mode
https://dev.yourapp.com?kittyenv=dev

# Enable local mode
https://dev.yourapp.com?kittyenv=local
```

Use the optional `productionUrl` config to define what domain DappKitty should disable itself on:

```js
import dappKitty from 'dappkitty';
dappKitty('debug', {
  productionUrl: 'https://your-production-site.com'
});
```

You can ship DappKitty in your production bundle with zero risk, as it will silently disable itself in production or when `logLevel` is not set.


> **Warning:**
> If you do **not** set the `productionUrl` in your config, DappKitty and LogKitty may boot up on your production site! Always set `productionUrl` to your real production domain to ensure DappKitty disables itself in production.

---

## Included Modules & Support

DappKitty is modular. Each feature is implemented as a module, and you can use them together or independently:

### LogKitty (core, fully supported)

**LogKitty** is an in-browser log overlay that captures console output, fetch requests, and custom logs. It helps you debug on real devices where the browser console is not available.

- See all logs, warnings, errors, and fetches in a floating panel.
- Filter output by log level (`debug`, `info`, `kitty`).
- Use `logKitty()` for manual logging, or let it capture `console.log`, `console.error`, etc.


**Log Level Precedence & Defaults:**

LogKitty is **off by default** unless enabled via config or main argument. The log level is resolved in this order:

| Precedence | Source                                      | Example                                  |
|------------|---------------------------------------------|-------------------------------------------|
| 1          | Per-env config: `config[env].logKitty.logLevel` | `{ dev: { logKitty: { logLevel: 'debug' } } }` |
| 2          | Global config: `config.logKitty.logLevel`   | `{ logKitty: { logLevel: 'info' } }`      |
| 3          | Main argument: `dappKitty(logLevel, config)`| `dappKitty('debug')`                      |
| 4          | Default: `'off'`                            |                                           |

If the resolved logLevel is `'off'`, LogKitty will not show.

**Logging Levels:**

| `logLevel` | What Gets Logged                                               |
| ---------- | -------------------------------------------------------------- |
| `debug`    | Everything: `logKitty`, `console`, `window`, `fetch`           |
| `info`     | Only info-level calls from `logKitty`, `console`, and `window` |
| `kitty`    | Only explicit `logKitty()` calls with no console noise         |
| `off`      | LogKitty is disabled (default)                                 |

**Usage Examples:**

```js
// Enable LogKitty in all environments (debug level)
dappKitty('debug');

// Enable LogKitty only in dev mode (debug), off elsewhere
dappKitty(undefined, { dev: { logKitty: { logLevel: 'debug' } } });

// Enable LogKitty in dev (info), local (debug), off elsewhere
dappKitty(undefined, {
  dev: { logKitty: { logLevel: 'info' } },
  local: { logKitty: { logLevel: 'debug' } }
});

// Disable LogKitty everywhere (explicit)
dappKitty('off');
```

If you pass a string as the first argument, it sets the global logLevel. You can override per-environment logLevel in the config object. If nothing is set, LogKitty is off by default.

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


**WindowKitty** lets you simulate different runtime environments with config overrides. Use the config to override `window`, `theme`, and `dapp` contexts for each environment. You can also override logLevel and theme per environment.

```js
prod: {
  window: { FEATURE_FLAG: false }
}
```


Just define what you want overridden. Most users will be fine using the defaults. If you want LogKitty to be off by default, do not set a logLevel in your config or main argument.

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
  import { dappKitty } from './dappKitty.js';
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
  import { dappKitty } from './assets/dappKitty.js';
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




# DappKitty

> A zero-config dev toolkit for Web3 dApps, mobile logging, and environment overrides. All wrapped in one purring package.

---

## What is DappKitty?

**DappKitty** is an environment-aware utility wrapper for Web3 dApps. It helps simulate different environments, override window variables, and debug dApps on mobile devices with a visual in-browser log overlay.

You can think of it as your portable, plug-and-play dApp debugger with cat-like reflexes.

---

## Key Features

| Feature              | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| **LogKitty**         | In-browser log panel to capture console logs, fetch calls, and errors |
| **Window Overrides** | Per-environment overrides for `window`, `theme`, and `dapp`           |
| **Query Param Mode** | Enable specific modes using `?kittyenv=dev` or `?kittyenv=local`      |
| **Theme Support**    | Built-in light and dark themes via CSS variables                      |
| **Production-Safe**  | Disabled on production by default (set `productionUrl`)               |
| **Mobile First**     | Works perfectly on real devices where browser console is invisible    |

---

## Quick Start

```bash
npm install dappkitty
```

Then in your code:

```js
import dappKitty from 'dappkitty';
dappKitty('debug', {
  productionUrl: 'https://your-production-app.com',
  dev: {
    window: { API_URL: 'https://dev.api' },
    logKitty: { logLevel: 'debug' }
  },
  local: {
    window: { API_URL: 'http://localhost:3000' },
    logKitty: { logLevel: 'debug' }
  }
});
```

Then load your app using:

```txt
https://your-app.com?kittyenv=dev
```

---


## Production Safety

DappKitty disables itself automatically:

* If the current domain matches `productionUrl`
* If the resolved `logLevel` is `'off'`
* If no environment is detected in `kittyenv`

You can safely include DappKitty in your production bundle.

```js
import dappKitty from 'dappkitty';
dappKitty('off', { productionUrl: 'https://myapp.com' });
```

---


## Window Overrides

DappKitty can override window/global targets per environment:

```js
{
  dev: {
    window: {
      API_URL: 'https://dev.api',
      FEATURE_FLAG: true
    }
  }
}
```

Targets include:

* `window` (global JS scope)

---

## Modules

### LogKitty

LogKitty is a floating browser console that captures:

* `console.log`, `warn`, `error`, `debug`
* `fetch` requests (with method, status, URL)
* `window.onerror` and `unhandledrejection`

#### Log Levels

| Level | Captures                           |
| ----- | ---------------------------------- |
| debug | Everything                         |
| info  | Info-level console + LogKitty logs |
| kitty | Only direct `logKitty()` calls     |
| off   | LogKitty disabled                  |

#### Manual Logging

```js
logKitty('Hello world');
logKitty.warn('Watch it');
logKitty.error('Uh oh');
logKitty.debug({ obj: true });
```

---

## Theming

LogKitty includes two themes:

* `puzzl-light`
* `puzzl-dark`

Themes use CSS variables and can be overridden.

```css
#logKitty { font-size: 0.9em; background: black; }
.logKitty-error { color: red; }
```

---

## Framework Support

Works in any frontend setup. Examples:

### Vanilla JS

```html
<script type="module">
  import dappKitty from './dappKitty.js';
  dappKitty('debug');
</script>
```

### React

```js
useEffect(() => {
  dappKitty('debug');
}, []);
```

### Vue

```js
import dappKitty from 'dappkitty';
dappKitty('debug');
```

### Flutter (via WebView)

```html
<script type="module">
  import dappKitty from './assets/dappKitty.js';
  dappKitty('debug');
</script>
```

---

## Testing

DappKitty uses Jest.

```bash
NODE_OPTIONS=--experimental-vm-modules npm test
```

For coverage:

```bash
NODE_OPTIONS=--experimental-vm-modules npm test -- --coverage
```

> Some UI features may be skipped in jsdom.

---



## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, improvements, or new features.

**Development setup:**

```bash
git clone https://github.com/puzzl-media/dappkitty.git
cd dappkitty
npm install
```

---

## License

MIT © Puzzl Media