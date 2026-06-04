import { Checkbox, NavLink, Stack, Text } from '@mantine/core'
import {
  IconBolt,
  IconCpu,
  IconCpu2,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceGamepad,
  IconDeviceSdCard,
  IconDevices2,
  IconHeadphones,
  IconKeyboard,
  IconLayoutGrid,
  IconMouse,
  IconTemperature,
} from '@tabler/icons-react'
import { useShop } from '../context/shop-context'

const CATEGORY_ICONS: Record<string, typeof IconCpu> = {
  processors: IconCpu,
  'cpu-coolers': IconTemperature,
  motherboards: IconCpu2,
  memory: IconDeviceSdCard,
  'graphics-cards': IconDeviceGamepad,
  storage: IconDatabase,
  'power-supplies': IconBolt,
  cases: IconDevices2,
  monitors: IconDeviceDesktop,
  keyboards: IconKeyboard,
  mice: IconMouse,
  headsets: IconHeadphones,
}

export function CategoryNav() {
  const { categories, selectedCategory, setSelectedCategory, availableBrands, selectedBrands, setSelectedBrands } =
    useShop()

  const toggleBrand = (brand: string, checked: boolean) => {
    setSelectedBrands(
      checked ? [...selectedBrands, brand] : selectedBrands.filter((b) => b !== brand),
    )
  }

  return (
    <Stack gap={4}>
      <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
        Categories
      </Text>

      <NavLink
        label="All products"
        leftSection={<IconLayoutGrid size={18} />}
        active={selectedCategory === null}
        variant="light"
        onClick={() => setSelectedCategory(null)}
      />

      {categories.map((category) => {
        const active = selectedCategory === category.slug
        const Icon = CATEGORY_ICONS[category.slug]
        return (
          <div key={category.slug}>
            <NavLink
              label={category.name}
              leftSection={Icon ? <Icon size={18} /> : undefined}
              active={active}
              variant="light"
              onClick={() => setSelectedCategory(category.slug)}
            />
            {/* Only the selected category expands, and only if it has >1 brand. */}
            {active && availableBrands.length > 1 && (
              <Stack gap={6} pl="lg" pt="xs" pb={4}>
                {availableBrands.map((brand) => (
                  <Checkbox
                    key={brand}
                    size="xs"
                    label={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={(event) => toggleBrand(brand, event.currentTarget.checked)}
                  />
                ))}
              </Stack>
            )}
          </div>
        )
      })}
    </Stack>
  )
}