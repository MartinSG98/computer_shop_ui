import { ActionIcon, AppShell, Box, Button, Collapse, Group, Image, Stack, Text, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconArrowLeft, IconSearch, IconTools, IconX } from '@tabler/icons-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Cart } from './Cart'
import { ColorSchemeToggle } from './ColorSchemeToggle'
import { useShop } from '../context/shop-context'

export function Layout() {
  const { searchQuery, setSearchQuery } = useShop()
  const [mobileSearchOpen, { toggle: toggleMobileSearch }] = useDisclosure(false)

  const { pathname } = useLocation()
  const onBuild = pathname.startsWith('/build')
  // The product search only filters the shop grid, so it's hidden on /build.
  const showSearch = !onBuild

  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" gap="md" wrap="nowrap">
          <Group style={{ flex: 1 }} gap="sm" wrap="nowrap">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="sm" wrap="nowrap">
                <Image src="/msg_logo.webp" alt="MSG" h={52} w="auto" fit="contain" />
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
            </Link>
          </Group>

          {showSearch && (
            <TextInput
              placeholder="Search products..."
              leftSection={<IconSearch size={16} />}
              radius="xl"
              visibleFrom="sm"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              style={{ flex: 1, maxWidth: 460 }}
            />
          )}

          <Group style={{ flex: 1 }} justify="flex-end" gap="sm" wrap="nowrap">
            {showSearch && (
              <ActionIcon
                hiddenFrom="sm"
                variant="default"
                size="lg"
                aria-label={mobileSearchOpen ? 'Close search' : 'Search'}
                onClick={toggleMobileSearch}
              >
                {mobileSearchOpen ? <IconX size={18} /> : <IconSearch size={18} />}
              </ActionIcon>
            )}
            {onBuild ? (
              <Button
                component={Link}
                to="/"
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                leftSection={<IconArrowLeft size={18} />}
              >
                Back to shop
              </Button>
            ) : (
              <Button
                component={Link}
                to="/build"
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                leftSection={<IconTools size={18} />}
              >
                Build a PC
              </Button>
            )}
            <Cart />
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {showSearch && (
          <Box hiddenFrom="sm">
            <Collapse expanded={mobileSearchOpen}>
              <Box px="md" py="sm">
                <TextInput
                  placeholder="Search products..."
                  leftSection={<IconSearch size={16} />}
                  radius="xl"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  autoFocus
                />
              </Box>
            </Collapse>
          </Box>
        )}

        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}