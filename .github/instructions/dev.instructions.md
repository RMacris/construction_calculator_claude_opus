---
applyTo: "**/*.ts, **/*.js, **/*.tsx"
description: "Development Guidelines"
---

# Development Guidelines

## Code Quality

- Top of each edited file: short comment — what file do, how work.
- Clean, production-ready code. Clarity first.
- **DRY**: no duplicate logic. Centralize shared behavior.
- **SOLID**: one responsibility per component, function, service.
- Always type code. No `any`. Use explicit types.
- Clean Code principles: meaningful names, small functions, clear structure.

## Naming

- Descriptive, human-readable names. Always.
- Name express *what handled* or *what action performed*.
- No abbreviations. No vague names (`data`, `temp`, `fn`, `ctx`, `x`, `val`).
- Functions read like actions: `fetchUserById`, `formatCurrencyValue`.
- Variables describe domain: `filteredResults`, `visibleItems`.
- Boolean variables: `is`, `has`, `should` prefix. E.g., `isLoading`, `hasError`, `shouldShowModal`.
- English only. Consistent language across codebase.

## Functions

- Small. One task. No silent failures — handle errors explicit.
- No complex one-liners. Step-by-step logic preferred.
- Easy to read, test, extend.

## Structure

- Shared logic (API calls, data fetch) → dedicated utils/services folder.
- Validators → dedicated `validators` folder. Export for reuse.
- Group by feature/domain. Not by file type.

## Data Policy

- No hard deletes. Soft delete only (`deleted_at` or `is_deleted`).