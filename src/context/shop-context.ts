import { createContext, useContext } from 'react'
import type { Category, Product } from '../api/types'

export type SortOrder = 'price-asc' | 'price-desc'

export interface ShopState {
  products: Product[]
  categories: Category[]
  /** Products after applying the category filter and price sort. */
  visibleProducts: Product[]
  /** Selected category slug, or null for "all products". */
  selectedCategory: string | null
  setSelectedCategory: (slug: string | null) => void
  /** Distinct brands in the current category (for the brand filter). */
  availableBrands: string[]
  /** Selected brands; empty means all brands. */
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  /** Price sort order; defaults to lowest first. */
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
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