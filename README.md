

# DappKitty

![npm version](https://img.shields.io/npm/v/dappkitty.svg)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/dappkitty)
![coverage](https://img.shields.io/badge/coverage-unknown-lightgrey?style=flat)

**DappKitty** is a lightweight toolkit for smoother dApp development, especially when debugging secure, production-like environments on mobile devices.

When testing with wallets like Phantom, you are often required to serve your app over HTTPS. This can make local debugging a huge pain, especially when you are testing on a physical device and cannot see browser console output.

DappKitty wraps developer tools into a modular, environment-aware system with a fun personality. Drop it into any dApp, see what is happening behind the scenes, and simulate various modes through simple query params. No infrastructure or browser extensions needed.

---

## Features

| Feature         | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| LogKitty        | In-browser log overlay for console, events, and fetch requests              |
| Window Overrides| Simulate different runtime environments with config overrides               |
| Environment-Aware | Activates only in dev/local, disables itself in production                |
| Zero Config     | Sensible defaults, but everything is overrideable                           |
| Theme Support   | Pixel-inspired light and dark themes                                        |


## Installation

You can use DappKitty in your project via npm (Node) or by downloading the standalone bundle.

### Node (npm)

Install via npm:

```bash
npm install dappkitty
```

Then import and use in your code:

```js
import dappKitty from 'dappkitty';
dappKitty('debug');
```

### Direct Download (Browser)

Download the latest build from the `dist` folder:

```
https://github.com/Puzzl-Media/dappkitty/dist/dappKitty.js
```

Include it in your HTML:

```html
<script src="./dappKitty.js"></script>
<script>
  dappKitty('debug');
</script>
```

Or as a module:

```html
<script type="module">
  import dappKitty from './dappKitty.js';
  dappKitty('debug');
</script>
```



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

## Included Modules & Support

DappKitty is modular. Each feature is implemented as a module, and you can use them together or independently:

### LogKitty (core, fully supported)

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


**Usage Examples:**

```js
// Enable LogKitty in all environments (debug level)
dappKitty('debug');

// Enable LogKitty only in dev mode (debug), off elsewhere
dappKitty('off', { dev: { logKitty: { logLevel: 'debug' } } });

// Enable LogKitty in dev (info), local (debug), off elsewhere
dappKitty('off', {
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