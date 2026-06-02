import { createContext, useContext } from 'react'
import type { Category, Product } from '../api/types'

export interface ShopState {
  products: Product[]
  categories: Category[]
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