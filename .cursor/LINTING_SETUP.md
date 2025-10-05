# Linting & Formatting Setup

## ✅ Installed

- **Prettier** v3.6.2 - Code formatter
- **ESLint** v9 - JavaScript/TypeScript linter
- **eslint-config-prettier** - Integration
- **eslint-plugin-prettier** - Prettier as ESLint rule

## 📋 Quick Commands

```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format + Lint together
npm run format:lint
```

## 🎨 Prettier Config

- **Line width**: 90 characters
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Indentation**: 2 spaces
- **Trailing commas**: ES5 style

## 🔍 ESLint Rules

- `any` types: Allowed
- Unused vars: Warning
- Unescaped entities: Allowed
- React Hooks deps: Warning
- HTML img tags: Allowed

## 🚀 VS Code Setup

Auto-format on save enabled in `.vscode/settings.json`

Install extensions:
- Prettier - Code formatter
- ESLint

## 📁 Files Created

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore
- `.eslintrc.json` - Updated with Prettier
- `.vscode/settings.json` - Editor config
- `LINTING_FORMATTING_GUIDE.md` - Full documentation

## ✨ Status

All code has been formatted with Prettier!

Minor warnings exist (unused imports, etc.) but won't break builds.

---

**Use before committing**: `npm run format:lint`

