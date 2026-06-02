import { createContext, useContext } from 'react'
import type { Category, Product } from '../api/types'

export interface ShopState {
  products: Product[]
  categories: Category[]
  /** Products after applying the selected-category filter. */
  visibleProducts: Product[]
  /** Selected category slug, or null for "all products". */
  selectedCategory: string | null
  setSelectedCategory: (slug: string | null) => void
  loading: boolean
  error: string | null
  /** Re-fetch categories and products (e.g. for a retry button). */
  reload: () => void
}

export const ShopContext = createContext<ShopState | null>(null)

/** Access shop data. Throws if used outside <ShopProvider>. */
export function useShop(): ShopState {
  const ctx = useContext(ShopContext)
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return ctx
}