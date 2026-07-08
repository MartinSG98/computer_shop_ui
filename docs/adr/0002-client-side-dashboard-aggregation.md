# ADR-0002: Client-side admin dashboard aggregation

- Status: Accepted
- Date: 2026-07-09

## Context

The admin dashboard shows KPIs, a revenue trend, top products, sales by category,
top customers, and recent orders, all filterable by a time period. The backend
exposes `GET /admin/overview` (whole-dataset aggregates) and `GET /admin/orders`
(the raw order list).

## Decision

Fetch the order list once and compute the period-filtered views (KPIs, top
products, sales by category, top customers) client-side from it, driven by a
single dashboard period control. The backend `overview` still supplies the
sales-over-time daily series.

## Consequences

- One period control filters the whole dashboard consistently, with no extra API
  round-trip per filter change.
- Works at demo scale (tens to low hundreds of orders). At larger scale this
  should move server-side (period query params, or paginated/aggregated
  endpoints).

## Alternatives considered

- Server-side aggregation per period (query params on `/admin/overview`): more
  correct at scale, more backend work; deferred until there is real volume.
- Using only `/admin/overview` with no client compute: its aggregates are
  whole-dataset, so the KPIs could not react to the period filter.
