import { Group, Stack, Text } from '@mantine/core'
import { IconBulb, IconCircleCheck } from '@tabler/icons-react'
import classes from './SuggestionList.module.css'

interface Props {
  /** Improvement tips for the build; empty means nothing to improve. */
  items: string[]
  /** True when the build has no compatibility errors (controls the positive note). */
  wellMatched: boolean
}

/**
 * Renders the evaluator's suggestions (or a positive note when there is nothing
 * to improve), fading each line in with a small stagger so they don't pop in.
 */
export function SuggestionList({ items, wellMatched }: Props) {
  if (items.length === 0) {
    if (!wellMatched) return null
    return (
      <Group gap={8} wrap="nowrap" align="flex-start" className={classes.item}>
        <IconCircleCheck size={16} color="var(--mantine-color-teal-6)" style={{ flexShrink: 0, marginTop: 2 }} />
        <Text size="xs" c="teal">
          This build is well matched for what you need.
        </Text>
      </Group>
    )
  }

  // Key on the content so a fresh set of tips replays the animation.
  return (
    <Stack gap={6} key={items.join('|')}>
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={1} className={classes.item}>
        Suggestions
      </Text>
      {items.map((rec, i) => (
        <Group
          key={`rec${i}`}
          gap={8}
          wrap="nowrap"
          align="flex-start"
          className={classes.item}
          style={{ animationDelay: `${(i + 1) * 90}ms` }}
        >
          <IconBulb size={16} color="var(--mantine-color-yellow-6)" style={{ flexShrink: 0, marginTop: 2 }} />
          <Text size="xs">{rec}</Text>
        </Group>
      ))}
    </Stack>
  )
}