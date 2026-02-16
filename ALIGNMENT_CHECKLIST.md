# ALIGNMENT_CHECKLIST.md
Purpose: Prevent architectural drift across flx, flexi, flx-woo, and flexi-woo.

Alignment Baseline Established: 2026-02-15
All four repos must conform to this document.

------------------------------------------------------------
1. VALIDATION CONTRACT RULES (CRITICAL)
------------------------------------------------------------

1.1 Location
Validation logic must live in:

  src/core/schemas/validation.ts

Never place validation logic in adapter/.

1.2 Function Name
All Next.js apps must export:

  export function validateRequest(...)

No alternative names (e.g. validateFlxRequest).

1.3 Fallback Behavior (NON-NEGOTIABLE)

On validation failure:

flx:
  - HTTP status: 503
  - Header: x-flx-fallback
  - JSON body:
      {
        "reason": "<reason>",
        "message": "<human readable>",
        "details": [...]
      }

flexi:
  - HTTP status: default 503
  - Header: x-flexi-fallback
  - Same JSON body structure

Never change:
  - Status code (503)
  - JSON key "reason"
  - Header names without updating plugins

------------------------------------------------------------
2. PLUGIN FALLBACK HANDLING RULES
------------------------------------------------------------

flx-woo:
  - Must accept 503
  - Must read x-flx-fallback header first
  - Must fallback to JSON body reason if header missing
  - Must enforce allowlist

flexi-woo:
  - Must read x-flexi-fallback header
  - Must map raw reason to canonical reason
  - Must not rely solely on JSON parsing

------------------------------------------------------------
3. SCHEMA NAMING CONVENTION
------------------------------------------------------------

3.1 Zod Schema Constants
  camelCase only
    productDataSchema
    routeRequestSchema

3.2 TypeScript Types
  PascalCase
    ProductData
    RouteRequest

3.3 Deprecated Aliases (flexi only)
PascalCase schema constants exist temporarily:

  /** @deprecated */
  export const ProductDataSchema = productDataSchema;

Rules:
  - New code must use camelCase
  - Deprecated aliases must be removed later

------------------------------------------------------------
4. DIRECTORY STRUCTURE RULES
------------------------------------------------------------

4.1 Next.js Apps (flx + flexi)

Required structure:

  src/
    adapter/
    app/
    core/
      config/
      schemas/
      types/
      utils/
    themes/
      storefront/
        components/

Rules:
  - No storefront/global/
  - No adapter/validation/
  - Infra types belong under adapter/
  - Domain types belong in core/types

4.2 WordPress Plugins

flx-woo:
  - Has Rest/ directory
  - Defines FLX_WOO_REST_NAMESPACE
  - Registers REST routes

flexi-woo:
  - No REST endpoints currently
  - No REST namespace constants
  - Add namespace only when endpoints are implemented

------------------------------------------------------------
5. FALLBACK REASON GOVERNANCE
------------------------------------------------------------

If adding a new fallback reason in flx or flexi:

You must also:
  - Update flx-woo allowlist
  - Update flexi-woo mapping table
  - Add PHPUnit test

No silent additions.

------------------------------------------------------------
6. SCAFFOLDING POLICY (flexi-woo)
------------------------------------------------------------

Routes:
  /api/v1/cart
  /api/v1/checkout
  /api/v1/thank-you

Currently unimplemented in flexi.

Rules:
  - Must contain @todo
  - Must log debug message
  - Must return false to fall back
  - Remove TODO only when endpoints exist

------------------------------------------------------------
7. DEAD CODE POLICY
------------------------------------------------------------

Before adding:
  - REST constants
  - New top-level folders
  - Reserved configuration

Ask:
  Is this consumed now?

If not consumed:
  - Do not add
  - Or clearly mark as @todo reserved

------------------------------------------------------------
8. REQUIRED VERIFICATION BEFORE MERGE
------------------------------------------------------------

Next.js:
  yarn typecheck
  yarn test

WordPress:
  php vendor/bin/phpunit

For fallback changes:
  grep -rn "x-flx-fallback"
  grep -rn "x-flexi-fallback"

------------------------------------------------------------
9. WHAT MUST NEVER DRIFT
------------------------------------------------------------

  - Fallback JSON body shape
  - Fallback status code (503)
  - Validation function location
  - Schema naming convention
  - Directory symmetry between flx and flexi

------------------------------------------------------------
10. WHEN IN DOUBT
------------------------------------------------------------

If a refactor proposes:
  - New validation function names
  - Moving validation into adapter
  - Changing fallback status code
  - Removing allowlist logic
  - Adding REST constants without endpoints

STOP and review this checklist.
