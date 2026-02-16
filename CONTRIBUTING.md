# Contributing to flexi

Thank you for contributing to flexi.

---

## Before You Start

1. Read [docs/POSITIONING.md](docs/POSITIONING.md) to understand what flexi is (and isn't)
2. Read [docs/RULES.md](docs/RULES.md) for non-negotiable architectural rules
3. Read [docs/BOUNDARY.md](docs/BOUNDARY.md) for flexi vs flexi-woo separation

---

## Core Principle

> **flexi is a pure rendering function: JSON in, HTML out, no side effects.**

Any code that violates this principle does not belong in flexi.

---

## Quick Reference

| Rule | Summary |
|------|---------|
| Core | JSON in, HTML out, no side effects |
| Never | Store state, make HTTP calls, or calculate prices |
| Render | Pure functions only, no state persistence |
| Validate | Zod validation required, trust nothing |
| Escape | HTML escape everything, sanitize URLs |
| Fallback | Return 503 + x-flexi-fallback on failure |
| Logs | Sanitize all logs, never log PII |
| Templates | Composable templates, no business logic |
| Performance | Render in < 100ms, no blocking operations |
| Exceptions | No "just this once" exceptions |

For complete rules, see [docs/RULES.md](docs/RULES.md).

---

## Architectural Checklist

Before submitting a PR, verify:

1. Is rendering pure and side-effect free?
2. Is all input validated with Zod schemas?
3. Is all user content HTML-escaped?
4. Does failure return 503 with `x-flexi-fallback`?
5. Are logs free of PII?

**If any answer is NO → fix it before submitting.**

---

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`yarn test`)
5. Ensure linting passes (`yarn lint`)
6. Commit your changes
7. Push to your branch
8. Open a Pull Request

---

## Code Style

- **TypeScript** with strict mode
- **ESLint** with Next.js rules
- **Tailwind CSS** for styling (see [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md))
- **Zod** for validation (see [docs/SECURITY.md](docs/SECURITY.md))

---

## Documentation Requirements

When submitting changes, update relevant documentation:

- **Code comments** - JSDoc/TSDoc for modified functions
- **docs/*.md** - Update if changing APIs, logging, security, or design patterns
- **CHANGELOG.md** - Add entry for significant changes

---

## Pull Request Guidelines

### Title Format

Use conventional commit format:

- `feat: Add category page rendering`
- `fix: Escape product names in templates`
- `docs: Update API reference`
- `refactor: Move templates to themes directory`

### Description

Include:

- What the change does
- Why it's needed
- How to test it
- Any breaking changes

---

## Anti-Patterns (Immediate Rejection)

Pull requests will be rejected if they include:

- State persistence between requests
- Outbound HTTP calls during rendering
- Unescaped user content in HTML
- Business logic in templates
- Price/tax/shipping calculations
- Unvalidated input rendering
- PII in logs
- "Just this once" exceptions

---

## Final Note

flexi's strength comes from **what it refuses to do**.

Maintaining strict boundaries allows:

- Predictable rendering behavior
- Safe operation under any input
- Clean separation from commerce logic
- Horizontal scaling without state concerns

---

## Related Documentation

- [docs/POSITIONING.md](docs/POSITIONING.md) - Project identity
- [docs/RULES.md](docs/RULES.md) - Architectural rules
- [docs/BOUNDARY.md](docs/BOUNDARY.md) - flexi/flexi-woo boundary
- [docs/API.md](docs/API.md) - API reference
- [docs/SECURITY.md](docs/SECURITY.md) - Security guidelines
- [docs/LOGGING.md](docs/LOGGING.md) - Logging documentation
- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) - UI design system
