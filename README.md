# Computer Shop UI

![CI](https://github.com/MartinSG98/computer_shop_ui/actions/workflows/ci.yml/badge.svg)

React storefront for Computer Shop, a PC parts web shop that trades as MSG Computers. You browse the catalogue by category, filter each category by the specs that matter for it, and check out from a cart. The PC configurator lets you pick a part for each of eight slots, flags parts that do not fit together, and can score the finished build for what you want to do with it. A support chat answers questions about the catalogue, prices and stock, and switching to the admin account opens a sales dashboard. The shop is live at https://msg-computers.com, and the same build is served from https://dxxggszhxub5x.cloudfront.net.

This repo only holds the browser client. The catalogue, checkout, admin and chat endpoints come from [computer-shop-backend](https://github.com/MartinSG98/computer-shop-backend). Build scores come from the evaluator Lambda in [computer-shop-build-eval](https://github.com/MartinSG98/computer-shop-build-eval), and chat messages go through the backend to the agent in [computer-shop-support-agent](https://github.com/MartinSG98/computer-shop-support-agent). The AWS side, including the S3 bucket and CloudFront distribution that host this app and the Cognito pool it signs in to, is defined in [tf-module-computer_shop](https://github.com/MartinSG98/tf-module-computer_shop) and deployed by [tf-stack-computer_shop](https://github.com/MartinSG98/tf-stack-computer_shop).

Architecture decisions are recorded in [docs/adr](docs/adr/README.md), one numbered file per decision. The ones that cut across the whole system (cost, admin auth, module versioning) live in the [module's docs/adr](https://github.com/MartinSG98/tf-module-computer_shop/tree/main/docs/adr).

## Running locally

Requires Node 22 or newer (the version CI builds with) and the backend running on port 8000.

```bash
npm install
npm run dev
```

The dev server starts on http://localhost:5173, Vite's default, and calls the API at `VITE_API_BASE_URL`, which defaults to `http://127.0.0.1:8000`. That is where the backend listens when you start it with `uvicorn app.main:app --reload`, and its default CORS settings already allow port 5173. If the API cannot be reached, the shop says so and offers a retry. Product photos only appear when the backend has `CDN_BASE_URL` set. Without it the cards show a placeholder icon.

Against a local backend the catalogue, cart, checkout and admin dashboard all work. Three things lean on the deployed system:

- **Build scoring.** `POST /evaluate` is an API Gateway route to the separate evaluator Lambda, not a backend endpoint, so the Evaluate build button only works with `VITE_API_BASE_URL` pointing at the deployed API.
- **Support chat.** The backend answers 503 until `AGENT_RUNTIME_ARN` is set, and the chat then says it is not available.
- **Sign-in.** The app signs in to Cognito on load, against the deployed demo pool unless you override it (see Configuration). The local backend skips the admin group check because there is no API Gateway in front of it.

`npm run lint` runs ESLint. `npm run build` type-checks with `tsc -b` and builds to `dist/`, and `npm run preview` serves that build on http://localhost:4173. There are no unit tests.

## Configuration

Every variable is optional and read at build time. Copy `.env.example` to `.env.local` (git-ignored) to set them.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Base URL of the API. A trailing slash is stripped |
| `VITE_COGNITO_USER_POOL_ID` | the deployed demo pool | Cognito user pool the app signs in to |
| `VITE_COGNITO_CLIENT_ID` | the deployed demo app client | Cognito app client, which is also the audience the API's JWT authorizer checks |
| `VITE_DEMO_NORMAL_USERNAME` | `user-normal` | Shopper account signed in on load |
| `VITE_DEMO_NORMAL_PASSWORD` | the demo account's password | Password of the shopper account |
| `VITE_DEMO_ADMIN_USERNAME` | `user-admin` | Admin account the account menu switches to |
| `VITE_DEMO_ADMIN_PASSWORD` | the demo account's password | Password of the admin account |

The Cognito defaults live in `src/auth/cognito.ts`. For another deployment, the pool and client ids come from the stack's `cognito_user_pool_id` and `cognito_app_client_id` outputs. The demo passwords are bundled on purpose so the account switch needs no form. Both accounts are throwaway logins that can only open this demo's dashboard ([ADR 0001](docs/adr/0001-spa-cognito-auth.md)).

## Look and stack

React 19, Vite 6, TypeScript 5.8 and react-router 7. Components come from [Mantine](https://mantine.dev) 9 with Tabler icons, the revenue chart is Mantine Charts on Recharts, and sign-in uses amazon-cognito-identity-js. Styles that belong to one component live in a CSS Module next to it.

The theme in `src/theme.ts` opens in dark mode on near-black surfaces with a faint cool tint, and violet is the accent colour. The logo text, the main buttons and the hero use a violet to grape gradient. A button in the header switches to light mode. Text is Inter, loaded from Google Fonts.

On a phone the product search folds into a header icon, the shop gets a sticky Build a PC bar at the bottom, and the chat opens full screen.

## Screens

| Route | Screen |
|---|---|
| `/` | The shop. A hero with four random featured products, rotating every four seconds, shows until you pick a category or search. Under it sit a strip of category tabs and the product grid, sorted by price either way. Inside a category you can filter by brand and by that category's attributes. A card opens a detail modal with the full spec list and the stock count |
| `/build` | The PC configurator: the eight slots, the build evaluator, and a summary with the total, the estimated power draw and every compatibility issue (see below) |
| `/admin` | The sales dashboard, for the admin account only. It waits for the silent sign-in, then sends anyone else back to `/` |

The header holds the MSG Computers logo, the product search (hidden on `/build`), a Build a PC or Back to shop button, the cart, the account menu and the colour scheme toggle. The search matches product names and brands.

The cart is a drawer where you change quantities or remove lines. Checkout posts the product ids and quantities, the server prices the order from the catalogue, and the drawer shows the order id and total. The cart lives in `localStorage` under `msg-cart`, so it survives reloads and stays in sync between tabs.

## The configurator

The slots, in build order, are processor, motherboard, CPU cooler, memory, graphics card, storage, power supply and case. Choose opens a picker with only that category, searchable by name or brand, with the same brand and attribute filters as the shop, a price sort, and the specs on hover. The build is kept in `localStorage` under `msg-build` as product ids and matched against the live catalogue on load, so its prices are never stale.

The estimated power draw is the CPU's TDP plus the GPU's TDP plus 100 W for the board, memory, drives and fans. The compatibility rules in `src/lib/compatibility.ts` read the typed `attributes` the API sends with every part in the eight build categories. Each rule only runs when both parts and the data it needs are present, so a half-finished build never shows false alarms.

| Check | Severity |
|---|---|
| The CPU socket matches the motherboard | error |
| The cooler supports the CPU socket | error |
| An air cooler fits under the case's cooler height limit | error |
| An AIO radiator fits the case | error |
| The memory type matches the motherboard | error |
| The memory kit has no more sticks than the board has slots | error |
| The case takes the motherboard's form factor | error |
| The graphics card fits the case's GPU length limit | error |
| The case takes the power supply's form factor | error |
| The power supply covers the estimated draw | error below it, warning with less than 20 percent headroom |
| The cooler's rating covers the CPU's TDP | warning |
| The memory capacity is within the board's maximum | warning |
| A CPU without integrated graphics has a graphics card | warning |
| The power supply is more than twice the draw | tip |
| The motherboard is two or more tiers above the CPU | tip |
| The graphics card is two or more tiers above the CPU | tip |
| The cooler is rated at 2.5 times the CPU's TDP or more | tip |

Errors are red, warnings yellow and tips blue, both on the slot's border and in the summary. Tiers run from 1 to 4 (Budget, Mainstream, Performance, Enthusiast) and come from the API on every CPU, motherboard and graphics card. Adding a build with errors to the cart asks you to confirm first.

Once all eight slots are filled, Evaluate build asks two questions in a small modal:

1. **What will you use this PC for?** Gaming, content creation, or everyday and office work.
2. **What resolution do you target?** 1080p, 1440p or 4K.

The parts and both answers go to `POST /evaluate`. The score, from 0 to 100, animates onto a speedometer gauge where 0-39 is Underpowered, 40-69 Capable and 70-100 Excellent. Up to three suggestions, grounded in what the shop sells, sit under it. Asking again with the same parts and answers does not call the evaluator a second time.

## Shop filters

The attribute filters are defined once in `src/lib/filters.ts` and used by both the shop and the configurator's picker. A filter only appears when the category has more than one value for it, and adding one for another category is a single entry in `CATEGORY_FILTERS`.

| Category | Filters |
|---|---|
| Processors | Platform (brand and socket, such as AMD AM5), tier |
| CPU coolers | Cooler type (air or AIO) |
| Motherboards | Socket, form factor, memory type, tier |
| Memory | Memory type |
| Graphics cards | GPU vendor (read from the product name), tier, VRAM |
| Storage | Type (NVMe SSD, SATA SSD or HDD), capacity, interface |
| Power supplies | 80 PLUS efficiency, form factor, wattage band (under 650 W, 650-850 W, 850-1000 W, over 1000 W) |
| Cases | Form factor |

Monitors, keyboards, mice and headsets only get the brand filter, which appears in any category with more than one brand.

## Accounts and the admin dashboard

The app signs in silently as `user-normal` when it loads. The account menu in the header switches to `user-admin` with one click and no form, and once you are the admin it links to the dashboard. Sign-in runs `USER_PASSWORD_AUTH` from the browser. The Cognito ID token goes out as the bearer on the admin calls, because it carries both the `aud` claim the API Gateway authorizer checks and the `cognito:groups` claim the backend reads. Checkout is a public route and sends no token. amazon-cognito-identity-js reads Node's `global` when it loads, so `index.html` defines `window.global` before the app starts.

The dashboard shows:

- **KPI cards** for revenue, orders, average order value and units sold.
- **Top products**, the ten best sellers by units, each with a bar.
- **Sales by category**, with units and revenue.
- **Top customers**, the ten biggest spenders, with their order count.
- **Sales over time**, an area chart and a daily table with ten rows a page.
- **Recent orders**, ten a page. Clicking one opens a drawer with its line items.

The period select at the top (all time, or the last 7, 30 or 90 days) drives everything except recent orders, which have a period select of their own. Every figure except sales over time is computed in the browser from `GET /admin/orders`. The daily series comes from `GET /admin/overview` ([ADR 0002](docs/adr/0002-client-side-dashboard-aggregation.md)). Amounts show in US dollars.

## Support chat

A chat button, floating on desktop and in the header on phones, opens the support assistant, Nova.

- The greeting is written in the client, so opening the chat costs no model call.
- Each page visit gets one session id, a random UUID, which the agent uses to thread the conversation. The chat is mounted in the layout, so the conversation survives moving between pages.
- Messages are capped at 500 characters, the same limit as the backend, and a counter appears from 400.
- When a reply mentions Build a PC, a button under it opens the configurator.
- A 503 from the API shows "Chat isn't available right now". Any other failure asks you to try again in a moment.

## API calls

| Method | Path | Used by |
|---|---|---|
| GET | `/categories` | The shop, once on load |
| GET | `/products` | The shop and the configurator, the whole catalogue once on load |
| POST | `/orders` | Checkout, with product ids, quantities and the signed-in username as a label |
| POST | `/chat` | The support chat, with the message and the session id |
| POST | `/evaluate` | Evaluate build, with the eight parts, the use case and the resolution |
| GET | `/admin/overview` | The dashboard's sales over time, with the ID token |
| GET | `/admin/orders` | Every other dashboard figure, with the ID token |

The response shapes are kept by hand in `src/api/types.ts`.

## Deployment

`.github/workflows/ci.yml` runs `npm run lint` and `npm run build` on Node 22 for every push to `main` and every pull request.

`.github/workflows/deploy.yml` runs on every push to `main` that changes more than Markdown files, and on manual dispatch. It installs with `npm ci`, builds with `VITE_API_BASE_URL` taken from a repository variable, assumes the frontend deploy role through GitHub OIDC (no AWS keys are stored), syncs `dist/` into the frontend bucket with `aws s3 sync --delete`, and invalidates `/*` on the CloudFront distribution. The Cognito variables are not set in CI, so the build uses the defaults in `src/auth/cognito.ts`. CloudFront answers 403 and 404 with `index.html`, so deep links such as `/build` load the app.

The repository variables come from `terraform output` in tf-stack-computer_shop. The workflow strips stray whitespace from them before use.

| Variable | Terraform output |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `github_frontend_deploy_role_arn` |
| `FRONTEND_BUCKET` | `frontend_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `frontend_distribution_id` |
| `VITE_API_BASE_URL` | `api_custom_domain_url` when the API has a custom domain, otherwise `api_url` |

## Structure

```
src/
├── main.tsx            Mantine (dark by default), the router and the auth, shop and cart providers
├── App.tsx             the three routes inside the shared layout
├── theme.ts            Mantine theme: violet accent, custom dark scale, Inter
├── api/                client.ts (every API call and the bearer token) and types.ts (the API shapes)
├── auth/cognito.ts     Cognito config, the demo accounts and the sign-in helper
├── context/            auth, shop (catalogue, filters, search, sort) and cart (localStorage) state
├── pages/              ShopPage, BuildPage, AdminPage
├── components/         header layout, hero, category tabs, product grid, card and detail modal,
│   │                   cart, account menu, colour scheme toggle, footer
│   ├── chat/           the support chat widget
│   └── configurator/   slot picker, evaluate modal, score gauge, suggestion list
└── lib/                compatibility rules, build slots and wattage, attribute filters, price formatting
public/                 logo, wordmark and icons
docs/adr/               architecture decision records
.github/workflows/      ci.yml (lint and build) and deploy.yml (S3 and CloudFront)
```
