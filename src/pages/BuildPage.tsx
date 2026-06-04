import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconBolt,
  IconCpu,
  IconCpu2,
  IconDatabase,
  IconDeviceGamepad,
  IconDeviceSdCard,
  IconDevices2,
  IconShoppingCart,
  IconTemperature,
  IconX,
} from '@tabler/icons-react'
import type { Product } from '../api/types'
import { useShop } from '../context/shop-context'
import { formatPrice } from '../lib/format'
import {
  BUILD_SLOTS,
  buildTotal,
  estimatedWattage,
  filledCount,
  type BuildSelection,
  type BuildSlug,
} from '../lib/configurator'
import { SlotPickerModal } from '../components/configurator/SlotPickerModal'

const SLOT_ICONS: Record<BuildSlug, typeof IconCpu> = {
  processors: IconCpu,
  motherboards: IconCpu2,
  'cpu-coolers': IconTemperature,
  memory: IconDeviceSdCard,
  'graphics-cards': IconDeviceGamepad,
  storage: IconDatabase,
  'power-supplies': IconBolt,
  cases: IconDevices2,
}

export function BuildPage() {
  const { products } = useShop()
  const [selection, setSelection] = useState<BuildSelection>({})
  const [activeSlot, setActiveSlot] = useState<BuildSlug | null>(null)

  const total = buildTotal(selection)
  const watts = estimatedWattage(selection)
  const filled = filledCount(selection)

  const activeLabel = BUILD_SLOTS.find((s) => s.slug === activeSlot)?.label ?? ''
  const activeProducts = activeSlot ? products.filter((p) => p.category === activeSlot) : []

  const select = (product: Product) => {
    if (!activeSlot) return
    setSelection((current) => ({ ...current, [activeSlot]: product }))
    setActiveSlot(null)
  }

  const clear = (slug: BuildSlug) =>
    setSelection((current) => {
      const next = { ...current }
      delete next[slug]
      return next
    })

  return (
    <Box px="md" py="lg">
      <Stack gap="lg">
        <div>
          <Title order={2}>Build a PC</Title>
          <Text c="dimmed">Pick a part for each slot. We'll total it up and estimate the power draw.</Text>
        </div>

        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="sm">
              {BUILD_SLOTS.map(({ slug, label }) => {
                const product = selection[slug]
                const Icon = SLOT_ICONS[slug]
                return (
                  <Paper key={slug} withBorder radius="md" p="md">
                    <Group justify="space-between" wrap="nowrap" gap="md">
                      <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                        <ThemeIcon variant="light" size={42} radius="md">
                          <Icon size={22} />
                        </ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5}>
                            {label}
                          </Text>
                          {product ? (
                            <Text fw={600} lineClamp={1}>
                              {product.name}
                            </Text>
                          ) : (
                            <Text c="dimmed">Not selected</Text>
                          )}
                        </div>
                      </Group>
                      <Group gap="sm" wrap="nowrap">
                        {product && (
                          <Text fw={700} c="violet.4" visibleFrom="xs">
                            {formatPrice(product.price, product.currency)}
                          </Text>
                        )}
                        <Button variant={product ? 'default' : 'light'} size="xs" onClick={() => setActiveSlot(slug)}>
                          {product ? 'Change' : 'Choose'}
                        </Button>
                        {product && (
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            aria-label={`Remove ${label}`}
                            onClick={() => clear(slug)}
                          >
                            <IconX size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Paper>
                )
              })}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder radius="md" p="lg" pos="sticky" top={80}>
              <Stack gap="sm">
                <Title order={4}>Summary</Title>
                <Group justify="space-between">
                  <Text c="dimmed" size="sm">
                    Parts selected
                  </Text>
                  <Text fw={600}>
                    {filled}/{BUILD_SLOTS.length}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed" size="sm">
                    Est. power draw
                  </Text>
                  <Text fw={600}>{watts} W</Text>
                </Group>
                <Divider />
                <Group justify="space-between" align="center">
                  <Text fw={600}>Total</Text>
                  <Text fw={800} fz="xl" c="violet.4">
                    {formatPrice(total.toFixed(2), 'USD')}
                  </Text>
                </Group>
                <Button fullWidth mt="xs" leftSection={<IconShoppingCart size={18} />} disabled>
                  Add build to cart
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  Compatibility checks and checkout coming next.
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>

      <SlotPickerModal
        opened={activeSlot !== null}
        label={activeLabel}
        products={activeProducts}
        onSelect={select}
        onClose={() => setActiveSlot(null)}
      />
    </Box>
  )
}