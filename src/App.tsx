import { Button, Container, Group, Stack, Text, Title, useMantineColorScheme } from '@mantine/core'

function App() {
  const { toggleColorScheme } = useMantineColorScheme()

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={1}>Computer Shop</Title>
        <Text c="dimmed">Mantine theme and color scheme are wired up.</Text>
        <Group>
          <Button onClick={toggleColorScheme}>Toggle color scheme</Button>
          <Button variant="light">Secondary</Button>
        </Group>
      </Stack>
    </Container>
  )
}

export default App