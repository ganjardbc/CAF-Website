# Requirements: Fix hardcoded Indonesian SEO Schema.org Description in index page

- **Ticket:** #7
- **Status:** IMPLEMENTED

## Problem
The `useSchemaOrg` configuration in `app/pages/index.vue` contains a statically defined Indonesian description: `'AI agent orchestration framework dengan governance ketat — Plan, Implement, Verify, PR, dengan checkpoint human-review wajib di setiap fase.'`. This string is not localized and will be returned on the English version of the index page.

## Acceptance Criteria
- [ ] Replace the static Indonesian description string in `useSchemaOrg` inside `app/pages/index.vue` with a localized translation.
- [ ] Ensure that both English (`en`) and Indonesian (`id`) versions of the page return the correct translation from the corresponding locale JSON file using `t('index.description')` or similar.
- [ ] Verify that the application builds successfully with `npm run build`.
