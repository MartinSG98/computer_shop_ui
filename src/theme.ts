import { createTheme } from '@mantine/core'

/**
 * Sleek, dark-first theme: a violet accent on deep, slightly-cool neutral
 * surfaces. Cards sit one step above the body for subtle elevation.
 */
export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
  },
  colors: {
    // Custom dark scale. 7 = body background, 6 = elevated surfaces (cards,
    // modals, header), 4 = borders, 5 = hover. Deep and neutral with a faint
    // cool tint so the violet accent pops.
    dark: [
      '#c5c6cd',
      '#a9aab2',
      '#8c8d97',
      '#6f7079',
      '#4a4b55',
      '#33343d',
      '#262730',
      '#1d1e26',
      '#16171d',
      '#0f1014',
    ],
  },
})