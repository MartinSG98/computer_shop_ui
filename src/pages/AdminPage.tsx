import {
  Alert,
  Center,
  Container,
  Group,
  Loader,
  Pagination,
  Paper,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { AreaChart } from '@mantine/charts'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError, getAdminOrders, getAdminOverview } from '../api/client'
import type { AdminOverview, Order } from '../api/types'
import { useAuth } from '../context/auth-context'
import { formatPrice } from '../lib/format'

// The admin metrics don't carry a currency; the shop is single-currency USD.
const USD = 'USD'
const PAGE_SIZE = 10

const PERIODS = [
  { value: 'all', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

// Inclusive lower-bound date (YYYY-MM-DD) for a period, or null for "all time".
// Date strings compare correctly with >=, so no Date parsing is needed at use.
function cutoffDate(period: string): string | null {
  if (period === 'all') return null
  const d = new Date()
  d.setDate(d.getDate() - Number(period))
  return d.toISOString().slice(0, 10)
}

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
  const [salesPage, setSalesPage] = useState(1)
  const [ordersPage, setOrdersPage] = useState(1)
  const [salesPeriod, setSalesPeriod] = useState('all')
  const [ordersPeriod, setOrdersPeriod] = useState('all')

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

  const salesCutoff = cutoffDate(salesPeriod)
  const filteredSales = (overview?.sales_over_time ?? []).filter(
    (day) => !salesCutoff || day.date >= salesCutoff,
  )
  const salesPageCount = Math.ceil(filteredSales.length / PAGE_SIZE)
  const salesRows = filteredSales.slice((salesPage - 1) * PAGE_SIZE, salesPage * PAGE_SIZE)
  // Chart uses the full filtered range (ascending by date), not just one page.
  const salesChartData = filteredSales.map((day) => ({ date: day.date, Revenue: Number(day.revenue) }))

  const ordersCutoff = cutoffDate(ordersPeriod)
  const filteredOrders = orders.filter(
    (order) => !ordersCutoff || order.created_at.slice(0, 10) >= ordersCutoff,
  )
  const ordersPageCount = Math.ceil(filteredOrders.length / PAGE_SIZE)
  const orderRows = filteredOrders.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE)

  const onSalesPeriod = (value: string | null) => {
    setSalesPeriod(value ?? 'all')
    setSalesPage(1)
  }
  const onOrdersPeriod = (value: string | null) => {
    setOrdersPeriod(value ?? 'all')
    setOrdersPage(1)
  }

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
            <Group justify="space-between" mb="sm">
              <Text fw={700}>Sales over time</Text>
              <Select
                data={PERIODS}
                value={salesPeriod}
                onChange={onSalesPeriod}
                size="xs"
                w={140}
                allowDeselect={false}
                aria-label="Sales over time period"
              />
            </Group>
            {filteredSales.length === 0 ? (
              <Text c="dimmed">No sales in this period.</Text>
            ) : (
              <>
                <AreaChart
                  h={260}
                  mb="md"
                  data={salesChartData}
                  dataKey="date"
                  series={[{ name: 'Revenue', color: 'violet.6' }]}
                  valueFormatter={(value) => formatPrice(String(value), USD)}
                  curveType="monotone"
                  withDots={false}
                  // Inset the whole plot (gridlines included) from the card edge.
                  // Chart margin is the lever for this; xAxis padding only moves
                  // the data points, not the gridlines that were hitting the border.
                  areaChartProps={{ margin: { top: 10, right: 24, bottom: 0, left: 0 } }}
                  xAxisProps={{ padding: { left: 8, right: 8 } }}
                />
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Orders</Table.Th>
                      <Table.Th>Revenue</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {salesRows.map((day) => (
                      <Table.Tr key={day.date}>
                        <Table.Td>{day.date}</Table.Td>
                        <Table.Td>{day.orders}</Table.Td>
                        <Table.Td>{formatPrice(day.revenue, USD)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                {salesPageCount > 1 && (
                  <Group justify="flex-end" mt="sm">
                    <Pagination
                      total={salesPageCount}
                      value={salesPage}
                      onChange={setSalesPage}
                      size="sm"
                    />
                  </Group>
                )}
              </>
            )}
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Text fw={700}>Recent orders</Text>
              <Select
                data={PERIODS}
                value={ordersPeriod}
                onChange={onOrdersPeriod}
                size="xs"
                w={140}
                allowDeselect={false}
                aria-label="Recent orders period"
              />
            </Group>
            {filteredOrders.length === 0 ? (
              <Text c="dimmed">No orders in this period.</Text>
            ) : (
              <>
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
                    {orderRows.map((order) => (
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
                {ordersPageCount > 1 && (
                  <Group justify="flex-end" mt="sm">
                    <Pagination
                      total={ordersPageCount}
                      value={ordersPage}
                      onChange={setOrdersPage}
                      size="sm"
                    />
                  </Group>
                )}
              </>
            )}
          </Paper>
        </Stack>
      ) : null}
    </Container>
  )
}
