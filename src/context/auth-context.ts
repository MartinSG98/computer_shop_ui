import { createContext, useContext } from 'react'
import type { Role } from '../auth/cognito'

export interface AuthState {
  /** Which demo account is currently signed in. */
  role: Role
  username: string | null
  /** True when signed in as an admin (drives the admin menu + dashboard). */
  isAdmin: boolean
  /** Cognito ID token, sent as the bearer on admin/order calls; null until signed in. */
  idToken: string | null
  /** True while a sign-in (initial load or an account switch) is in flight. */
  switching: boolean
  error: string | null
  /** Sign in as the given demo account. */
  switchTo: (role: Role) => void
}

export const AuthContext = createContext<AuthState | null>(null)

/** Access auth state. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
