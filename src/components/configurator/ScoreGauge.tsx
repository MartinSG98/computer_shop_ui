import { Stack, Text } from '@mantine/core'

// Semicircle gauge geometry. The arc sweeps left (0) to right (100) over the top.
const W = 220
const H = 128
const CX = W / 2
const CY = 116
const R = 92
const STROKE = 16
const ARC_LEN = Math.PI * R
const TRACK = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`

function bandColor(score: number): string {
  if (score < 40) return 'var(--mantine-color-red-6)'
  if (score < 70) return 'var(--mantine-color-yellow-6)'
  return 'var(--mantine-color-teal-6)'
}

interface Props {
  /** 0-100, or null when not evaluated yet. */
  score: number | null
  loading?: boolean
}

export function ScoreGauge({ score, loading }: Props) {
  const t = score == null ? 0 : Math.max(0, Math.min(100, score)) / 100
  const rotation = (t - 0.5) * 180 // -90 points left (0), +90 points right (100)
  const color = score == null ? 'var(--mantine-color-dimmed)' : bandColor(score)

  return (
    <Stack gap={2} align="center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: W, height: 'auto' }}
        role="img"
        aria-label={score == null ? 'Build not evaluated' : `Build score ${Math.round(score)} out of 100`}
      >
        <path d={TRACK} fill="none" stroke="var(--mantine-color-default-border)" strokeWidth={STROKE} strokeLinecap="round" />

        {score != null && (
          <path
            d={TRACK}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={ARC_LEN * (1 - t)}
            style={{ transition: 'stroke-dashoffset 700ms ease' }}
          />
        )}

        {score != null && (
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transition: 'transform 700ms ease',
            }}
          >
            <line x1={CX} y1={CY} x2={CX} y2={CY - R + STROKE / 2} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={6} fill={color} />
          </g>
        )}
      </svg>

      <Text fw={800} fz={34} lh={1} c={score == null ? 'dimmed' : color}>
        {loading ? '...' : score == null ? '--' : Math.round(score)}
      </Text>
      <Text size="xs" c="dimmed" tt="uppercase" lts={1.5}>
        Build score
      </Text>
    </Stack>
  )
}