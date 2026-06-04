import {
  Alert,
  AppShell,
  Box,
  Button,
  Center,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { Cart } from './components/Cart'
import { CategoryButtons } from './components/CategoryButtons'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { useShop } from './context/shop-context'
import type { SortOrder } from './context/shop-context'
import brandSelectClasses from './components/BrandSelect.module.css'

function App() {
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
    setSearchQuery,
    sortOrder,
    setSortOrder,
    loading,
  } = useShop()

  const currentTitle = selectedCategory
    ? (categories.find((c) => c.slug === selectedCategory)?.name ?? 'Products')
    : 'All products'

  const showHero = selectedCategory === null && searchQuery === ''
  const showBrandFilter = selectedCategory !== null && availableBrands.length > 1

  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" gap="md" wrap="nowrap">
          <Group style={{ flex: 1 }} gap="sm" wrap="nowrap">
            <Stack gap={0}>
              <Text
                fw={800}
                fz="lg"
                lh={1.1}
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
              >
                MSG Computers
              </Text>
              <Text fz={10} fw={600} c="dimmed" tt="uppercase" lts={1} lh={1}>
                PC parts &amp; builds
              </Text>
            </Stack>
          </Group>

          <TextInput
            placeholder="Search products..."
            leftSection={<IconSearch size={16} />}
            radius="xl"
            visibleFrom="sm"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1, maxWidth: 460 }}
          />

          <Group style={{ flex: 1 }} justify="flex-end" gap="sm" wrap="nowrap">
            <Cart />
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {error ? (
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
        ) : (
          <>
            {showHero && <Hero />}

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
        )}
      </AppShell.Main>
    </AppShell>
  )
}

export default App