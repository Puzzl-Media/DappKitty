## **What is `dapptoolsjs`?**

`dapptoolsjs` is a developer utility module for your dApp that provides:

- **A developer log panel (`#dapplog`)** that appears at the top of your page, styled like a command-line interface.
- **A unified logging function (`dappLog`)** that color-codes and formats messages by log level (info, warn, error, debug).
- **Automatic patching of the browser’s `console` methods** so all `console.log`, `console.error`, etc., are also shown in the developer log panel.
- **A flexible configuration system** that lets you override global variables (like `window.API_URL`) for different environments (prod, dev, local) based on URL parameters.

---

## **How does it work?**

### 1. **Initialization with Config**

You call `initDappTools(config)` at the start of your app, passing a config object like:

```javascript
initDappTools({
  dev:   { window: { API_URL: 'https://devapi.roaringpepe.xyz/api' } },
  local: { window: { API_URL: 'http://localhost:5050/api' } },
  prod:  { window: { API_URL: 'https://api.roaringpepe.xyz/api' } }
});
```

- The module checks the URL for `?dev=true` or `?local=true` to determine the environment.
- It applies the relevant overrides from your config, setting things like `window.API_URL` as needed.
- It logs which environment is active and what the API URL is.

---

### 2. **Injecting the Developer Log Panel**

- On initialization, it injects a `<div id="dapplog">` right after the opening `<body>` tag if it doesn’t already exist.
- It also injects a `<style>` block with all the CSS needed to make the log look like a terminal.

---

### 3. **Logging with `dappLog`**

- You can call `dappLog("message", "level")` directly in your code.
- Supported levels: `"info"` (default), `"warn"`, `"error"`, `"debug"`.
- Each message is color-coded and formatted in the log panel.

---

### 4. **Console Patching**

- The module overrides `console.log`, `console.error`, `console.warn`, and `console.debug`.
- Any call to these methods will:
  - Still output to the browser console as normal.
  - Also appear in the `#dapplog` panel, formatted and color-coded.
- This means you do not have to change your existing logging code to get the benefit of the developer log panel.

---

### 5. **Styling and Customization**

- **Default styles for the log panel are included in the dapptoolsjs package.**
- **You can override any or all of these styles by providing your own CSS in your project.**
- To customize the appearance, simply add your own CSS rules targeting the following classes and IDs:

  - `#dapplog` — The main log panel container
  - `.dapplog-line` — Each log line
  - `.dapplog-error` — Error log lines
  - `.dapplog-info` — Info log lines
  - `.dapplog-warn` — Warning log lines
  - `.dapplog-debug` — Debug log lines
  - `.dapplog-timestamp` — Timestamp span (if you add timestamps)

  For example, in your own stylesheet:

  ```css
  #dapplog {
    background: #222;
    color: #fff;
    font-size: 1em;
  }
  #dapplog .dapplog-error {
    color: #ff3333;
    background: #330000;
  }
  ```

---

## **Why use `dapptoolsjs`?**

- **Centralizes all developer logging** in one visible, styled panel for easy debugging.
- **Works out of the box** with your existing `console` calls.
- **Makes environment switching easy** with a single config object and URL params.
- **No need to modify HTML** to add the log panel or styles.
- **Keeps your production UI clean** (you can hide or disable the log in production if desired).
- **Fully customizable appearance** by overriding the default CSS.

---

**In summary:**
`dapptoolsjs` gives you a powerful, configurable, and visually clear developer log for your dApp, with zero HTML fuss, maximum flexibility for environment management and debugging, and easy style overrides via your own CSS.

