/** Wire types mirroring the Computer Shop API responses (snake_case as sent). */

/**
 * Typed, build-relevant attributes used by the PC configurator. Flat and all
 * optional: each product fills only the fields relevant to its category.
 * Mirrors the backend CompatAttributes model.
 */
export interface CompatAttributes {
  socket?: string
  tdp_w?: number
  has_igpu?: boolean
  sockets?: string[]
  cooler_type?: string
  height_mm?: number
  radiator_mm?: number
  tdp_rating_w?: number
  form_factor?: string
  memory_type?: string
  memory_slots?: number
  memory_max_gb?: number
  m2_slots?: number
  modules?: number
  capacity_gb?: number
  speed_mts?: number
  length_mm?: number
  recommended_psu_w?: number
  storage_form_factor?: string
  interface?: string
  wattage_w?: number
  form_factors?: string[]
  max_gpu_length_mm?: number
  max_cooler_height_mm?: number
  max_radiator_mm?: number
  psu_form_factors?: string[]
  /** Relative tier (1 entry to 4 flagship) on CPUs, GPUs and motherboards. */
  tier?: number
}

export interface Product {
  id: string
  name: string
  brand: string
  /** Category slug; references Category.slug. */
  category: string
  /** Decimal serialized as a string by the API to preserve precision. */
  price: string
  currency: string
  stock: number
  description: string
  specs: Record<string, string>
  image_url: string | null
  /** Present only on the 8 buildable categories; null/absent for peripherals. */
  attributes?: CompatAttributes | null
}

export interface Category {
  slug: string
  name: string
  description: string
  sort_order: number
  image_url: string | null
}

export type UseCase = 'gaming' | 'content' | 'everyday'
export type Resolution = '1080p' | '1440p' | '4k'

/** Response from the build evaluator (POST /evaluate). */
export interface EvaluateResult {
  /** 0-100 build-quality score for the given use case and resolution. */
  score: number
  errors: string[]
  warnings: string[]
}