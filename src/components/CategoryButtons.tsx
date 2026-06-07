import { Box, Button, Group, ScrollArea, Select } from '@mantine/core'
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

// Sentinel for the "all categories" option (Select values must be strings).
const ALL = '__all__'

// Flat top (attaches to the hero edge) + rounded bottom (the "wave").
// flexShrink: 0 keeps full-width labels from being squished in the no-wrap row.
const TAB_STYLE = {
  flexShrink: 0,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
}

export function CategoryButtons() {
  const { categories, selectedCategory, setSelectedCategory } = useShop()

  const SelectedIcon = selectedCategory ? CATEGORY_ICONS[selectedCategory] : IconLayoutGrid

  return (
    <>
      {/* Desktop: wave tabs attached to the hero edge. */}
      <ScrollArea scrollbars="x" type="auto" visibleFrom="sm">
        {/* "safe center" centers the tabs when they fit but falls back to
            left-aligned on overflow, so the first tab is never clipped out of
            reach when scrolled fully left. */}
        <Group gap={0} wrap="nowrap" style={{ justifyContent: 'safe center' }}>
          <Button
            size="md"
            radius={0}
            style={TAB_STYLE}
            variant={selectedCategory === null ? 'filled' : 'default'}
            leftSection={<IconLayoutGrid size={16} />}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug]
            return (
              <Button
                key={category.slug}
                size="md"
                radius={0}
                style={TAB_STYLE}
                variant={selectedCategory === category.slug ? 'filled' : 'default'}
                leftSection={Icon ? <Icon size={16} /> : undefined}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </Button>
            )
          })}
        </Group>
      </ScrollArea>

      {/* Mobile: compact category dropdown. */}
      <Box hiddenFrom="sm" px="md" pt="md">
        <Select
          aria-label="Category"
          leftSection={SelectedIcon ? <SelectedIcon size={16} /> : undefined}
          allowDeselect={false}
          value={selectedCategory ?? ALL}
          onChange={(value) => setSelectedCategory(value === ALL ? null : value)}
          data={[
            { value: ALL, label: 'All products' },
            ...categories.map((category) => ({ value: category.slug, label: category.name })),
          ]}
        />
      </Box>
    </>
  )
}