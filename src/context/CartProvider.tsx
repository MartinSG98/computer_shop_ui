import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import type { Product } from '../api/types'
import { CartContext, type CartItem, type CartState } from './cart-context'

export function CartProvider({ children }: { children: ReactNode }) {
  // Persist across reloads (and sync between tabs). Read synchronously so the
  // cart badge doesn't flash empty on first paint.
  const [items, setItems] = useLocalStorage<CartItem[]>({
    key: 'msg-cart',
    defaultValue: [],
    getInitialValueInEffect: false,
  })

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { product, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.product.id !== productId)
        : current.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  // price is a Decimal string from the API; Number() is for display totals only.
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  )

  const value = useMemo<CartState>(
    () => ({ items, itemCount, totalPrice, addItem, removeItem, setQuantity, clear }),
    [items, itemCount, totalPrice, addItem, removeItem, setQuantity, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}