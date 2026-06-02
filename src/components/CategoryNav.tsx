import { NavLink, Stack, Text } from '@mantine/core'
import { IconLayoutGrid } from '@tabler/icons-react'
import { useShop } from '../context/shop-context'

export function CategoryNav() {
  const { categories } = useShop()

  return (
    <Stack gap={4}>
      <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
        Categories
      </Text>
      <NavLink label="All products" leftSection={<IconLayoutGrid size={18} />} active />
      {categories.map((category) => (
        <NavLink key={category.slug} label={category.name} />
      ))}
    </Stack>
  )
}