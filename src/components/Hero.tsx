import { Box, Stack, Text, Title } from '@mantine/core'

export function Hero() {
  return (
    <Box
      py={56}
      px="xl"
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-violet-9), var(--mantine-color-grape-7))',
      }}
    >
      <Stack gap="xs" maw={640}>
        <Title order={1} c="white">
          Build your dream PC
        </Title>
        <Text c="gray.2" size="lg">
          Hand-picked components from the brands you trust, at fair prices.
        </Text>
      </Stack>
    </Box>
  )
}