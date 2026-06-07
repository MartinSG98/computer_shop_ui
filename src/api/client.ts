import type { Category, EvaluateResult, Product, Resolution, UseCase } from './types'
import type { BuildSelection } from '../lib/configurator'

/** API base URL. Defaults to the local backend so the app runs with no config. */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`)
  } catch {
    throw new ApiError(0, 'Network error: could not reach the API')
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<T>
}

export function getProducts(category?: string): Promise<Product[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return request<Product[]>(`/products${query}`)
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`)
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories')
}

/** Score a complete build for a use case + resolution via the evaluator Lambda. */
export async function evaluateBuild(
  build: BuildSelection,
  useCase: UseCase,
  resolution: Resolution,
): Promise<EvaluateResult> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ build, use_case: useCase, resolution }),
    })
  } catch {
    throw new ApiError(0, 'Network error: could not reach the evaluator')
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Evaluation failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<EvaluateResult>
}