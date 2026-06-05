import type { BuildSelection, BuildSlug } from './configurator'
import { estimatedWattage } from './configurator'

export type IssueSeverity = 'error' | 'warning'

export interface Issue {
  severity: IssueSeverity
  message: string
  /** Slots the issue implicates, for inline highlighting. */
  slots: BuildSlug[]
}

/** Recommended PSU headroom over the estimated draw (20%). */
const PSU_HEADROOM = 0.2

/**
 * Run every pairwise compatibility rule over the current selection and return
 * all issues found. Each rule only fires when both parts (and the data it needs)
 * are present, so a partial build never produces false positives.
 */
export function evaluateBuild(selection: BuildSelection): Issue[] {
  const issues: Issue[] = []

  const cpu = selection.processors
  const mobo = selection.motherboards
  const cooler = selection['cpu-coolers']
  const ram = selection.memory
  const gpu = selection['graphics-cards']
  const psu = selection['power-supplies']
  const pcCase = selection.cases

  const cpuA = cpu?.attributes
  const moboA = mobo?.attributes
  const coolerA = cooler?.attributes
  const ramA = ram?.attributes
  const gpuA = gpu?.attributes
  const psuA = psu?.attributes
  const caseA = pcCase?.attributes

  // CPU socket vs motherboard socket
  if (cpuA?.socket && moboA?.socket && cpuA.socket !== moboA.socket) {
    issues.push({
      severity: 'error',
      message: `CPU and motherboard sockets don't match (${cpuA.socket} vs ${moboA.socket}).`,
      slots: ['processors', 'motherboards'],
    })
  }

  // Cooler supports the CPU socket
  if (coolerA?.sockets && cpuA?.socket && !coolerA.sockets.includes(cpuA.socket)) {
    issues.push({
      severity: 'error',
      message: `The cooler doesn't support the CPU socket (${cpuA.socket}).`,
      slots: ['cpu-coolers', 'processors'],
    })
  }

  // Cooler can handle the CPU's heat output
  if (coolerA?.tdp_rating_w != null && cpuA?.tdp_w != null && coolerA.tdp_rating_w < cpuA.tdp_w) {
    issues.push({
      severity: 'warning',
      message: `The cooler may struggle with this CPU's heat output (rated ${coolerA.tdp_rating_w}W for a ~${cpuA.tdp_w}W CPU).`,
      slots: ['cpu-coolers', 'processors'],
    })
  }

  // Air cooler height vs case clearance
  if (coolerA?.cooler_type === 'air' && coolerA.height_mm != null && caseA?.max_cooler_height_mm != null && coolerA.height_mm > caseA.max_cooler_height_mm) {
    issues.push({
      severity: 'error',
      message: `The cooler is too tall for the case (${coolerA.height_mm}mm vs ${caseA.max_cooler_height_mm}mm max).`,
      slots: ['cpu-coolers', 'cases'],
    })
  }

  // AIO radiator vs case support
  if (coolerA?.cooler_type === 'aio' && coolerA.radiator_mm != null && caseA?.max_radiator_mm != null && coolerA.radiator_mm > caseA.max_radiator_mm) {
    issues.push({
      severity: 'error',
      message: `The ${coolerA.radiator_mm}mm radiator is too large for the case (${caseA.max_radiator_mm}mm max).`,
      slots: ['cpu-coolers', 'cases'],
    })
  }

  // RAM type vs motherboard
  if (ramA?.memory_type && moboA?.memory_type && ramA.memory_type !== moboA.memory_type) {
    issues.push({
      severity: 'error',
      message: `The memory is ${ramA.memory_type} but the motherboard takes ${moboA.memory_type}.`,
      slots: ['memory', 'motherboards'],
    })
  }

  // RAM stick count vs motherboard slots
  if (ramA?.modules != null && moboA?.memory_slots != null && ramA.modules > moboA.memory_slots) {
    issues.push({
      severity: 'error',
      message: `This memory kit has ${ramA.modules} sticks but the motherboard only has ${moboA.memory_slots} slots.`,
      slots: ['memory', 'motherboards'],
    })
  }

  // RAM capacity vs motherboard maximum
  if (ramA?.capacity_gb != null && moboA?.memory_max_gb != null && ramA.capacity_gb > moboA.memory_max_gb) {
    issues.push({
      severity: 'warning',
      message: `The memory capacity (${ramA.capacity_gb}GB) exceeds the motherboard's maximum (${moboA.memory_max_gb}GB).`,
      slots: ['memory', 'motherboards'],
    })
  }

  // Motherboard form factor vs case
  if (moboA?.form_factor && caseA?.form_factors && !caseA.form_factors.includes(moboA.form_factor)) {
    issues.push({
      severity: 'error',
      message: `The case doesn't support ${moboA.form_factor} motherboards.`,
      slots: ['motherboards', 'cases'],
    })
  }

  // GPU length vs case
  if (gpuA?.length_mm != null && caseA?.max_gpu_length_mm != null && gpuA.length_mm > caseA.max_gpu_length_mm) {
    issues.push({
      severity: 'error',
      message: `The graphics card is too long for the case (${gpuA.length_mm}mm vs ${caseA.max_gpu_length_mm}mm max).`,
      slots: ['graphics-cards', 'cases'],
    })
  }

  // PSU form factor vs case
  if (psuA?.form_factor && caseA?.psu_form_factors && !caseA.psu_form_factors.includes(psuA.form_factor)) {
    issues.push({
      severity: 'error',
      message: `The case doesn't fit a ${psuA.form_factor} power supply.`,
      slots: ['power-supplies', 'cases'],
    })
  }

  // PSU wattage vs estimated draw (with headroom)
  if (psuA?.wattage_w != null) {
    const draw = estimatedWattage(selection)
    if (draw > 0) {
      if (psuA.wattage_w < draw) {
        issues.push({
          severity: 'error',
          message: `The ${psuA.wattage_w}W power supply is below the estimated ${draw}W draw.`,
          slots: ['power-supplies'],
        })
      } else if (psuA.wattage_w < draw * (1 + PSU_HEADROOM)) {
        issues.push({
          severity: 'warning',
          message: `${psuA.wattage_w}W is tight for a ~${draw}W draw. We recommend 20-30% headroom for power spikes.`,
          slots: ['power-supplies'],
        })
      }
    }
  }

  // CPU with no integrated graphics and no discrete GPU
  if (cpu && cpuA?.has_igpu === false && !gpu) {
    issues.push({
      severity: 'warning',
      message: `The ${cpu.name} has no integrated graphics, so you won't get any display output without a graphics card.`,
      slots: ['processors', 'graphics-cards'],
    })
  }

  return issues
}

/** Map each slot to its worst severity, for inline highlighting (error beats warning). */
export function severityBySlot(issues: Issue[]): Partial<Record<BuildSlug, IssueSeverity>> {
  const map: Partial<Record<BuildSlug, IssueSeverity>> = {}
  for (const issue of issues) {
    for (const slot of issue.slots) {
      if (issue.severity === 'error' || map[slot] !== 'error') {
        map[slot] = issue.severity
      }
    }
  }
  return map
}

/** Group issues by the slots they implicate, for per-slot tooltips. */
export function issuesBySlot(issues: Issue[]): Partial<Record<BuildSlug, Issue[]>> {
  const map: Partial<Record<BuildSlug, Issue[]>> = {}
  for (const issue of issues) {
    for (const slot of issue.slots) {
      ;(map[slot] ??= []).push(issue)
    }
  }
  return map
}