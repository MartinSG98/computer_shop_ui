import { Badge, Center, Group, Image, Modal, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconPhoto } from '@tabler/icons-react'
import type { Product } from '../../api/types'
import { formatPrice } from '../../lib/format'
import classes from './SlotPickerModal.module.css'

interface Props {
  opened: boolean
  label: string
  products: Product[]
  onSelect: (product: Product) => void
  onClose: () => void
}

export function SlotPickerModal({ opened, label, products, onSelect, onClose }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Choose a ${label}`}
      size="lg"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap={4}>
        {products.map((product) => {
          const inStock = product.stock > 0
          return (
            <UnstyledButton
              key={product.id}
              className={classes.row}
              disabled={!inStock}
              onClick={() => onSelect(product)}
            >
              <Group wrap="nowrap" gap="md" p="xs" style={{ opacity: inStock ? 1 : 0.5 }}>
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} w={48} h={48} fit="contain" />
                ) : (
                  <Center w={48} h={48}>
                    <IconPhoto size={22} color="var(--mantine-color-dimmed)" />
                  </Center>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5} lineClamp={1}>
                    {product.brand}
                  </Text>
                  <Text fw={600} lineClamp={1}>
                    {product.name}
                  </Text>
                </div>
                <Stack gap={2} align="flex-end">
                  <Text fw={700} c="violet.4">
                    {formatPrice(product.price, product.currency)}
                  </Text>
                  {!inStock && (
                    <Badge color="red" variant="light" size="sm">
                      Out of stock
                    </Badge>
                  )}
                </Stack>
              </Group>
            </UnstyledButton>
          )
        })}
      </Stack>
    </Modal>
  )
}