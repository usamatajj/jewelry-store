# 🎨 Linting & Formatting Guide

## ✅ What's Installed

Your project now has:
- ✅ **ESLint** - JavaScript/TypeScript linter
- ✅ **Prettier** - Code formatter
- ✅ **eslint-config-prettier** - Disables ESLint rules that conflict with Prettier
- ✅ **eslint-plugin-prettier** - Runs Prettier as an ESLint rule

## 📋 Available Commands

### Format Code
```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

### Lint Code
```bash
# Check for linting issues
npm run lint

# Fix auto-fixable linting issues
npm run lint:fix

# Format and lint together
npm run format:lint
```

## 🔧 Configuration Files

### `.prettierrc`
Prettier configuration:
```json
{
  "semi": true,                  // Use semicolons
  "trailingComma": "es5",        // Trailing commas in ES5 (objects, arrays)
  "singleQuote": true,           // Use single quotes
  "printWidth": 90,              // Line width 90 chars
  "tabWidth": 2,                 // 2 spaces per indent
  "useTabs": false,              // Use spaces, not tabs
  "arrowParens": "always",       // Always use parens in arrow functions
  "endOfLine": "lf",             // Unix line endings
  "bracketSpacing": true,        // Spaces in object literals
  "jsxSingleQuote": false,       // Double quotes in JSX
  "quoteProps": "as-needed"      // Only quote props when needed
}
```

### `.eslintrc.json`
ESLint configuration:
```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "off"
  }
}
```

### `.prettierignore`
Files/folders that Prettier should ignore:
- `node_modules/`
- `.next/`
- `build/`
- `dist/`
- Environment files
- Lock files
- Markdown files (optional)

### `.vscode/settings.json`
VS Code configuration for automatic formatting:
- Format on save enabled
- Prettier as default formatter
- ESLint auto-fix on save

## 🚀 Usage

### Before Committing
Run this to ensure code is clean:
```bash
npm run format:lint
```

### During Development
Your VS Code will automatically:
- ✅ Format code on save (if Prettier extension installed)
- ✅ Show linting errors inline
- ✅ Auto-fix ESLint issues on save

### CI/CD Pipeline
Add to your workflow:
```yaml
- name: Check formatting
  run: npm run format:check

- name: Check linting
  run: npm run lint
```

## 📐 Prettier Rules Explained

| Rule | Value | Effect |
|------|-------|--------|
| `printWidth` | 90 | Max line length before wrapping |
| `tabWidth` | 2 | Spaces per indentation level |
| `useTabs` | false | Use spaces instead of tabs |
| `semi` | true | Add semicolons at end of statements |
| `singleQuote` | true | Use `'` instead of `"` |
| `trailingComma` | "es5" | Add trailing commas where valid in ES5 |
| `bracketSpacing` | true | `{ foo: bar }` vs `{foo: bar}` |
| `arrowParens` | "always" | `(x) => x` vs `x => x` |
| `endOfLine` | "lf" | Use Unix line endings (\n) |

## 🔍 ESLint Rules Explained

| Rule | Setting | Why |
|------|---------|-----|
| `@typescript-eslint/no-explicit-any` | off | Allow `any` type when needed |
| `@typescript-eslint/no-unused-vars` | warn | Warn about unused variables |
| `react/no-unescaped-entities` | off | Allow `'` and `"` in JSX |
| `react-hooks/exhaustive-deps` | warn | Warn about missing dependencies |
| `@next/next/no-img-element` | off | Allow HTML `<img>` tag |
| `prettier/prettier` | warn | Show Prettier issues as warnings |

## 🎯 Best Practices

### 1. Format Before Pushing
```bash
npm run format:lint
git add .
git commit -m "Your message"
git push
```

### 2. Install VS Code Extensions
Recommended extensions:
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

### 3. Use Pre-commit Hooks (Optional)
Install husky and lint-staged:
```bash
npm install -D husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npx lint-staged
```

## 🐛 Troubleshooting

### Prettier and ESLint Conflicting
**Problem**: Rules conflict between Prettier and ESLint  
**Solution**: `eslint-config-prettier` is installed and configured

### Format on Save Not Working
**Problem**: VS Code not formatting on save  
**Solutions**:
1. Install Prettier extension
2. Set Prettier as default formatter
3. Enable "Format On Save" in settings
4. Check `.vscode/settings.json` exists

### Linting Errors Won't Fix
**Problem**: `npm run lint:fix` doesn't fix all errors  
**Reason**: Some errors require manual fixing:
- Logic errors
- Type errors
- Complex refactoring

### Different Formatting in Terminal vs Editor
**Problem**: `npm run format` gives different results than editor  
**Solution**: Ensure both use same Prettier version and config

## 📊 Current Warnings

After running linter, you'll see some warnings for:
- Unused imports (clean up manually)
- Unused variables (clean up or prefix with `_`)
- React Hook dependencies (add missing deps or add comment to ignore)

These are **warnings**, not errors, so they won't break your build.

## 🔄 Updating Configuration

### Change Prettier Rules
Edit `.prettierrc`:
```json
{
  "printWidth": 100,  // Change from 90 to 100
  "semi": false       // Remove semicolons
}
```

Then reformat:
```bash
npm run format
```

### Change ESLint Rules
Edit `.eslintrc.json`:
```json
{
  "rules": {
    "no-console": "warn"  // Warn on console.log
  }
}
```

### Ignore Specific Files
Add to `.prettierignore` or `.eslintignore`

## 📚 Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Next.js ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [Prettier Options](https://prettier.io/docs/en/options.html)

## ✨ Summary

**Your code is now formatted and linted!**

- ✅ Prettier installed and configured
- ✅ ESLint integrated with Prettier
- ✅ VS Code auto-format on save configured
- ✅ All code formatted with `npm run format`
- ✅ NPM scripts available for formatting and linting

**Next time**, just run:
```bash
npm run format:lint
```

---

**Last Updated**: October 4, 2025  
**Status**: ✅ Configured and Ready

