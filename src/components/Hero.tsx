import { useEffect, useMemo, useState } from 'react'
import { Box, Center, Group, Image, Paper, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { useDisclosure, useInterval } from '@mantine/hooks'
import { IconPhoto } from '@tabler/icons-react'
import { useShop } from '../context/shop-context'
import { formatPrice } from '../lib/format'
import { ProductDetailModal } from './ProductDetailModal'
import classes from './Hero.module.css'

const FEATURED_COUNT = 4
const ROTATE_MS = 4000

export function Hero() {
  const { products } = useShop()
  const [opened, { open, close }] = useDisclosure(false)

  // Pick a few random products once per load; reshuffles only if the catalog changes.
  const featured = useMemo(() => {
    const pool = [...products]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, FEATURED_COUNT)
  }, [products])

  const [index, setIndex] = useState(0)
  const interval = useInterval(() => setIndex((i) => i + 1), ROTATE_MS)

  // Auto-rotate, but pause while the detail modal is open so the product doesn't swap underneath it.
  useEffect(() => {
    if (opened) {
      interval.stop()
      return
    }
    interval.start()
    return interval.stop
  }, [opened, interval])

  // Jumping via the dots restarts the timer so it doesn't advance right after.
  const goTo = (i: number) => {
    setIndex(i)
    interval.stop()
    interval.start()
  }

  const safeIndex = featured.length ? ((index % featured.length) + featured.length) % featured.length : 0
  const current = featured[safeIndex]

  return (
    <Box
      py={48}
      px="xl"
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-violet-9), var(--mantine-color-grape-7))',
      }}
    >
      <div className={classes.layout}>
        <Stack gap="xs" maw={520}>
          <Title order={1} c="white">
            Build your dream PC
          </Title>
          <Text c="gray.2" size="lg">
            Hand-picked components from the brands you trust.
          </Text>
        </Stack>

        {current && (
          <Stack gap="md" align="center">
            <Text size="sm" fw={700} tt="uppercase" lts={1.5} c="gray.3">
              Featured products
            </Text>

            <UnstyledButton onClick={open} aria-label={`View ${current.name}`}>
              <Paper key={current.id} className={classes.slide} w={440} p="lg" radius="md" bg="white">
                <Group wrap="nowrap" gap="lg" align="center">
                  {current.image_url ? (
                    <Image src={current.image_url} alt={current.name} w={120} h={120} fit="contain" />
                  ) : (
                    <Center w={120} h={120}>
                      <IconPhoto size={44} color="var(--mantine-color-gray-5)" />
                    </Center>
                  )}
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5} lineClamp={1}>
                      {current.brand}
                    </Text>
                    <Text fw={700} size="lg" c="dark" lineClamp={2} lh={1.2}>
                      {current.name}
                    </Text>
                    <Text fw={800} size="xl" c="violet.7">
                      {formatPrice(current.price, current.currency)}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </UnstyledButton>

            <Group gap={6} justify="center">
              {featured.map((product, i) => (
                <UnstyledButton
                  key={product.id}
                  aria-label={`Go to featured product ${i + 1}`}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === safeIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 8,
                    background: i === safeIndex ? 'white' : 'rgba(255,255,255,0.45)',
                    transition: 'width 200ms ease, background 200ms ease',
                  }}
                />
              ))}
            </Group>
          </Stack>
        )}

        <div className={classes.spacer} />
      </div>

      {current && <ProductDetailModal product={current} opened={opened} onClose={close} />}
    </Box>
  )
}