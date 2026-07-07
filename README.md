# Computer Shop UI - https://dxxggszhxub5x.cloudfront.net or msg-computers.com

React + Vite + TypeScript + Mantine frontend for the Computer Shop. It uses
react-router for three routes:

- **Shop** (`/`): loads the assortment and categories from the API on startup,
  with category, brand, and per-category attribute filters (for example CPU
  platform and tier, GPU vendor and VRAM, storage type and capacity, PSU
  efficiency), price sorting, a product detail modal, and a cart that persists in
  localStorage.
- **PC builder** (`/build`): pick a part for each of the 8 build slots from a
  searchable, filterable picker (name/brand search, the same per-category
  attribute filters as the shop, price sort, specs on hover), with a running
  total and estimated power draw. A compatibility engine flags errors and warnings (socket,
  RAM, clearances, PSU wattage, and so on) inline and in the summary, plus blue
  balance tips for overkill and bottlenecks. Once all 8 slots are filled, an
  optional evaluator scores the build 0 to 100 for a chosen use case and
  resolution (asked one at a time in a small modal), shown on an animated
  speedometer gauge, alongside catalog grounded improvement suggestions. The
  finished build adds to the cart, and is saved in localStorage so it survives
  navigation and reload.
- **Admin dashboard** (`/admin`): a Cognito-gated sales dashboard for the admin
  account. KPI cards, a revenue trend chart, top products, sales by category, top
  customers, sales over time, and recent orders. A single period control (all
  time / 7 / 30 / 90 days) filters the whole dashboard, tables paginate, and
  clicking a recent order opens a drawer with its line items.

Compatibility and tips are driven by typed `attributes` and a `tier` on each
build-category product, served by the API. The per-category attribute filters
used by both the shop and the picker are defined in `src/lib/filters.ts`, so
adding a filter for another category is a single config entry.

## Accounts and admin area

The app signs in silently to a Cognito demo account. It loads as **user-normal**
(a regular shopper); the header user-icon menu switches to **user-admin**, which
unlocks the admin dashboard. Switching signs in without a form, and the Cognito
**ID token** is sent as the bearer on order and admin requests.

- **Checkout** (`POST /orders`) is public; the cart posts the order and shows an
  inline confirmation.
- **`/admin`** is gated both ways: the route redirects non-admins, and the API
  rejects admin calls that lack the admins-group token.
- The two demo accounts and the Cognito config default to the deployed pool's
  live values, so the app runs out of the box. These are throwaway demo logins
  with no real power; override per environment with the `VITE_*` variables below.

## Develop

```bash
npm install
npm run dev   # runs with no config; env vars below override the defaults
```

All build-time env vars are optional (each defaults to the deployed resource):

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL (defaults to `http://127.0.0.1:8000`) |
| `VITE_COGNITO_USER_POOL_ID` | Cognito user pool id |
| `VITE_COGNITO_CLIENT_ID` | Cognito app client id (also the JWT audience) |
| `VITE_DEMO_NORMAL_USERNAME` / `VITE_DEMO_NORMAL_PASSWORD` | user-normal demo login |
| `VITE_DEMO_ADMIN_USERNAME` / `VITE_DEMO_ADMIN_PASSWORD` | user-admin demo login |

## Deploy (CI)

`.github/workflows/deploy.yml` runs on push to `main` (and manual dispatch):
build → `aws s3 sync` to the frontend bucket → CloudFront invalidation,
authenticating via GitHub OIDC (no stored keys).

Set these repository **variables** (Settings → Secrets and variables → Actions →
Variables); values come from `terraform output` in `tf-stack-computer_shop`:

| Variable | Terraform output |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | `github_frontend_deploy_role_arn` |
| `FRONTEND_BUCKET` | `frontend_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `frontend_distribution_id` |
| `VITE_API_BASE_URL` | `api_custom_domain_url` if a custom API domain is set, else `api_url` |

---

## Vite template notes

This project was scaffolded with Vite. The notes below are from that template.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Related

Part of the Computer Shop project:

- [computer-shop-backend](https://github.com/MartinSG98/computer-shop-backend) — FastAPI backend API
- [computer-shop-build-eval](https://github.com/MartinSG98/computer-shop-build-eval) — PC build scorer + suggestions (eval Lambda)
- [computer-shop-support-agent](https://github.com/MartinSG98/computer-shop-support-agent) — customer support agent (Bedrock AgentCore Runtime)
- [tf-module-computer_shop](https://github.com/MartinSG98/tf-module-computer_shop) — Terraform infrastructure module
- [tf-stack-computer_shop](https://github.com/MartinSG98/tf-stack-computer_shop) — Terraform deployment stack
