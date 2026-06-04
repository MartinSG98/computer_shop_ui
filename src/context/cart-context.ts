import { createContext, useContext } from 'react'
import type { Product } from '../api/types'

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  /** Total number of units across all items (for the header badge). */
  itemCount: number
  /** Cart total as a number, for display formatting. */
  totalPrice: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

export const CartContext = createContext<CartState | null>(null)

/** Access the cart. Throws if used outside <CartProvider>. */
export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}