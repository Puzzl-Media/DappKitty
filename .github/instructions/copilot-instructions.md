# Purpose
Write clean, maintainable, and minimal code that works reliably across static sites and serverless Python APIs. Prioritize clarity, simplicity, performance, and accessibility.

# Core Principles
1. Single Responsibility — Each function, file, or script should do one thing well.
2. Loose Coupling — Keep components independent and reusable.
3. Minimal Dependencies — Use only the standard libraries and built-in browser APIs.
4. Readable Over Clever — Clarity beats brevity.
5. Small Units — Keep functions, modules, and scripts short and to the point.

# JavaScript Guidelines (Vanilla JS)
- Use `const` and `let`; never use `var`.
- Stick to vanilla DOM methods and `fetch`. No frameworks.
- Break up large functions into named helpers.
- Use event delegation for performance and simplicity.
- Avoid `innerHTML` unless it's sanitized or strictly controlled.
- No ES module imports unless explicitly supported by the build script.

# Python Guidelines (AWS Lambda APIs)
- Keep Lambda handlers focused. Move logic into helpers.
- Use `os.environ` for config; never hardcode secrets.
- Use `urllib` over `requests` to minimize package size.
- Write small, pure functions where possible.
- Follow structure: `handler(event, context)` at the top, helpers below.

# HTML Guidelines (Static, SEO-Optimized)
- Use semantic HTML: `<main>`, `<header>`, `<nav>`, `<section>`, `<footer>`.
- Add `aria-*` and `role` attributes where appropriate for accessibility.
- Include `alt` text on all images and `label` elements for form inputs.
- Every page should include:
  - `<title>`, `<meta name="description">`, `<meta charset="UTF-8">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  - `<link rel="canonical">` if applicable
- Use heading levels logically (`<h1>` through `<h6>`)
- Avoid inline styles and inline scripts.

# CSS & UI/UX Guidelines

## 1. General Rules
- Keep styles clean, scoped, and modular. Avoid overly nested selectors.
- Eliminate redundant property declarations caused by inheritance or cascade.

## 2. Responsive Design
- Design **mobile-first**, then progressively enhance for larger screens.
- Use **CSS flexbox** for layout. Avoid grid unless necessary.
- Avoid fixed pixel values except for icons or thumbnails.

## 3. CSS Variables and Theming
- Extract all **colors**, **font families**, **font sizes**, and **spacing** into `:root` CSS variables.
- Support **light/dark mode** via a class on `<html>` or `<body>`, e.g., `.dark-mode`.
- Avoid hardcoding values like `#000` or `16px`; use `var(--color-text)` etc.

## 4. UI/UX Patterns
- Use **flexbox** for layout structure and element alignment.
- Apply **CSS transitions** for smooth animations (e.g., fade in/out, swipes, button hovers).
- Prefer **transform + opacity** for performant animations.
- Use **semantic HTML** and support **keyboard navigation** for all interactive elements (tabs, modals, dropdowns).
- Avoid `display: none` as the sole way to toggle visibility of focusable content — manage visibility accessibly.

## 5. Accessibility
- All interactive elements (e.g., buttons, inputs, menus) must be accessible via keyboard.
- Add `:focus` styles and use `tabindex`, `aria-expanded`, and `aria-controls` as needed.
- Ensure sufficient color contrast and readable font sizes.