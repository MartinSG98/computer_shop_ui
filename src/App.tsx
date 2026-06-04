import {
  Alert,
  AppShell,
  Burger,
  Button,
  Center,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { Cart } from './components/Cart'
import { CategoryNav } from './components/CategoryNav'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { ProductGrid } from './components/ProductGrid'
import { useShop } from './context/shop-context'
import type { SortOrder } from './context/shop-context'

function App() {
  const [opened, { toggle }] = useDisclosure()
  const {
    error,
    reload,
    categories,
    selectedCategory,
    visibleProducts,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    loading,
  } = useShop()

  const currentTitle = selectedCategory
    ? (categories.find((c) => c.slug === selectedCategory)?.name ?? 'Products')
    : 'All products'

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="md" wrap="nowrap">
          {/* Left: brand */}
          <Group style={{ flex: 1 }} gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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

          {/* Center: search (equal-flex sides keep it centered) */}
          <TextInput
            placeholder="Search products..."
            leftSection={<IconSearch size={16} />}
            radius="xl"
            visibleFrom="sm"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1, maxWidth: 460 }}
          />

          {/* Right: actions */}
          <Group style={{ flex: 1 }} justify="flex-end" gap="sm" wrap="nowrap">
            <Cart />
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <CategoryNav />
      </AppShell.Navbar>

      <AppShell.Main>
        {error ? (
          <Center py="xl">
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
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={2}>{currentTitle}</Title>
              <Group gap="sm" align="center">
                {!loading && (
                  <Text c="dimmed" size="sm">
                    {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                  </Text>
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
        )}
      </AppShell.Main>
    </AppShell>
  )
}

export default App