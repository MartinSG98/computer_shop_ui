import { useMemo, useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBolt,
  IconCircleCheck,
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
import { useCart } from '../context/cart-context'
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
import { evaluateBuild, issuesBySlot, severityBySlot } from '../lib/compatibility'

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
  const { addItem } = useCart()
  const [selection, setSelection] = useState<BuildSelection>({})
  const [activeSlot, setActiveSlot] = useState<BuildSlug | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const total = buildTotal(selection)
  const watts = estimatedWattage(selection)
  const filled = filledCount(selection)

  const issues = useMemo(() => evaluateBuild(selection), [selection])
  const slotSeverity = useMemo(() => severityBySlot(issues), [issues])
  const slotIssues = useMemo(() => issuesBySlot(issues), [issues])
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  const activeLabel = BUILD_SLOTS.find((s) => s.slug === activeSlot)?.label ?? ''
  const activeProducts = activeSlot ? products.filter((p) => p.category === activeSlot) : []

  const select = (product: Product) => {
    if (!activeSlot) return
    setSelection((current) => ({ ...current, [activeSlot]: product }))
    setActiveSlot(null)
    setJustAdded(false)
  }

  const clear = (slug: BuildSlug) => {
    setSelection((current) => {
      const next = { ...current }
      delete next[slug]
      return next
    })
    setJustAdded(false)
  }

  const addBuild = () => {
    Object.values(selection).forEach((product) => {
      if (product) addItem(product)
    })
    setConfirmOpen(false)
    setJustAdded(true)
  }

  // Hard errors trigger a confirm step; otherwise add straight to the cart.
  const handleAddToCart = () => {
    if (errors.length > 0) {
      setConfirmOpen(true)
      return
    }
    addBuild()
  }

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
                const sev = slotSeverity[slug]
                return (
                  <Paper
                    key={slug}
                    withBorder
                    radius="md"
                    p="md"
                    style={
                      sev
                        ? { borderColor: sev === 'error' ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-yellow-5)' }
                        : undefined
                    }
                  >
                    <Group justify="space-between" wrap="nowrap" gap="md">
                      <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                        <ThemeIcon variant="light" size={42} radius="md">
                          <Icon size={22} />
                        </ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                          <Group gap={6} wrap="nowrap">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5}>
                              {label}
                            </Text>
                            {sev && (
                              <Tooltip
                                multiline
                                w={260}
                                withArrow
                                label={
                                  <Stack gap={4}>
                                    {(slotIssues[slug] ?? []).map((issue, i) => (
                                      <Text key={i} size="xs">
                                        {issue.message}
                                      </Text>
                                    ))}
                                  </Stack>
                                }
                              >
                                {sev === 'error' ? (
                                  <IconAlertTriangle
                                    size={14}
                                    color="var(--mantine-color-red-6)"
                                    style={{ cursor: 'help' }}
                                  />
                                ) : (
                                  <IconAlertCircle
                                    size={14}
                                    color="var(--mantine-color-yellow-6)"
                                    style={{ cursor: 'help' }}
                                  />
                                )}
                              </Tooltip>
                            )}
                          </Group>
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

                {(errors.length > 0 || warnings.length > 0) && (
                  <Stack gap={6}>
                    {errors.map((issue, i) => (
                      <Group key={`e${i}`} gap={8} wrap="nowrap" align="flex-start">
                        <IconAlertTriangle
                          size={16}
                          color="var(--mantine-color-red-6)"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <Text size="xs">{issue.message}</Text>
                      </Group>
                    ))}
                    {warnings.map((issue, i) => (
                      <Group key={`w${i}`} gap={8} wrap="nowrap" align="flex-start">
                        <IconAlertCircle
                          size={16}
                          color="var(--mantine-color-yellow-6)"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <Text size="xs">{issue.message}</Text>
                      </Group>
                    ))}
                  </Stack>
                )}

                {issues.length === 0 && filled === BUILD_SLOTS.length && (
                  <Group gap={8} wrap="nowrap" align="flex-start">
                    <IconCircleCheck size={18} color="var(--mantine-color-teal-6)" style={{ flexShrink: 0 }} />
                    <Text size="sm" c="teal">
                      Everything's compatible. Your build is ready to order.
                    </Text>
                  </Group>
                )}

                {issues.length === 0 && filled > 0 && filled < BUILD_SLOTS.length && (
                  <Text size="xs" c="dimmed">
                    No conflicts so far ({filled}/{BUILD_SLOTS.length} parts selected).
                  </Text>
                )}

                <Button
                  fullWidth
                  mt="xs"
                  leftSection={<IconShoppingCart size={18} />}
                  disabled={filled === 0}
                  onClick={handleAddToCart}
                >
                  Add build to cart
                </Button>
                {justAdded ? (
                  <Text size="xs" c="teal" ta="center">
                    Added to your cart.
                  </Text>
                ) : (
                  <Text size="xs" c="dimmed" ta="center">
                    Adds every selected part to your cart.
                  </Text>
                )}
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

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="This build has compatibility problems"
        centered
      >
        <Stack gap="md">
          <Text size="sm">These parts may not work together:</Text>
          <Stack gap={8}>
            {errors.map((issue, i) => (
              <Group key={`ce${i}`} gap={8} wrap="nowrap" align="flex-start">
                <IconAlertTriangle
                  size={16}
                  color="var(--mantine-color-red-6)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <Text size="sm">{issue.message}</Text>
              </Group>
            ))}
            {warnings.map((issue, i) => (
              <Group key={`cw${i}`} gap={8} wrap="nowrap" align="flex-start">
                <IconAlertCircle
                  size={16}
                  color="var(--mantine-color-yellow-6)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <Text size="sm">{issue.message}</Text>
              </Group>
            ))}
          </Stack>
          <Text size="sm" c="dimmed">
            You can still add these parts to your cart if you know what you're doing.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={addBuild}>
              Add anyway
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}