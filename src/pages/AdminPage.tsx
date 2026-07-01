import {
  Alert,
  Center,
  Container,
  Loader,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError, getAdminOrders, getAdminOverview } from '../api/client'
import type { AdminOverview, Order } from '../api/types'
import { useAuth } from '../context/auth-context'
import { formatPrice } from '../lib/format'

// The admin metrics don't carry a currency; the shop is single-currency USD.
const USD = 'USD'

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={700} fz="xl">
        {value}
      </Text>
    </Paper>
  )
}

function unitsInOrder(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function AdminPage() {
  const { isAdmin, switching, idToken } = useAuth()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin || !idToken) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([getAdminOverview(), getAdminOrders()])
      .then(([loadedOverview, loadedOrders]) => {
        if (cancelled) return
        setOverview(loadedOverview)
        setOrders(loadedOrders)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load dashboard')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAdmin, idToken])

  // Wait out the silent sign-in before deciding whether to redirect.
  if (switching) {
    return (
      <Center h={240}>
        <Loader />
      </Center>
    )
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const topUnits = overview?.top_products[0]?.units ?? 0

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">
        Admin dashboard
      </Title>

      {loading ? (
        <Center h={240}>
          <Loader />
        </Center>
      ) : error ? (
        <Alert color="red" title="Could not load dashboard" variant="light">
          {error}
        </Alert>
      ) : overview ? (
        <Stack gap="xl">
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Kpi label="Revenue" value={formatPrice(overview.summary.total_revenue, USD)} />
            <Kpi label="Orders" value={String(overview.summary.order_count)} />
            <Kpi label="Avg order" value={formatPrice(overview.summary.average_order_value, USD)} />
            <Kpi label="Units sold" value={String(overview.summary.units_sold)} />
          </SimpleGrid>

          <Paper withBorder p="md" radius="md">
            <Text fw={700} mb="sm">
              Sales over time
            </Text>
            {overview.sales_over_time.length === 0 ? (
              <Text c="dimmed">No sales yet.</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Orders</Table.Th>
                    <Table.Th>Revenue</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {overview.sales_over_time.map((day) => (
                    <Table.Tr key={day.date}>
                      <Table.Td>{day.date}</Table.Td>
                      <Table.Td>{day.orders}</Table.Td>
                      <Table.Td>{formatPrice(day.revenue, USD)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Paper withBorder p="md" radius="md">
              <Text fw={700} mb="sm">
                Top products
              </Text>
              {overview.top_products.length === 0 ? (
                <Text c="dimmed">No sales yet.</Text>
              ) : (
                <Stack gap="sm">
                  {overview.top_products.map((product) => (
                    <div key={product.product_id}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {product.name}
                      </Text>
                      <Progress
                        value={topUnits ? (product.units / topUnits) * 100 : 0}
                        size="sm"
                        mb={4}
                      />
                      <Text size="xs" c="dimmed">
                        {product.units} sold · {formatPrice(product.revenue, USD)}
                      </Text>
                    </div>
                  ))}
                </Stack>
              )}
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text fw={700} mb="sm">
                Sales by category
              </Text>
              {overview.sales_by_category.length === 0 ? (
                <Text c="dimmed">No sales yet.</Text>
              ) : (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Units</Table.Th>
                      <Table.Th>Revenue</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {overview.sales_by_category.map((category) => (
                      <Table.Tr key={category.category}>
                        <Table.Td>{category.category}</Table.Td>
                        <Table.Td>{category.units}</Table.Td>
                        <Table.Td>{formatPrice(category.revenue, USD)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </SimpleGrid>

          <Paper withBorder p="md" radius="md">
            <Text fw={700} mb="sm">
              Recent orders
            </Text>
            {orders.length === 0 ? (
              <Text c="dimmed">No orders yet.</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Order</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Customer</Table.Th>
                    <Table.Th>Items</Table.Th>
                    <Table.Th>Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orders.map((order) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>{order.id}</Table.Td>
                      <Table.Td>{order.created_at.slice(0, 10)}</Table.Td>
                      <Table.Td>{order.username ?? '—'}</Table.Td>
                      <Table.Td>{unitsInOrder(order)}</Table.Td>
                      <Table.Td>{formatPrice(order.total, order.currency)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Stack>
      ) : null}
    </Container>
  )
}
