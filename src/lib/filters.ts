import type { Product } from '../api/types'

/**
 * Per-category attribute filters for the shop and the configurator picker.
 *
 * Each category lists the attribute filters that apply to it. Both surfaces
 * render a MultiSelect per filter and apply them the same way, so adding filters
 * for another category is just another entry in CATEGORY_FILTERS.
 */

/** Words for the relative performance tier (1 entry to 4 flagship). */
export const TIER_LABELS: Record<number, string> = {
  1: 'Budget',
  2: 'Mainstream',
  3: 'Performance',
  4: 'Enthusiast',
}

export function tierLabel(tier?: number | null): string {
  if (tier == null) return ''
  return TIER_LABELS[tier] ?? `Tier ${tier}`
}

// Tier words in rank order, so the Tier filter lists Budget -> Enthusiast.
const TIER_ORDER = Object.keys(TIER_LABELS)
  .map(Number)
  .sort((a, b) => a - b)
  .map((t) => TIER_LABELS[t])

export interface AttributeFilter {
  /** Stable key for the selection state. */
  key: string
  /** Control label. */
  label: string
  /** Placeholder shown when nothing is selected. */
  placeholder: string
  /** The product's value for this filter, or null when the attribute is absent. */
  value: (product: Product) => string | null
  /** Optional ordering for the value list (defaults to alphabetical). */
  compare?: (a: string, b: string) => number
}

const PLATFORM_FILTER: AttributeFilter = {
  key: 'platform',
  label: 'Platform',
  placeholder: 'All platforms',
  // Brand + socket, e.g. "AMD AM5", "Intel LGA1851".
  value: (p) => (p.attributes?.socket ? `${p.brand} ${p.attributes.socket}` : null),
}

const TIER_FILTER: AttributeFilter = {
  key: 'tier',
  label: 'Tier',
  placeholder: 'All tiers',
  // The value is the tier word itself, so the control reads cleanly.
  value: (p) => tierLabel(p.attributes?.tier) || null,
  compare: (a, b) => TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b),
}

// Cooler cooling method. Catalog stores lowercase "air" / "aio".
const COOLER_TYPE_LABELS: Record<string, string> = { air: 'Air', aio: 'AIO' }
const COOLER_TYPE_ORDER = ['Air', 'AIO']

const COOLER_TYPE_FILTER: AttributeFilter = {
  key: 'cooler_type',
  label: 'Cooler type',
  placeholder: 'All types',
  value: (p) => {
    const type = p.attributes?.cooler_type
    return type ? (COOLER_TYPE_LABELS[type] ?? type) : null
  },
  compare: (a, b) => COOLER_TYPE_ORDER.indexOf(a) - COOLER_TYPE_ORDER.indexOf(b),
}

// Plain socket (not brand-prefixed like the CPU platform), e.g. "AM5", "LGA1851".
const SOCKET_FILTER: AttributeFilter = {
  key: 'socket',
  label: 'Socket',
  placeholder: 'All sockets',
  value: (p) => p.attributes?.socket ?? null,
}

const FORM_FACTOR_FILTER: AttributeFilter = {
  key: 'form_factor',
  label: 'Form factor',
  placeholder: 'All form factors',
  value: (p) => p.attributes?.form_factor ?? null,
}

const MEMORY_TYPE_FILTER: AttributeFilter = {
  key: 'memory_type',
  label: 'Memory type',
  placeholder: 'All memory types',
  value: (p) => p.attributes?.memory_type ?? null,
}

/** Attribute filters per category slug. Categories not listed have none. */
export const CATEGORY_FILTERS: Record<string, AttributeFilter[]> = {
  processors: [PLATFORM_FILTER, TIER_FILTER],
  'cpu-coolers': [COOLER_TYPE_FILTER],
  motherboards: [SOCKET_FILTER, FORM_FACTOR_FILTER, MEMORY_TYPE_FILTER, TIER_FILTER],
}

export function filtersForCategory(slug: string | null): AttributeFilter[] {
  return slug ? (CATEGORY_FILTERS[slug] ?? []) : []
}

/** Distinct, ordered values present for a filter across the given products. */
export function filterOptions(filter: AttributeFilter, products: Product[]): string[] {
  const values = new Set<string>()
  for (const product of products) {
    const value = filter.value(product)
    if (value) values.add(value)
  }
  return Array.from(values).sort(filter.compare ?? ((a, b) => a.localeCompare(b)))
}

/** True when the product satisfies every active (non-empty) attribute filter. */
export function matchesAttributeFilters(
  product: Product,
  filters: AttributeFilter[],
  selected: Record<string, string[]>,
): boolean {
  return filters.every((filter) => {
    const chosen = selected[filter.key]
    if (!chosen || chosen.length === 0) return true
    const value = filter.value(product)
    return value != null && chosen.includes(value)
  })
}