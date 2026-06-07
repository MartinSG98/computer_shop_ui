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

// GPU chip vendor, derived from the product name (there is no dedicated field).
const VENDOR_ORDER = ['NVIDIA', 'AMD', 'Intel']
const VENDOR_FILTER: AttributeFilter = {
  key: 'vendor',
  label: 'GPU vendor',
  placeholder: 'All vendors',
  value: (p) => {
    const name = p.name
    if (/\bArc\b/i.test(name)) return 'Intel'
    if (/Radeon|\bRX\b/i.test(name)) return 'AMD'
    if (/GeForce|\bRTX\b|\bGTX\b/i.test(name)) return 'NVIDIA'
    return null
  },
  compare: (a, b) => VENDOR_ORDER.indexOf(a) - VENDOR_ORDER.indexOf(b),
}

// VRAM size from the spec string, e.g. "16GB GDDR7" -> "16GB".
const VRAM_FILTER: AttributeFilter = {
  key: 'vram',
  label: 'VRAM',
  placeholder: 'All VRAM',
  value: (p) => {
    const match = p.specs.vram?.match(/\d+/)
    return match ? `${match[0]}GB` : null
  },
  compare: (a, b) => parseInt(a) - parseInt(b),
}

// Drive type, derived: an rpm spec means a spinning HDD, otherwise the interface
// tells SSD flavor.
const DRIVE_TYPE_ORDER = ['NVMe SSD', 'SATA SSD', 'HDD']
const DRIVE_TYPE_FILTER: AttributeFilter = {
  key: 'drive_type',
  label: 'Type',
  placeholder: 'All types',
  value: (p) => {
    if (p.specs.rpm) return 'HDD'
    const iface = p.attributes?.interface
    if (iface === 'NVMe') return 'NVMe SSD'
    if (iface === 'SATA') return 'SATA SSD'
    return null
  },
  compare: (a, b) => DRIVE_TYPE_ORDER.indexOf(a) - DRIVE_TYPE_ORDER.indexOf(b),
}

// Normalize a capacity string ("500GB", "2TB") to GB for ordering.
function capacityGb(value: string): number {
  const num = parseFloat(value)
  return /TB/i.test(value) ? num * 1000 : num
}

const CAPACITY_FILTER: AttributeFilter = {
  key: 'capacity',
  label: 'Capacity',
  placeholder: 'All capacities',
  value: (p) => p.specs.capacity ?? null,
  compare: (a, b) => capacityGb(a) - capacityGb(b),
}

// Bus generation from the spec string, e.g. "PCIe 4.0 NVMe" -> "PCIe 4.0".
const INTERFACE_ORDER = ['PCIe 5.0', 'PCIe 4.0', 'SATA']
const INTERFACE_FILTER: AttributeFilter = {
  key: 'interface',
  label: 'Interface',
  placeholder: 'All interfaces',
  value: (p) => {
    const raw = p.specs.interface
    if (!raw) return null
    const pcie = raw.match(/PCIe \d(\.\d)?/i)
    if (pcie) return pcie[0]
    if (/SATA/i.test(raw)) return 'SATA'
    return raw
  },
  compare: (a, b) => INTERFACE_ORDER.indexOf(a) - INTERFACE_ORDER.indexOf(b),
}

// PSU efficiency rating (80 PLUS), worst to best.
const EFFICIENCY_ORDER = ['80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium']
const EFFICIENCY_FILTER: AttributeFilter = {
  key: 'efficiency',
  label: 'Efficiency',
  placeholder: 'All ratings',
  value: (p) => p.specs.rating ?? null,
  compare: (a, b) => EFFICIENCY_ORDER.indexOf(a) - EFFICIENCY_ORDER.indexOf(b),
}

// PSU wattage grouped into ranges rather than every exact value.
const WATTAGE_BANDS: { label: string; match: (w: number) => boolean }[] = [
  { label: 'Under 650W', match: (w) => w < 650 },
  { label: '650-850W', match: (w) => w >= 650 && w < 850 },
  { label: '850-1000W', match: (w) => w >= 850 && w <= 1000 },
  { label: '1000W+', match: (w) => w > 1000 },
]
const WATTAGE_ORDER = WATTAGE_BANDS.map((b) => b.label)
const WATTAGE_FILTER: AttributeFilter = {
  key: 'wattage',
  label: 'Wattage',
  placeholder: 'All wattages',
  value: (p) => {
    const w = p.attributes?.wattage_w
    if (w == null) return null
    return WATTAGE_BANDS.find((band) => band.match(w))?.label ?? null
  },
  compare: (a, b) => WATTAGE_ORDER.indexOf(a) - WATTAGE_ORDER.indexOf(b),
}

/** Attribute filters per category slug. Categories not listed have none. */
export const CATEGORY_FILTERS: Record<string, AttributeFilter[]> = {
  processors: [PLATFORM_FILTER, TIER_FILTER],
  'cpu-coolers': [COOLER_TYPE_FILTER],
  motherboards: [SOCKET_FILTER, FORM_FACTOR_FILTER, MEMORY_TYPE_FILTER, TIER_FILTER],
  memory: [MEMORY_TYPE_FILTER],
  'graphics-cards': [VENDOR_FILTER, TIER_FILTER, VRAM_FILTER],
  storage: [DRIVE_TYPE_FILTER, CAPACITY_FILTER, INTERFACE_FILTER],
  'power-supplies': [EFFICIENCY_FILTER, FORM_FACTOR_FILTER, WATTAGE_FILTER],
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