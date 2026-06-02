import { Alert, Button, Center, Container, Loader, Stack, Text, Title } from '@mantine/core'
import { useShop } from './context/shop-context'

function App() {
  const { products, categories, loading, error, reload } = useShop()

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={1}>Computer Shop</Title>

        {loading && (
          <Center py="lg">
            <Loader />
          </Center>
        )}

        {error && (
          <Alert color="red" title="Could not load the shop">
            <Stack align="flex-start">
              <Text>{error}</Text>
              <Button size="xs" variant="light" onClick={reload}>
                Retry
              </Button>
            </Stack>
          </Alert>
        )}

        {!loading && !error && (
          <Text>
            Loaded {products.length} products across {categories.length} categories.
          </Text>
        )}
      </Stack>
    </Container>
  )
}

export default App