import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCategories, getProducts } from '../api/client'
import type { Category, Product } from '../api/types'
import { ShopContext, type ShopState, type SortOrder } from './shop-context'

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('price-asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Categories and the full assortment load together on app start.
      const [loadedCategories, loadedProducts] = await Promise.all([
        getCategories(),
        getProducts(),
      ])
      setCategories(loadedCategories)
      setProducts(loadedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shop data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const visibleProducts = useMemo(() => {
    const filtered =
      selectedCategory === null
        ? products
        : products.filter((product) => product.category === selectedCategory)
    // price is a Decimal string from the API; compare numerically for sorting only.
    const sorted = [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
    return sortOrder === 'price-desc' ? sorted.reverse() : sorted
  }, [products, selectedCategory, sortOrder])

  const value = useMemo<ShopState>(
    () => ({
      products,
      categories,
      visibleProducts,
      selectedCategory,
      setSelectedCategory,
      sortOrder,
      setSortOrder,
      loading,
      error,
      reload,
    }),
    [products, categories, visibleProducts, selectedCategory, sortOrder, loading, error, reload],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}