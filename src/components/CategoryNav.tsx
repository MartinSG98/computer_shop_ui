import { Checkbox, NavLink, Stack, Text } from '@mantine/core'
import { IconLayoutGrid } from '@tabler/icons-react'
import { useShop } from '../context/shop-context'

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
        onClick={() => setSelectedCategory(null)}
      />

      {categories.map((category) => {
        const active = selectedCategory === category.slug
        return (
          <div key={category.slug}>
            <NavLink
              label={category.name}
              active={active}
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