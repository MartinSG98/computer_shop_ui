import type { Product } from '../api/types'

/** The 8 buildable slots, in a sensible build order. */
export const BUILD_SLOTS = [
  { slug: 'processors', label: 'Processor (CPU)' },
  { slug: 'motherboards', label: 'Motherboard' },
  { slug: 'cpu-coolers', label: 'CPU Cooler' },
  { slug: 'memory', label: 'Memory (RAM)' },
  { slug: 'graphics-cards', label: 'Graphics Card' },
  { slug: 'storage', label: 'Storage' },
  { slug: 'power-supplies', label: 'Power Supply' },
  { slug: 'cases', label: 'Case' },
] as const

export type BuildSlug = (typeof BUILD_SLOTS)[number]['slug']

/** One product per slot; slots the user hasn't filled are absent. */
export type BuildSelection = Partial<Record<BuildSlug, Product>>

/** Watts added on top of CPU + GPU for the board, RAM, drives and fans. */
export const PSU_OVERHEAD_W = 100

/** Sum of the selected products' prices. */
export function buildTotal(selection: BuildSelection): number {
  return Object.values(selection).reduce((sum, p) => sum + (p ? Number(p.price) : 0), 0)
}

/** Rough system power draw: CPU + GPU TDP plus a fixed overhead. */
export function estimatedWattage(selection: BuildSelection): number {
  const cpu = selection.processors?.attributes?.tdp_w ?? 0
  const gpu = selection['graphics-cards']?.attributes?.tdp_w ?? 0
  if (cpu === 0 && gpu === 0) return 0
  return cpu + gpu + PSU_OVERHEAD_W
}

/** Number of filled slots. */
export function filledCount(selection: BuildSelection): number {
  return Object.values(selection).filter(Boolean).length
}