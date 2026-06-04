import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCategories, getProducts } from '../api/client'
import type { Category, Product } from '../api/types'
import { ShopContext, type ShopState, type SortOrder } from './shop-context'

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
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

  // Changing category clears the brand filter (brands differ per category).
  const selectCategory = useCallback((slug: string | null) => {
    setSelectedCategory(slug)
    setSelectedBrands([])
  }, [])

  const categoryProducts = useMemo(
    () =>
      selectedCategory === null
        ? products
        : products.filter((product) => product.category === selectedCategory),
    [products, selectedCategory],
  )

  const availableBrands = useMemo(
    () => Array.from(new Set(categoryProducts.map((product) => product.brand))).sort(),
    [categoryProducts],
  )

  const visibleProducts = useMemo(() => {
    const byBrand =
      selectedBrands.length === 0
        ? categoryProducts
        : categoryProducts.filter((product) => selectedBrands.includes(product.brand))
    // price is a Decimal string from the API; compare numerically for sorting only.
    const sorted = [...byBrand].sort((a, b) => Number(a.price) - Number(b.price))
    return sortOrder === 'price-desc' ? sorted.reverse() : sorted
  }, [categoryProducts, selectedBrands, sortOrder])

  const value = useMemo<ShopState>(
    () => ({
      products,
      categories,
      visibleProducts,
      selectedCategory,
      setSelectedCategory: selectCategory,
      availableBrands,
      selectedBrands,
      setSelectedBrands,
      sortOrder,
      setSortOrder,
      loading,
      error,
      reload,
    }),
    [
      products,
      categories,
      visibleProducts,
      selectedCategory,
      selectCategory,
      availableBrands,
      selectedBrands,
      sortOrder,
      loading,
      error,
      reload,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}