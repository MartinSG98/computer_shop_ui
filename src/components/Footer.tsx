import { Box, Group, Text } from '@mantine/core'

export function Footer() {
  return (
    <Box mt="xl" py="lg" px="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          © 2026 MSG Computers
        </Text>
        <Text size="sm" c="dimmed">
          PC parts &amp; builds
        </Text>
      </Group>
    </Box>
  )
}