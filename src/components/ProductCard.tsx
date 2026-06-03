import { Badge, Box, Button, Card, Center, Group, Image, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPhoto, IconShoppingCart } from '@tabler/icons-react'
import type { Product } from '../api/types'
import { formatPrice } from '../lib/format'
import { ProductDetailModal } from './ProductDetailModal'
import classes from './ProductCard.module.css'

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={classes.card}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            open()
          }
        }}
      >
        <Card.Section>
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} height={180} fit="contain" />
          ) : (
            <Center h={180} bg="var(--mantine-color-default-hover)">
              <IconPhoto size={48} color="var(--mantine-color-dimmed)" />
            </Center>
          )}
        </Card.Section>

        <Stack gap="xs" mt="md">
          <Text fw={600} lineClamp={1}>
            {product.name}
          </Text>
          <Text size="sm" c="dimmed">
            {product.brand}
          </Text>

          <Group justify="space-between" mt="xs">
            <Text fw={700} size="lg" c="indigo">
              {formatPrice(product.price, product.currency)}
            </Text>
            <Badge color={inStock ? 'teal' : 'red'} variant="light">
              {inStock ? 'In stock' : 'Out of stock'}
            </Badge>
          </Group>

          <Box mt="sm">
            <Button
              fullWidth
              variant="light"
              leftSection={<IconShoppingCart size={16} />}
              disabled={!inStock}
              // Don't let the cart button open the details modal.
              onClick={(event) => event.stopPropagation()}
            >
              Add to cart
            </Button>
          </Box>
        </Stack>
      </Card>

      <ProductDetailModal product={product} opened={opened} onClose={close} />
    </>
  )
}