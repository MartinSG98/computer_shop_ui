import { Box, Stack, Text, Title } from '@mantine/core'

export function BuildPage() {
  return (
    <Box px="md" py="xl">
      <Stack gap="xs" maw={640}>
        <Title order={2}>Build a PC</Title>
        <Text c="dimmed">
          The configurator is coming soon. Pick a part for each slot and we'll check everything fits.
        </Text>
      </Stack>
    </Box>
  )
}