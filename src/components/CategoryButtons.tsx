import { Button, Group, ScrollArea } from '@mantine/core'
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

  return (
    <ScrollArea scrollbars="x" type="hover">
      <Group gap={0} wrap="nowrap" justify="center">
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
  )
}