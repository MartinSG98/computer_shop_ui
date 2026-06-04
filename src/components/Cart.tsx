import {
  ActionIcon,
  Button,
  Divider,
  Drawer,
  Group,
  Image,
  Indicator,
  Stack,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconMinus, IconPlus, IconShoppingCart, IconTrash } from '@tabler/icons-react'
import { useCart } from '../context/cart-context'
import { formatPrice } from '../lib/format'

export function Cart() {
  const [opened, { open, close }] = useDisclosure(false)
  const { items, itemCount, totalPrice, setQuantity, removeItem } = useCart()
  const currency = items[0]?.product.currency ?? 'USD'

  return (
    <>
      <Indicator label={itemCount} size={16} disabled={itemCount === 0} color="indigo">
        <ActionIcon variant="default" size="lg" aria-label="Open cart" onClick={open}>
          <IconShoppingCart size={18} />
        </ActionIcon>
      </Indicator>

      <Drawer opened={opened} onClose={close} position="right" title="Your cart" size="md">
        {items.length === 0 ? (
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
            {/* Checkout is intentionally disabled — wired up later. */}
            <Button fullWidth disabled>
              Checkout
            </Button>
          </Stack>
        )}
      </Drawer>
    </>
  )
}