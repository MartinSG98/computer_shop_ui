import { Badge, Button, Card, Center, Image, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPhoto, IconShoppingCart } from '@tabler/icons-react'
import type { Product } from '../api/types'
import { useCart } from '../context/cart-context'
import { formatPrice } from '../lib/format'
import { ProductDetailModal } from './ProductDetailModal'
import classes from './ProductCard.module.css'

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0
  const [opened, { open, close }] = useDisclosure(false)
  const { addItem } = useCart()

  return (
    <>
      <Card
        className={classes.card}
        shadow="sm"
        radius="md"
        withBorder
        padding={0}
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
        <Card.Section className={classes.media} pos="relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              h={180}
              fit="contain"
              p="md"
              className={classes.image}
            />
          ) : (
            <Center h={180}>
              <IconPhoto size={48} color="var(--mantine-color-gray-5)" />
            </Center>
          )}
          <Badge
            pos="absolute"
            top={10}
            right={10}
            radius="sm"
            color={inStock ? 'teal' : 'red'}
            variant={inStock ? 'light' : 'filled'}
          >
            {inStock ? 'In stock' : 'Out of stock'}
          </Badge>
        </Card.Section>

        <Stack gap={4} p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5} lineClamp={1}>
            {product.brand}
          </Text>
          <Text fw={600} lineClamp={2} className={classes.name}>
            {product.name}
          </Text>
          <Text fw={800} fz="xl" c="violet.4" mt={4}>
            {formatPrice(product.price, product.currency)}
          </Text>
          <Button
            fullWidth
            mt="sm"
            variant="light"
            leftSection={<IconShoppingCart size={16} />}
            disabled={!inStock}
            onClick={(event) => {
              // Don't let the cart button open the details modal.
              event.stopPropagation()
              addItem(product)
            }}
          >
            Add to cart
          </Button>
        </Stack>
      </Card>

      <ProductDetailModal product={product} opened={opened} onClose={close} />
    </>
  )
}