import { Button, Center, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { IconSearchOff } from '@tabler/icons-react'
import { useShop } from '../context/shop-context'
import { ProductCard } from './ProductCard'

const COLS = { base: 1, sm: 2, lg: 3, xl: 4 }

export function ProductGrid() {
  const {
    visibleProducts,
    selectedCategory,
    selectedBrands,
    searchQuery,
    setSelectedCategory,
    setSelectedBrands,
    setSearchQuery,
    loading,
  } = useShop()

  if (loading) {
    return (
      <SimpleGrid cols={COLS} spacing="lg">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={360} radius="md" />
        ))}
      </SimpleGrid>
    )
  }

  if (visibleProducts.length === 0) {
    const hasFilters = searchQuery !== '' || selectedBrands.length > 0 || selectedCategory !== null

    const clearFilters = () => {
      setSearchQuery('')
      setSelectedBrands([])
      setSelectedCategory(null)
    }

    return (
      <Center py={48}>
        <Stack align="center" gap="xs" maw={360} ta="center">
          <IconSearchOff size={44} color="var(--mantine-color-dimmed)" stroke={1.5} />
          <Text fw={600} size="lg">
            No products found
          </Text>
          <Text c="dimmed" size="sm">
            {hasFilters
              ? 'Nothing matches your current filters. Try clearing them to see everything.'
              : 'There are no products to show right now.'}
          </Text>
          {hasFilters && (
            <Button variant="light" mt="xs" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Stack>
      </Center>
    )
  }

  return (
    <SimpleGrid cols={COLS} spacing="lg">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  )
}