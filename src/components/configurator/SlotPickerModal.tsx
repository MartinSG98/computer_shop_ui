import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Center,
  Group,
  Image,
  Modal,
  MultiSelect,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { IconPhoto } from '@tabler/icons-react'
import type { Product } from '../../api/types'
import { formatPrice } from '../../lib/format'
import { filterOptions, filtersForCategory, matchesAttributeFilters } from '../../lib/filters'
import brandSelectClasses from '../BrandSelect.module.css'
import classes from './SlotPickerModal.module.css'

type SortOrder = 'price-asc' | 'price-desc'

interface Props {
  opened: boolean
  label: string
  /** Category slug of the slot being picked; drives the attribute filters. */
  categorySlug: string | null
  products: Product[]
  onSelect: (product: Product) => void
  onClose: () => void
}

export function SlotPickerModal({ opened, label, categorySlug, products, onSelect, onClose }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('price-asc')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({})

  // Reset the filters whenever the picker switches to a different slot.
  useEffect(() => {
    setSortOrder('price-asc')
    setSelectedBrands([])
    setAttributeFilters({})
  }, [label])

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )
  const showBrandFilter = availableBrands.length > 1

  const categoryFilters = useMemo(() => filtersForCategory(categorySlug), [categorySlug])
  const attributeControls = useMemo(
    () =>
      categoryFilters
        .map((filter) => ({
          key: filter.key,
          label: filter.label,
          placeholder: filter.placeholder,
          options: filterOptions(filter, products),
        }))
        .filter((control) => control.options.length > 1),
    [categoryFilters, products],
  )

  const visible = useMemo(() => {
    const byBrand =
      selectedBrands.length === 0
        ? products
        : products.filter((p) => selectedBrands.includes(p.brand))
    const byAttributes = byBrand.filter((p) =>
      matchesAttributeFilters(p, categoryFilters, attributeFilters),
    )
    const sorted = [...byAttributes].sort((a, b) => Number(a.price) - Number(b.price))
    return sortOrder === 'price-desc' ? sorted.reverse() : sorted
  }, [products, selectedBrands, categoryFilters, attributeFilters, sortOrder])

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Choose a ${label}`}
      size="lg"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="sm">
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm" verticalSpacing="sm">
          {showBrandFilter && (
            <MultiSelect
              size="xs"
              classNames={{ inputField: brandSelectClasses.input }}
              placeholder={selectedBrands.length ? undefined : 'All brands'}
              aria-label="Filter by brand"
              data={availableBrands}
              value={selectedBrands}
              onChange={setSelectedBrands}
              clearable
            />
          )}
          {attributeControls.map((control) => (
            <MultiSelect
              key={control.key}
              size="xs"
              classNames={{ inputField: brandSelectClasses.input }}
              placeholder={(attributeFilters[control.key]?.length ?? 0) ? undefined : control.placeholder}
              aria-label={`Filter by ${control.label.toLowerCase()}`}
              data={control.options}
              value={attributeFilters[control.key] ?? []}
              onChange={(values) => setAttributeFilters((current) => ({ ...current, [control.key]: values }))}
              clearable
            />
          ))}
          <Select
            size="xs"
            aria-label="Sort by price"
            value={sortOrder}
            onChange={(value) => value && setSortOrder(value as SortOrder)}
            allowDeselect={false}
            data={[
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
            ]}
          />
        </SimpleGrid>

        <Stack gap={4}>
          {visible.map((product) => {
            const inStock = product.stock > 0
            return (
              <Tooltip
                key={product.id}
                multiline
                w={300}
                withArrow
                position="left"
                openDelay={200}
                label={
                  <Stack gap={4}>
                    {product.description && (
                      <Text size="xs" c="dimmed">
                        {product.description}
                      </Text>
                    )}
                    <Stack gap={2}>
                      {Object.entries(product.specs).map(([key, value]) => (
                        <Text key={key} size="xs">
                          <Text span fw={600} tt="capitalize">
                            {key.replace(/_/g, ' ')}
                          </Text>
                          : {value}
                        </Text>
                      ))}
                    </Stack>
                  </Stack>
                }
              >
                <UnstyledButton
                  className={classes.row}
                  aria-disabled={!inStock}
                  onClick={() => inStock && onSelect(product)}
                  style={{ cursor: inStock ? 'pointer' : 'not-allowed' }}
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
              </Tooltip>
            )
          })}
        </Stack>
      </Stack>
    </Modal>
  )
}