import { Alert, AppShell, Burger, Button, Center, Group, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDeviceDesktop } from '@tabler/icons-react'
import { CategoryNav } from './components/CategoryNav'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { ProductGrid } from './components/ProductGrid'
import { useShop } from './context/shop-context'

function App() {
  const [opened, { toggle }] = useDisclosure()
  const { error, reload, categories, selectedCategory, visibleProducts, loading } = useShop()

  const currentTitle = selectedCategory
    ? (categories.find((c) => c.slug === selectedCategory)?.name ?? 'Products')
    : 'All products'

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconDeviceDesktop color="var(--mantine-color-indigo-6)" />
            <Title order={3}>Computer Shop</Title>
          </Group>
          <ColorSchemeToggle />
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
            <Group justify="space-between" align="baseline">
              <Title order={2}>{currentTitle}</Title>
              {!loading && (
                <Text c="dimmed" size="sm">
                  {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
                </Text>
              )}
            </Group>
            <ProductGrid />
          </Stack>
        )}
      </AppShell.Main>
    </AppShell>
  )
}

export default App