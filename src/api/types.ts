/** Wire types mirroring the Computer Shop API responses (snake_case as sent). */

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
}

export interface Category {
  slug: string
  name: string
  description: string
  sort_order: number
  image_url: string | null
}