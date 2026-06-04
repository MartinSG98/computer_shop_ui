import { Alert, Box, Button, Center, Collapse, Group, MultiSelect, Select, Stack, Text, Title } from '@mantine/core'
import { CategoryButtons } from '../components/CategoryButtons'
import { Footer } from '../components/Footer'
import { Hero } from '../components/Hero'
import { ProductGrid } from '../components/ProductGrid'
import { useShop } from '../context/shop-context'
import type { SortOrder } from '../context/shop-context'
import brandSelectClasses from '../components/BrandSelect.module.css'

export function ShopPage() {
  const {
    error,
    reload,
    categories,
    selectedCategory,
    visibleProducts,
    availableBrands,
    selectedBrands,
    setSelectedBrands,
    searchQuery,
    sortOrder,
    setSortOrder,
    loading,
  } = useShop()

  const currentTitle = selectedCategory
    ? (categories.find((c) => c.slug === selectedCategory)?.name ?? 'Products')
    : 'All products'

  const showHero = selectedCategory === null && searchQuery === ''
  const showBrandFilter = selectedCategory !== null && availableBrands.length > 1

  if (error) {
    return (
      <Center py="xl" px="md">
        <Alert color="red" title="Could not load the shop" maw={440}>
          <Stack align="flex-start">
            <Text>{error}</Text>
            <Button size="xs" variant="light" onClick={reload}>
              Retry
            </Button>
          </Stack>
        </Alert>
      </Center>
    )
  }

  return (
    <>
      <Collapse expanded={showHero} transitionDuration={300}>
        <Hero />
      </Collapse>

      {/* Full-width tab strip attached to the hero edge. */}
      <CategoryButtons />

      <Box px="md" py="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={2}>{currentTitle}</Title>
            <Group gap="sm" align="center">
              {!loading && (
                <Text c="dimmed" size="sm">
                  {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                </Text>
              )}
              {showBrandFilter && (
                <MultiSelect
                  size="xs"
                  w={190}
                  classNames={{ inputField: brandSelectClasses.input }}
                  placeholder={selectedBrands.length ? undefined : 'All brands'}
                  aria-label="Filter by brand"
                  data={availableBrands}
                  value={selectedBrands}
                  onChange={setSelectedBrands}
                  clearable
                />
              )}
              <Select
                size="xs"
                w={180}
                aria-label="Sort by price"
                value={sortOrder}
                onChange={(value) => value && setSortOrder(value as SortOrder)}
                allowDeselect={false}
                data={[
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                ]}
              />
            </Group>
          </Group>

          <ProductGrid />
        </Stack>
      </Box>

      <Footer />
    </>
  )
}