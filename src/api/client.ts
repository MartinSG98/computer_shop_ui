import type {
  AdminOverview,
  Category,
  ChatReply,
  EvaluateResult,
  Order,
  OrderItemIn,
  Product,
  Resolution,
  UseCase,
} from './types'
import type { BuildSelection } from '../lib/configurator'

/** API base URL. Defaults to the local backend so the app runs with no config. */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

// Current Cognito ID token, kept module-level so the AuthProvider can set it
// once and every admin call picks it up without threading it through props.
let authToken: string | null = null

/** Set (or clear) the bearer token used on authenticated requests. */
export function setAuthToken(token: string | null): void {
  authToken = token
}

function authHeaders(): Record<string, string> {
  return authToken ? { authorization: `Bearer ${authToken}` } : {}
}

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

/** Maximum message length accepted by POST /chat (mirrored from the backend). */
export const CHAT_MESSAGE_MAX_LENGTH = 500

/**
 * Send one message to the support agent. The session id (one UUID per chat
 * window) is what threads messages into a conversation server-side.
 */
export async function sendChatMessage(message: string, sessionId: string): Promise<ChatReply> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
    })
  } catch {
    throw new ApiError(0, 'Network error: could not reach the API')
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Chat failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<ChatReply>
}

/** Place an order. The server resolves prices from the catalog; `username` is
 *  the frontend's best-effort label (checkout is a public route). */
export async function createOrder(items: OrderItemIn[], username: string | null): Promise<Order> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items, username }),
    })
  } catch {
    throw new ApiError(0, 'Network error: could not reach the API')
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Checkout failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<Order>
}

/** Admin GET behind the Cognito authorizer; sends the ID token as a bearer. */
async function authedRequest<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() })
  } catch {
    throw new ApiError(0, 'Network error: could not reach the API')
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<T>
}

/** Sales dashboard metrics (admins only). */
export function getAdminOverview(): Promise<AdminOverview> {
  return authedRequest<AdminOverview>('/admin/overview')
}

/** Recent orders, most recent first (admins only). */
export function getAdminOrders(): Promise<Order[]> {
  return authedRequest<Order[]>('/admin/orders')
}

/** Score a complete build for a use case + resolution via the evaluator Lambda. */
export async function scoreBuild(
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