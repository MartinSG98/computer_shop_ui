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

  // Primary header action; full button on desktop, icon-only on mobile to fit.
  const cta = onBuild
    ? { to: '/', label: 'Back to shop', icon: <IconArrowLeft size={18} /> }
    : { to: '/build', label: 'Build a PC', icon: <IconTools size={18} /> }

  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" gap="md" wrap="nowrap">
          <Group style={{ flex: 1 }} gap="sm" wrap="nowrap">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="sm" wrap="nowrap">
                <Image src="/msg_logo.webp" alt="MSG" h={52} w="auto" fit="contain" visibleFrom="sm" />
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
            <Button
              component={Link}
              to={cta.to}
              variant="gradient"
              gradient={{ from: 'violet', to: 'grape', deg: 135 }}
              leftSection={cta.icon}
              visibleFrom="sm"
            >
              {cta.label}
            </Button>
            {/* On shop pages the mobile build CTA is the sticky bottom bar, so the
                header only needs the icon action for "Back to shop" on /build. */}
            {onBuild && (
              <ActionIcon
                component={Link}
                to={cta.to}
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                size="lg"
                hiddenFrom="sm"
                aria-label={cta.label}
              >
                {cta.icon}
              </ActionIcon>
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

        {/* Mobile-only sticky "Build a PC" CTA, on shop pages only. The spacer
            keeps the pinned bar from covering the footer when scrolled down. */}
        {!onBuild && (
          <>
            <Box hiddenFrom="sm" h={72} />
            <Box
              hiddenFrom="sm"
              p="sm"
              style={{
                position: 'fixed',
                insetInline: 0,
                bottom: 0,
                zIndex: 100,
                background: 'var(--mantine-color-body)',
                borderTop: '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Button
                component={Link}
                to="/build"
                fullWidth
                size="md"
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                leftSection={<IconTools size={18} />}
              >
                Build a PC
              </Button>
            </Box>
          </>
        )}
      </AppShell.Main>
    </AppShell>
  )
}