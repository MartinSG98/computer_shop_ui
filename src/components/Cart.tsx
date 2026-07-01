import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  Drawer,
  Group,
  Image,
  Indicator,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconCheck, IconMinus, IconPlus, IconShoppingCart, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { ApiError, createOrder } from '../api/client'
import type { Order } from '../api/types'
import { useAuth } from '../context/auth-context'
import { useCart } from '../context/cart-context'
import { formatPrice } from '../lib/format'

export function Cart() {
  const [opened, { open, close }] = useDisclosure(false)
  const { items, itemCount, totalPrice, setQuantity, removeItem, clear } = useCart()
  const { username } = useAuth()
  const currency = items[0]?.product.currency ?? 'USD'

  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const handleCheckout = async () => {
    setPlacing(true)
    setError(null)
    try {
      const order = await createOrder(
        items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        username,
      )
      setPlacedOrder(order)
      clear()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed')
    } finally {
      setPlacing(false)
    }
  }

  // Reset the confirmation/error on dismiss, so reopening shows the live cart.
  const handleClose = () => {
    close()
    setPlacedOrder(null)
    setError(null)
  }

  return (
    <>
      <Indicator label={itemCount} size={16} disabled={itemCount === 0} color="indigo">
        <ActionIcon variant="default" size="lg" aria-label="Open cart" onClick={open}>
          <IconShoppingCart size={18} />
        </ActionIcon>
      </Indicator>

      <Drawer opened={opened} onClose={handleClose} position="right" title="Your cart" size="md">
        {placedOrder ? (
          <Stack align="center" py="xl" gap="md">
            <ThemeIcon size={56} radius="xl" color="teal" variant="light">
              <IconCheck size={32} />
            </ThemeIcon>
            <Text fw={700} size="lg">
              Order placed
            </Text>
            <Text c="dimmed" ta="center">
              Thanks{username ? `, ${username}` : ''}! Order {placedOrder.id} for{' '}
              {formatPrice(placedOrder.total, placedOrder.currency)} is confirmed.
            </Text>
            <Button variant="light" onClick={handleClose}>
              Continue shopping
            </Button>
          </Stack>
        ) : items.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Your cart is empty.
          </Text>
        ) : (
          <Stack>
            {items.map(({ product, quantity }) => (
              <Group key={product.id} justify="space-between" wrap="nowrap" align="center">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  {product.image_url && (
                    <Image src={product.image_url} alt={product.name} w={48} h={48} fit="contain" />
                  )}
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600} lineClamp={1}>
                      {product.name}
                    </Text>
                    <Group gap={4}>
                      <ActionIcon
                        size="sm"
                        variant="default"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                      >
                        <IconMinus size={14} />
                      </ActionIcon>
                      <Text size="sm" w={24} ta="center">
                        {quantity}
                      </Text>
                      <ActionIcon
                        size="sm"
                        variant="default"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                      >
                        <IconPlus size={14} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Group>
                <Group gap="xs" wrap="nowrap" align="center">
                  <Text fw={600} c="dimmed">
                    {formatPrice((Number(product.price) * quantity).toFixed(2), product.currency)}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => removeItem(product.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}

            <Divider />
            <Group justify="space-between">
              <Text fw={600}>Total</Text>
              <Text fw={700} size="xl">
                {formatPrice(totalPrice.toFixed(2), currency)}
              </Text>
            </Group>
            {error && (
              <Alert color="red" title="Checkout failed" variant="light">
                {error}
              </Alert>
            )}
            <Button fullWidth onClick={handleCheckout} loading={placing}>
              Checkout
            </Button>
          </Stack>
        )}
      </Drawer>
    </>
  )
}
