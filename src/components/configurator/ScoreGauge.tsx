import { useEffect, useRef, useState } from 'react'
import { Box, Group, Stack, Text } from '@mantine/core'

// Semicircle gauge geometry. The arc sweeps left (0) to right (100) over the top.
const W = 220
const H = 128
const CX = W / 2
const CY = 116
const R = 92
const STROKE = 16
const ARC_LEN = Math.PI * R
const TRACK = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`

// How long the needle takes to sweep from 0 to the score.
const FILL_MS = 2500

function bandColor(score: number): string {
  if (score < 40) return 'var(--mantine-color-red-6)'
  if (score < 70) return 'var(--mantine-color-yellow-6)'
  return 'var(--mantine-color-teal-6)'
}

// Score bands, shown in the legend (high to low). Ranges line up with bandColor.
export const SCORE_BANDS = [
  { label: 'Excellent', range: '70-100', color: 'var(--mantine-color-teal-6)' },
  { label: 'Capable', range: '40-69', color: 'var(--mantine-color-yellow-6)' },
  { label: 'Underpowered', range: '0-39', color: 'var(--mantine-color-red-6)' },
]

/** Color-to-meaning key for the build score. */
export function ScoreLegend() {
  return (
    <Stack gap={6} w="100%">
      {SCORE_BANDS.map((b) => (
        <Group key={b.label} gap={8} justify="space-between" wrap="nowrap">
          <Group gap={8} wrap="nowrap">
            <Box w={10} h={10} style={{ borderRadius: 2, backgroundColor: b.color }} />
            <Text size="xs">{b.label}</Text>
          </Group>
          <Text size="xs" c="dimmed">
            {b.range}
          </Text>
        </Group>
      ))}
    </Stack>
  )
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

interface Props {
  /** 0-100, or null when not evaluated yet. */
  score: number | null
  loading?: boolean
}

export function ScoreGauge({ score, loading }: Props) {
  // Value the gauge is currently showing. Ramps up to `score` over FILL_MS.
  const [shown, setShown] = useState<number | null>(null)
  const frame = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (frame.current) cancelAnimationFrame(frame.current)

    if (score == null) {
      setShown(null)
      return
    }

    const target = Math.max(0, Math.min(100, score))
    let start: number | null = null

    const tick = (now: number) => {
      if (start == null) start = now
      const p = Math.min(1, (now - start) / FILL_MS)
      setShown(target * easeOutCubic(p))
      if (p < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [score])

  const t = shown == null ? 0 : shown / 100
  const rotation = (t - 0.5) * 180 // -90 points left (0), +90 points right (100)
  const color = shown == null ? 'var(--mantine-color-dimmed)' : bandColor(shown)

  return (
    <Stack gap={2} align="center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: W, height: 'auto' }}
        role="img"
        aria-label={score == null ? 'Build not evaluated' : `Build score ${Math.round(score)} out of 100`}
      >
        <path d={TRACK} fill="none" stroke="var(--mantine-color-default-border)" strokeWidth={STROKE} strokeLinecap="round" />

        {shown != null && (
          <path
            d={TRACK}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={ARC_LEN * (1 - t)}
          />
        )}

        {shown != null && (
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
            }}
          >
            <line x1={CX} y1={CY} x2={CX} y2={CY - R + STROKE / 2} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={6} fill={color} />
          </g>
        )}
      </svg>

      <Text fw={800} fz={34} lh={1} c={shown == null ? 'dimmed' : color}>
        {loading ? '...' : shown == null ? '--' : Math.round(shown)}
      </Text>
      <Text size="xs" c="dimmed" tt="uppercase" lts={1.5}>
        Build score
      </Text>
    </Stack>
  )
}