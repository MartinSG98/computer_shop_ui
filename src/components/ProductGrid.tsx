import { Center, SimpleGrid, Skeleton, Text } from '@mantine/core'
import { useShop } from '../context/shop-context'
import { ProductCard } from './ProductCard'

const COLS = { base: 1, sm: 2, lg: 3, xl: 4 }

export function ProductGrid() {
  const { products, loading } = useShop()

  if (loading) {
    return (
      <SimpleGrid cols={COLS} spacing="lg">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={360} radius="md" />
        ))}
      </SimpleGrid>
    )
  }

  if (products.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No products found.</Text>
      </Center>
    )
  }

  return (
    <SimpleGrid cols={COLS} spacing="lg">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  )
}