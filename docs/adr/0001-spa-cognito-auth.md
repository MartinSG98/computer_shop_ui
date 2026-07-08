# ADR-0001: SPA Cognito auth with amazon-cognito-identity-js

- Status: Accepted
- Date: 2026-07-09

## Context

The admin area is gated by Cognito (see infra ADR-0002). The SPA needs to sign
in and attach a token to admin/order calls. For the demo, switching between the
two demo accounts should be frictionless (no login form).

## Decision

- Use `amazon-cognito-identity-js` with `USER_PASSWORD_AUTH` to sign in directly
  from the browser. An `AuthProvider` signs in as `user-normal` on load and can
  switch to `user-admin`.
- Send the Cognito **ID token** as the bearer (it carries `aud` and
  `cognito:groups`).
- Cognito config and demo credentials fall back to the deployed pool's live
  values and are overridable via `VITE_*` env vars. The passwords are bundled;
  see infra ADR-0002 for why that is acceptable for this demo.
- Define `window.global = window` in `index.html`: the library pulls in the
  `buffer` polyfill, which reads Node's `global` at load and otherwise
  white-screens the app.

## Consequences

- Account switching is a single silent sign-in, good for a demo.
- No hosted-UI redirect, so the app keeps its own look.
- Client-side auth cannot keep secrets; acceptable here (powerless demo
  accounts).

## Alternatives considered

- AWS Amplify Auth: heavier, more opinionated dependency. Rejected for size.
- Cognito Hosted UI (OAuth redirect): least code, but leaves the app's UI for
  login and cannot do the silent account switch. Rejected.
- Vite `define: { global: 'globalThis' }`: does not cover pre-bundled deps (where
  `buffer` lives), so it did not fix the white screen. Replaced by the runtime
  polyfill.
