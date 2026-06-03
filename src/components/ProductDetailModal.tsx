import { Badge, Button, Center, Divider, Group, Image, Modal, Stack, Table, Text } from '@mantine/core'
import { IconPhoto, IconShoppingCart } from '@tabler/icons-react'
import type { Product } from '../api/types'
import { formatPrice } from '../lib/format'

interface Props {
  product: Product
  opened: boolean
  onClose: () => void
}

export function ProductDetailModal({ product, opened, onClose }: Props) {
  const inStock = product.stock > 0
  const specs = Object.entries(product.specs)

  return (
    <Modal opened={opened} onClose={onClose} title={product.name} size="lg" centered>
      <Stack>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} radius="md" mah={280} fit="contain" />
        ) : (
          <Center h={200} bg="var(--mantine-color-default-hover)" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
            <IconPhoto size={64} color="var(--mantine-color-dimmed)" />
          </Center>
        )}

        <Group justify="space-between">
          <Text c="dimmed">{product.brand}</Text>
          <Badge color={inStock ? 'teal' : 'red'} variant="light">
            {inStock ? `In stock (${product.stock})` : 'Out of stock'}
          </Badge>
        </Group>

        <Text fw={700} size="xl" c="indigo">
          {formatPrice(product.price, product.currency)}
        </Text>

        {product.description && <Text>{product.description}</Text>}

        {specs.length > 0 && (
          <>
            <Divider label="Specifications" labelPosition="left" />
            <Table withRowBorders={false} verticalSpacing="xs">
              <Table.Tbody>
                {specs.map(([key, value]) => (
                  <Table.Tr key={key}>
                    <Table.Td c="dimmed" tt="capitalize" w="40%">
                      {key.replace(/_/g, ' ')}
                    </Table.Td>
                    <Table.Td>{value}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        )}

        <Button
          fullWidth
          mt="sm"
          leftSection={<IconShoppingCart size={16} />}
          disabled={!inStock}
        >
          Add to cart
        </Button>
      </Stack>
    </Modal>
  )
}