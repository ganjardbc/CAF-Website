## Context
The CommandTabs component displays terminal commands for installing and running CAF. Currently, the command prompt symbol `$` is positioned to the right of the command string inside the flexbox container, which violates standard CLI styling conventions where the prompt symbol precedes the command. We need to move the prompt symbol to the left of the command element.

- Affected file: `app/components/landing/CommandTabs.vue`

## Acceptance Criteria
- [ ] The command prompt character `$` must be rendered to the left of the command text (`code` element) inside `CommandTabs.vue`.
- [ ] The spacing and alignment between the `$` prompt and the command must look correct and clean (e.g., left-aligned with a gap instead of space-between).
- [ ] The component still compiles and works correctly on the landing page.

## Out of Scope
- Modifying other components on the landing page.
- Adding new tabs or commands to the `CommandTabs` component.

## Gaps & Ambiguities
- None.
